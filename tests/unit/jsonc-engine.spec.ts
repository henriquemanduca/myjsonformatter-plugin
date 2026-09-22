import { describe, it, expect } from 'vitest';
import { JsoncEngine } from '../../src/core/engines/jsonc-engine';

describe('JsoncEngine', () => {
	const engine = new JsoncEngine();

	it('should identify as jsonc engine', () => {
		expect(engine.id).toBe('jsonc');
		expect(engine.name).toBe('JSONC (VS Code parser)');
	});

	it('should format standard JSON with specified indent size', () => {
		const input = '{"b":2,"a":1}';
		const result = engine.format(input, { indentSize: 2, useTabs: false });

		expect(result.success).toBe(true);
		expect(result.data).toBe('{\n  "b": 2,\n  "a": 1\n}');
	});

	it('should format with 4 spaces', () => {
		const input = '{"a":1}';
		const result = engine.format(input, { indentSize: 4, useTabs: false });

		expect(result.success).toBe(true);
		expect(result.data).toBe('{\n    "a": 1\n}');
	});

	it('should format with tabs when useTabs is true', () => {
		const input = '{"a":1}';
		const result = engine.format(input, { indentSize: 2, useTabs: true });

		expect(result.success).toBe(true);
		expect(result.data).toBe('{\n\t"a": 1\n}');
	});

	it('should preserve single-line (//) and multi-line (/* */) comments intact', () => {
		const input = `{
// Configuration header
"server": "localhost", /* host */
"port": 8080 // port number
}`;
		const result = engine.format(input, { indentSize: 2, useTabs: false });

		expect(result.success).toBe(true);
		expect(result.data).toContain('// Configuration header');
		expect(result.data).toContain('/* host */');
		expect(result.data).toContain('// port number');
	});

	it('should preserve trailing commas', () => {
		const input = '{\n  "a": 1,\n  "b": 2,\n}';
		const result = engine.format(input, { indentSize: 2, useTabs: false });

		expect(result.success).toBe(true);
		expect(result.data).toContain('"b": 2,');
	});

	it('should sort keys recursively when sortKeys is true', () => {
		const input = '{"z": 1, "a": {"d": 4, "b": 2}}';
		const result = engine.format(input, { indentSize: 2, useTabs: false, sortKeys: true });

		expect(result.success).toBe(true);
		expect(result.data).toBe('{\n  "a": {\n    "b": 2,\n    "d": 4\n  },\n  "z": 1\n}');
	});

	it('should return error with line and column for invalid JSONC syntax', () => {
		const input = '{\n  "key": \n}';
		const result = engine.format(input, { indentSize: 2, useTabs: false });

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
		expect(result.error?.message).toBeDefined();
		expect(result.error?.line).toBe(3);
		expect(result.error?.column).toBeDefined();
	});

	it('should minify JSONC payloads by stripping comments and whitespace', () => {
		const input = `{
			// A comment
			"name": "Obsidian",
			/* another comment */
			"count": 10
		}`;
		const result = engine.minify(input);

		expect(result.success).toBe(true);
		expect(result.data).toBe('{"name":"Obsidian","count":10}');
	});

	it('should return error on minify when syntax is invalid', () => {
		const input = '{"unterminated string';
		const result = engine.minify(input);

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
	});

	it('should be idempotent (NFR-03)', () => {
		const input = '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}';
		const options = { indentSize: 2, useTabs: false };
		const firstPass = engine.format(input, options);
		expect(firstPass.success).toBe(true);

		const secondPass = engine.format(firstPass.data!, options);
		expect(secondPass.success).toBe(true);
		expect(secondPass.data).toBe(firstPass.data);
	});
});
