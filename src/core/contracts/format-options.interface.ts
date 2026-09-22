export interface FormatOptions {
	indentSize: number;
	useTabs: boolean;
	sortKeys?: boolean;
}

export interface EngineError {
	message: string;
	line?: number;
	column?: number;
}

export interface EngineResult {
	success: boolean;
	data?: string;
	error?: EngineError;
}
