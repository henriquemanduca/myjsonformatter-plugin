import JSON5 from 'json5';
import type { IJsonEngine, FormatOptions, EngineResult, EngineError } from '../contracts/json-engine.interface';

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

function parseJson5Error(err: unknown): EngineError {
	if (err instanceof Error) {
		const errorObj = err as Error & { lineNumber?: number; columnNumber?: number };
		let line = errorObj.lineNumber;
		let column = errorObj.columnNumber;

		if (line === undefined || column === undefined) {
			const match = err.message.match(/at (\d+):(\d+)/);
			if (match && match[1] && match[2]) {
				line = parseInt(match[1], 10);
				column = parseInt(match[2], 10);
			}
		}

		return {
			message: err.message,
			line,
			column,
		};
	}

	return {
		message: String(err),
	};
}

export class Json5Engine implements IJsonEngine {
	readonly id = 'json5' as const;
	readonly name = 'JSON5';

	format(input: string, options: FormatOptions): EngineResult {
		try {
			const parsed = JSON5.parse(input);
			const valueToFormat = options.sortKeys ? sortKeysDeep(parsed) : parsed;
			const indent = options.useTabs ? '\t' : options.indentSize;
			const formatted = JSON5.stringify(valueToFormat, null, indent);

			return {
				success: true,
				data: formatted,
			};
		} catch (err: unknown) {
			return {
				success: false,
				error: parseJson5Error(err),
			};
		}
	}

	minify(input: string): EngineResult {
		try {
			const parsed = JSON5.parse(input);
			const minified = JSON5.stringify(parsed);

			return {
				success: true,
				data: minified,
			};
		} catch (err: unknown) {
			return {
				success: false,
				error: parseJson5Error(err),
			};
		}
	}
}
