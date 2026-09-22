import type { FormatOptions, EngineResult, EngineError } from './format-options.interface';

export type EngineId = 'json5' | 'jsonc';

export interface IJsonEngine {
	readonly id: EngineId;
	readonly name: string;
	format(input: string, options: FormatOptions): EngineResult;
	minify(input: string): EngineResult;
}

export type { FormatOptions, EngineResult, EngineError };
