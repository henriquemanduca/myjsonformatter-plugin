import { Plugin } from 'obsidian';
import { Json5Engine } from './core/engines/json5-engine';
import { JsoncEngine } from './core/engines/jsonc-engine';
import { JsonService } from './core/services/json-service';
import type { EngineId, FormatOptions } from './core/contracts/json-engine.interface';
import { DEFAULT_SETTINGS, type PluginSettings } from './obsidian/settings/plugin-settings';
import { JsonToolkitSettingTab, type IPluginWithSettings } from './obsidian/settings/settings-tab';
import { NoticeHelper } from './obsidian/utils/notice-helper';
import { createFormatSelectionCommand } from './obsidian/commands/format-selection.command';
import { createFormatBlockCommand } from './obsidian/commands/format-block.command';
import { createMinifyCommand } from './obsidian/commands/minify-selection.command';

export default class JsonToolkitPlugin extends Plugin implements IPluginWithSettings {
	settings: PluginSettings = DEFAULT_SETTINGS;
	jsonService: JsonService = new JsonService();
	noticeHelper: NoticeHelper = new NoticeHelper(() => this.settings.notifyOnSuccess);

	async onload(): Promise<void> {
		await this.loadSettings();

		const json5Engine = new Json5Engine();
		const jsoncEngine = new JsoncEngine();

		this.jsonService = new JsonService([jsoncEngine, json5Engine], this.settings.selectedEngine);
		this.noticeHelper = new NoticeHelper(() => this.settings.notifyOnSuccess);

		const getFormatOptions = (): FormatOptions => ({
			indentSize: this.settings.indentSize,
			useTabs: this.settings.useTabs,
			sortKeys: this.settings.sortKeys,
		});

		// Register commands
		this.addCommand(createFormatSelectionCommand(this.jsonService, getFormatOptions, this.noticeHelper));
		this.addCommand(createFormatBlockCommand(this.jsonService, getFormatOptions, this.noticeHelper));
		this.addCommand(createMinifyCommand(this.jsonService, this.noticeHelper));

		// Register setting tab
		this.addSettingTab(new JsonToolkitSettingTab(this.app, this));
	}

	onEngineChanged(engineId: EngineId): void {
		this.jsonService.setActiveEngine(engineId);
	}

	async loadSettings(): Promise<void> {
		const loadedData: unknown = await this.loadData();
		const savedSettings = (typeof loadedData === 'object' && loadedData !== null ? loadedData : {}) as Partial<PluginSettings>;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, savedSettings);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
