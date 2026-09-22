import type { IJsonEngine, EngineId, FormatOptions, EngineResult } from '../contracts/json-engine.interface';

export class JsonService {
	private engines: Map<EngineId, IJsonEngine> = new Map();
	private activeEngineId: EngineId = 'jsonc';

	constructor(engines: IJsonEngine[] = [], defaultEngineId: EngineId = 'jsonc') {
		for (const engine of engines) {
			this.registerEngine(engine);
		}
		if (this.engines.has(defaultEngineId)) {
			this.activeEngineId = defaultEngineId;
		}
	}

	registerEngine(engine: IJsonEngine): void {
		this.engines.set(engine.id, engine);
	}

	getEngine(id: EngineId): IJsonEngine | undefined {
		return this.engines.get(id);
	}

	getAllEngines(): IJsonEngine[] {
		return Array.from(this.engines.values());
	}

	setActiveEngine(id: EngineId): void {
		if (!this.engines.has(id)) {
			throw new Error(`Engine with ID "${id}" is not registered.`);
		}
		this.activeEngineId = id;
	}

	getActiveEngineId(): EngineId {
		return this.activeEngineId;
	}

	getActiveEngine(): IJsonEngine {
		const engine = this.engines.get(this.activeEngineId);
		if (!engine) {
			throw new Error(`Active engine "${this.activeEngineId}" is not registered.`);
		}
		return engine;
	}

	format(input: string, options: FormatOptions, engineId?: EngineId): EngineResult {
		const engine = engineId ? this.getEngine(engineId) : this.getActiveEngine();
		if (!engine) {
			return {
				success: false,
				error: {
					message: `Engine "${engineId ?? this.activeEngineId}" not found.`,
				},
			};
		}
		return engine.format(input, options);
	}

	minify(input: string, engineId?: EngineId): EngineResult {
		const engine = engineId ? this.getEngine(engineId) : this.getActiveEngine();
		if (!engine) {
			return {
				success: false,
				error: {
					message: `Engine "${engineId ?? this.activeEngineId}" not found.`,
				},
			};
		}
		return engine.minify(input);
	}
}
