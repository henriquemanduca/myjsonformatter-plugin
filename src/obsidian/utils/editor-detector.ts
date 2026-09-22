export interface IEditorPosition {
	line: number;
	ch: number;
}

export interface IEditorLike {
	getCursor(): IEditorPosition;
	lineCount(): number;
	getLine(line: number): string;
	getSelection(): string;
	replaceRange(replacement: string, from: IEditorPosition, to?: IEditorPosition): void;
	replaceSelection(replacement: string): void;
}

export interface JsonCodeBlock {
	startLine: number;
	endLine: number;
	lang: string;
	content: string;
	from: IEditorPosition;
	to: IEditorPosition;
	isEmpty: boolean;
}

const SUPPORTED_LANGS = new Set(['json', 'jsonc', 'json5']);

export function findJsonBlockUnderCursor(editor: IEditorLike): JsonCodeBlock | null {
	const cursor = editor.getCursor();
	const totalLines = editor.lineCount();
	const cursorLine = cursor.line;

	let inBlock = false;
	let blockStartLine = -1;
	let blockLang = '';
	let fenceMarker = '';

	for (let i = 0; i < totalLines; i++) {
		const line = editor.getLine(i);

		if (!inBlock) {
			const match = line.match(/^(\s*)(```+|~~~+)([\w-]+)?\s*$/);
			if (match && match[2]) {
				inBlock = true;
				blockStartLine = i;
				fenceMarker = match[2];
				blockLang = (match[3] || '').toLowerCase();
			}
		} else {
			const closeMatch = line.match(/^(\s*)(```+|~~~+)\s*$/);
			if (closeMatch && closeMatch[2] && closeMatch[2].length >= fenceMarker.length && closeMatch[2][0] === fenceMarker[0]) {
				const blockEndLine = i;
				inBlock = false;

				if (cursorLine >= blockStartLine && cursorLine <= blockEndLine) {
					if (!SUPPORTED_LANGS.has(blockLang)) {
						return null;
					}

					const isEmpty = blockStartLine + 1 >= blockEndLine;
					if (isEmpty) {
						return {
							startLine: blockStartLine,
							endLine: blockEndLine,
							lang: blockLang,
							content: '',
							from: { line: blockStartLine + 1, ch: 0 },
							to: { line: blockStartLine + 1, ch: 0 },
							isEmpty: true,
						};
					}

					const contentLines: string[] = [];
					for (let lineIdx = blockStartLine + 1; lineIdx < blockEndLine; lineIdx++) {
						contentLines.push(editor.getLine(lineIdx));
					}
					const content = contentLines.join('\n');
					const lastLineLen = editor.getLine(blockEndLine - 1).length;

					return {
						startLine: blockStartLine,
						endLine: blockEndLine,
						lang: blockLang,
						content,
						from: { line: blockStartLine + 1, ch: 0 },
						to: { line: blockEndLine - 1, ch: lastLineLen },
						isEmpty: false,
					};
				}
			}
		}
	}

	return null;
}
