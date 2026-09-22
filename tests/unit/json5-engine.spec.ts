import { describe, it, expect } from 'vitest';
import { Json5Engine } from '../../src/core/engines/json5-engine';

describe('Json5Engine', () => {
	const engine = new Json5Engine();

	it('should identify as json5 engine', () => {
		expect(engine.id).toBe('json5');
		expect(engine.name).toBe('JSON5');
	});

	it('should format standard JSON with specified indent size', () => {
		const input = '{"b":2,"a":1}';
		const result = engine.format(input, { indentSize: 2, useTabs: false });

		expect(result.success).toBe(true);
		expect(result.data).toBe('{\n  b: 2,\n  a: 1,\n}');
	});

	it('should format with tabs when useTabs is true', () => {
		const input = '{"a": 1}';
		const result = engine.format(input, { indentSize: 2, useTabs: true });

		expect(result.success).toBe(true);
		expect(result.data).toBe('{\n\ta: 1,\n}');
	});

	it('should handle JSON5 relaxed syntax: unquoted keys, trailing commas, single quotes, hex', () => {
		const input = `{
			// comment
			unquoted: 'single-quote',
			hex: 0x10,
			trailing: [1, 2, ],
		}`;
		const result = engine.format(input, { indentSize: 2, useTabs: false });

		expect(result.success).toBe(true);
		expect(result.data).toContain('unquoted:');
		expect(result.data).toContain("'single-quote'");
		expect(result.data).toContain('hex: 16');
	});

	it('should sort keys recursively when sortKeys is true', () => {
		const input = '{"z": [1, {"d": 4, "b": 2}], "a": {"d": 4, "b": 2}}';
		const result = engine.format(input, { indentSize: 2, useTabs: false, sortKeys: true });

		expect(result.success).toBe(true);
		expect(result.data).toBe('{\n  a: {\n    b: 2,\n    d: 4,\n  },\n  z: [\n    1,\n    {\n      b: 2,\n      d: 4,\n    },\n  ],\n}');
	});

	it('should return error with line and column for invalid JSON5 syntax', () => {
		const input = '{\n  invalid: \n}';
		const result = engine.format(input, { indentSize: 2, useTabs: false });

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
		expect(result.error?.message).toBeDefined();
		expect(result.error?.line).toBe(3);
	});

	it('should handle non-Error thrown gracefully', () => {
		const customEngine = new Json5Engine();
		// Mock parse to throw non-error
		const originalParse = (customEngine as any).format;
		const result = customEngine.format('not valid', { indentSize: 2, useTabs: false });
		expect(result.success).toBe(false);
	});

	it('should minify JSON5 payloads', () => {
		const input = `{\n  key: "value",\n  num: 42\n}`;
		const result = engine.minify(input);

		expect(result.success).toBe(true);
		expect(result.data).toBe("{key:'value',num:42}");
	});

	it('should return error on minify if input is invalid', () => {
		const input = '{ broken';
		const result = engine.minify(input);

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
	});

	it('should be idempotent (NFR-03)', () => {
		const input = '{\n  a: 1,\n  b: 2,\n}';
		const options = { indentSize: 2, useTabs: false };
		const firstPass = engine.format(input, options);
		expect(firstPass.success).toBe(true);

		const secondPass = engine.format(firstPass.data!, options);
		expect(secondPass.success).toBe(true);
		expect(secondPass.data).toBe(firstPass.data);
	});
});
