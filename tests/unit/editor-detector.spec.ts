import { describe, it, expect } from 'vitest';
import { findJsonBlockUnderCursor } from '../../src/obsidian/utils/editor-detector';
import { MockEditor } from '../mocks/mock-editor';

describe('editor-detector', () => {
	it('should detect JSON code block when cursor is inside the block', () => {
		const doc = [
			'# Notes',
			'Some intro text',
			'```json',
			'{',
			'  "hello": "world"',
			'}',
			'```',
			'Outro text',
		].join('\n');

		// Cursor at line 4 (inside JSON block)
		const editor = new MockEditor(doc, { line: 4, ch: 2 });
		const block = findJsonBlockUnderCursor(editor);

		expect(block).not.toBeNull();
		expect(block?.lang).toBe('json');
		expect(block?.startLine).toBe(2);
		expect(block?.endLine).toBe(6);
		expect(block?.content).toBe('{\n  "hello": "world"\n}');
		expect(block?.from).toEqual({ line: 3, ch: 0 });
		expect(block?.to).toEqual({ line: 5, ch: 1 });
		expect(block?.isEmpty).toBe(false);
	});

	it('should detect block when cursor is on opening line', () => {
		const doc = [
			'```json',
			'{"a": 1}',
			'```',
		].join('\n');

		const editor = new MockEditor(doc, { line: 0, ch: 3 });
		const block = findJsonBlockUnderCursor(editor);

		expect(block).not.toBeNull();
		expect(block?.lang).toBe('json');
		expect(block?.content).toBe('{"a": 1}');
	});

	it('should detect block when cursor is on closing line', () => {
		const doc = [
			'```json5',
			'{ a: 1 }',
			'```',
		].join('\n');

		const editor = new MockEditor(doc, { line: 2, ch: 2 });
		const block = findJsonBlockUnderCursor(editor);

		expect(block).not.toBeNull();
		expect(block?.lang).toBe('json5');
		expect(block?.content).toBe('{ a: 1 }');
	});

	it('should detect jsonc code block', () => {
		const doc = [
			'```jsonc',
			'// comment',
			'{"a": 1}',
			'```',
		].join('\n');

		const editor = new MockEditor(doc, { line: 1, ch: 0 });
		const block = findJsonBlockUnderCursor(editor);

		expect(block).not.toBeNull();
		expect(block?.lang).toBe('jsonc');
	});

	it('should return null if block language is not json/jsonc/json5', () => {
		const doc = [
			'```typescript',
			'const x = 1;',
			'```',
		].join('\n');

		const editor = new MockEditor(doc, { line: 1, ch: 0 });
		const block = findJsonBlockUnderCursor(editor);

		expect(block).toBeNull();
	});

	it('should return null when cursor is outside any code block', () => {
		const doc = [
			'Regular markdown line 1',
			'Regular markdown line 2',
			'```json',
			'{}',
			'```',
		].join('\n');

		const editor = new MockEditor(doc, { line: 0, ch: 5 });
		const block = findJsonBlockUnderCursor(editor);

		expect(block).toBeNull();
	});

	it('should select correct block when document contains multiple code blocks', () => {
		const doc = [
			'```python',
			'print("hello")',
			'```',
			'Between blocks',
			'```json',
			'{"target": true}',
			'```',
			'```bash',
			'echo "bye"',
			'```',
		].join('\n');

		const editor = new MockEditor(doc, { line: 5, ch: 3 });
		const block = findJsonBlockUnderCursor(editor);

		expect(block).not.toBeNull();
		expect(block?.lang).toBe('json');
		expect(block?.content).toBe('{"target": true}');
	});

	it('should handle empty JSON code block', () => {
		const doc = [
			'```json',
			'```',
		].join('\n');

		const editor = new MockEditor(doc, { line: 0, ch: 0 });
		const block = findJsonBlockUnderCursor(editor);

		expect(block).not.toBeNull();
		expect(block?.isEmpty).toBe(true);
		expect(block?.content).toBe('');
	});
});
