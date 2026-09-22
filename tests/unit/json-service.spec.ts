import { describe, it, expect } from 'vitest';
import { JsonService } from '../../src/core/services/json-service';
import { Json5Engine } from '../../src/core/engines/json5-engine';
import { JsoncEngine } from '../../src/core/engines/jsonc-engine';

describe('JsonService', () => {
	it('should register engines and select default active engine', () => {
		const json5 = new Json5Engine();
		const jsonc = new JsoncEngine();
		const service = new JsonService([jsonc, json5], 'jsonc');

		expect(service.getActiveEngineId()).toBe('jsonc');
		expect(service.getActiveEngine().id).toBe('jsonc');
		expect(service.getAllEngines()).toHaveLength(2);
	});

	it('should switch active engine', () => {
		const json5 = new Json5Engine();
		const jsonc = new JsoncEngine();
		const service = new JsonService([jsonc, json5], 'jsonc');

		service.setActiveEngine('json5');
		expect(service.getActiveEngineId()).toBe('json5');
		expect(service.getActiveEngine().id).toBe('json5');
	});

	it('should throw when setting unregistered engine as active', () => {
		const service = new JsonService();
		expect(() => service.setActiveEngine('json5')).toThrow();
	});

	it('should delegate format and minify to active engine', () => {
		const json5 = new Json5Engine();
		const jsonc = new JsoncEngine();
		const service = new JsonService([jsonc, json5], 'jsonc');

		const formatResult = service.format('{"a":1}', { indentSize: 2, useTabs: false });
		expect(formatResult.success).toBe(true);

		const minifyResult = service.minify('{\n  "a": 1\n}');
		expect(minifyResult.success).toBe(true);
		expect(minifyResult.data).toBe('{"a":1}');
	});

	it('should delegate format to specific engine when specified', () => {
		const json5 = new Json5Engine();
		const jsonc = new JsoncEngine();
		const service = new JsonService([jsonc, json5], 'jsonc');

		// JSON5 relaxed syntax fails in strict JSONC if unquoted keys
		const relaxed = '{ unquotedKey: 123 }';

		const jsoncResult = service.format(relaxed, { indentSize: 2, useTabs: false }, 'jsonc');
		expect(jsoncResult.success).toBe(false);

		const json5Result = service.format(relaxed, { indentSize: 2, useTabs: false }, 'json5');
		expect(json5Result.success).toBe(true);

		const unknownFormat = service.format('{}', { indentSize: 2, useTabs: false }, 'unknown' as any);
		expect(unknownFormat.success).toBe(false);
		expect(unknownFormat.error?.message).toContain('not found');

		const unknownMinify = service.minify('{}', 'unknown' as any);
		expect(unknownMinify.success).toBe(false);
		expect(unknownMinify.error?.message).toContain('not found');
	});

	it('should throw if getActiveEngine is called when no engine registered', () => {
		const service = new JsonService();
		expect(() => service.getActiveEngine()).toThrow('is not registered');
	});
});
