import { App, PluginSettingTab, Setting } from 'obsidian';
import type { EngineId } from '../../core/contracts/json-engine.interface';
import type { PluginSettings } from './plugin-settings';

export interface IPluginWithSettings {
	settings: PluginSettings;
	saveSettings(): Promise<void>;
	onEngineChanged(engineId: EngineId): void;
}

export class JsonToolkitSettingTab extends PluginSettingTab {
	private pluginInstance: IPluginWithSettings;

	constructor(app: App, plugin: IPluginWithSettings) {
		super(app, plugin as any);
		this.pluginInstance = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Active parser engine')
			.setDesc(
				'Choose the engine. JSONC (VS Code parser) preserves comments (//, /* */); JSON5 supports unquoted keys, trailing commas, and hexadecimal.'
			)
			.addDropdown((dropdown) => {
				dropdown
					.addOption('jsonc', 'JSONC (VS Code parser - preserves comments)')
					.addOption('json5', 'JSON5 (Flexible syntax)')
					.setValue(this.pluginInstance.settings.selectedEngine)
					.onChange(async (value) => {
						const engineId = value as EngineId;
						this.pluginInstance.settings.selectedEngine = engineId;
						this.pluginInstance.onEngineChanged(engineId);
						await this.pluginInstance.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Indent size')
			.setDesc('Number of spaces to use for indentation when tabs are not used.')
			.addDropdown((dropdown) => {
				dropdown
					.addOption('2', '2 spaces')
					.addOption('4', '4 spaces')
					.setValue(String(this.pluginInstance.settings.indentSize))
					.onChange(async (value) => {
						this.pluginInstance.settings.indentSize = parseInt(value, 10);
						await this.pluginInstance.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Use tabs')
			.setDesc('Indent with tabs instead of spaces.')
			.addToggle((toggle) => {
				toggle
					.setValue(this.pluginInstance.settings.useTabs)
					.onChange(async (value) => {
						this.pluginInstance.settings.useTabs = value;
						await this.pluginInstance.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Sort keys')
			.setDesc('Sort object keys alphabetically.')
			.addToggle((toggle) => {
				toggle
					.setValue(this.pluginInstance.settings.sortKeys)
					.onChange(async (value) => {
						this.pluginInstance.settings.sortKeys = value;
						await this.pluginInstance.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Notify on success')
			.setDesc('Display a notification banner whenever formatting or minifying succeeds.')
			.addToggle((toggle) => {
				toggle
					.setValue(this.pluginInstance.settings.notifyOnSuccess)
					.onChange(async (value) => {
						this.pluginInstance.settings.notifyOnSuccess = value;
						await this.pluginInstance.saveSettings();
					});
			});
	}
}
