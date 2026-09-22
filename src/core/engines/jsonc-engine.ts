import {
	format,
	applyEdits,
	parse,
	ParseError,
	printParseErrorCode,
	stripComments,
} from 'jsonc-parser';
import type { IJsonEngine, FormatOptions, EngineResult, EngineError } from '../contracts/json-engine.interface';

function getLineAndColumn(text: string, offset: number): { line: number; column: number } {
	let line = 1;
	let lastLineStart = 0;
	const maxOffset = Math.min(offset, text.length);
	for (let i = 0; i < maxOffset; i++) {
		if (text[i] === '\n') {
			line++;
			lastLineStart = i + 1;
		}
	}
	const column = offset - lastLineStart + 1;
	return { line, column };
}

const ERROR_CODE_DESCRIPTIONS: Record<number, string> = {
	1: 'Invalid symbol',
	2: 'Invalid number format',
	3: 'Property name expected',
	4: 'Value expected',
	5: 'Colon expected',
	6: 'Comma expected',
	7: 'Closing brace expected',
	8: 'Closing bracket expected',
	9: 'End of file expected',
	10: 'Invalid comment token',
	11: 'Unexpected end of comment',
	12: 'Unexpected end of string',
	13: 'Unexpected end of number',
	14: 'Invalid unicode sequence',
	15: 'Invalid escape character',
	16: 'Invalid character',
};

function formatParseErrorCode(code: number): string {
	if (ERROR_CODE_DESCRIPTIONS[code]) {
		return ERROR_CODE_DESCRIPTIONS[code];
	}
	try {
		return printParseErrorCode(code as any);
	} catch {
		return 'Syntax error';
	}
}

function sortKeysDeep(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(sortKeysDeep);
	}
	if (value !== null && typeof value === 'object') {
		const sortedObj: Record<string, unknown> = {};
		const keys = Object.keys(value as Record<string, unknown>).sort();
		for (const key of keys) {
			sortedObj[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
		}
		return sortedObj;
	}
	return value;
}

export class JsoncEngine implements IJsonEngine {
	readonly id = 'jsonc' as const;
	readonly name = 'JSONC (VS Code parser)';

	private validate(input: string): { valid: true; parsed: unknown } | { valid: false; error: EngineError } {
		const errors: ParseError[] = [];
		const parsed = parse(input, errors, { allowTrailingComma: true });

		if (errors.length > 0) {
			const firstErr = errors[0]!;
			const { line, column } = getLineAndColumn(input, firstErr.offset);
			return {
				valid: false,
				error: {
					message: formatParseErrorCode(firstErr.error),
					line,
					column,
				},
			};
		}

		return { valid: true, parsed };
	}

	format(input: string, options: FormatOptions): EngineResult {
		const validation = this.validate(input);
		if (!validation.valid) {
			return {
				success: false,
				error: validation.error,
			};
		}

		if (options.sortKeys) {
			const sorted = sortKeysDeep(validation.parsed);
			const indent = options.useTabs ? '\t' : ' '.repeat(options.indentSize);
			return {
				success: true,
				data: JSON.stringify(sorted, null, indent),
			};
		}

		try {
			const edits = format(input, undefined, {
				insertSpaces: !options.useTabs,
				tabSize: options.indentSize,
				eol: '\n',
			});
			const formatted = applyEdits(input, edits);

			return {
				success: true,
				data: formatted,
			};
		} catch (err: unknown) {
			return {
				success: false,
				error: {
					message: err instanceof Error ? err.message : String(err),
				},
			};
		}
	}

	minify(input: string): EngineResult {
		const validation = this.validate(input);
		if (!validation.valid) {
			return {
				success: false,
				error: validation.error,
			};
		}

		try {
			// Strips comments and serializes compact JSON representation
			const stripped = stripComments(input);
			const parsed = JSON.parse(stripped);
			return {
				success: true,
				data: JSON.stringify(parsed),
			};
		} catch {
			// Fallback to stringifying the parsed AST object
			return {
				success: true,
				data: JSON.stringify(validation.parsed),
			};
		}
	}
}
