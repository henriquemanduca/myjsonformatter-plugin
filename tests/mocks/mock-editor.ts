import type { IEditorLike, IEditorPosition } from '../../src/obsidian/utils/editor-detector';

export class MockEditor implements IEditorLike {
	private lines: string[];
	private cursor: IEditorPosition;
	private selection: string;

	constructor(initialText: string, cursor: IEditorPosition = { line: 0, ch: 0 }, selection = '') {
		this.lines = initialText.split('\n');
		this.cursor = cursor;
		this.selection = selection;
	}

	getCursor(): IEditorPosition {
		return { ...this.cursor };
	}

	setCursor(cursor: IEditorPosition): void {
		this.cursor = { ...cursor };
	}

	lineCount(): number {
		return this.lines.length;
	}

	getLine(line: number): string {
		return this.lines[line] ?? '';
	}

	getSelection(): string {
		return this.selection;
	}

	setSelection(selection: string): void {
		this.selection = selection;
	}

	getValue(): string {
		return this.lines.join('\n');
	}

	replaceSelection(replacement: string): void {
		this.selection = replacement;
	}

	replaceRange(replacement: string, from: IEditorPosition, to?: IEditorPosition): void {
		const end = to ?? from;
		const prefix = (this.lines[from.line] ?? '').slice(0, from.ch);
		const suffix = (this.lines[end.line] ?? '').slice(end.ch);

		const newSegment = prefix + replacement + suffix;
		const newSegmentLines = newSegment.split('\n');

		this.lines.splice(from.line, end.line - from.line + 1, ...newSegmentLines);
	}
}
