import type { EngineId } from '../../core/contracts/json-engine.interface';

export interface PluginSettings {
	selectedEngine: EngineId;
	indentSize: number;
	useTabs: boolean;
	sortKeys: boolean;
	notifyOnSuccess: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	selectedEngine: 'jsonc',
	indentSize: 2,
	useTabs: false,
	sortKeys: false,
	notifyOnSuccess: false,
};
