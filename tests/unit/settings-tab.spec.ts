import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JsonToolkitSettingTab, type IPluginWithSettings } from '../../src/obsidian/settings/settings-tab';
import { DEFAULT_SETTINGS } from '../../src/obsidian/settings/plugin-settings';

// Mock obsidian classes
vi.mock('obsidian', () => {
	class MockSettingTab {
		app: unknown;
		plugin: unknown;
		containerEl: { empty: ReturnType<typeof vi.fn> };

		constructor(app: unknown, plugin: unknown) {
			this.app = app;
			this.plugin = plugin;
			this.containerEl = { empty: vi.fn() };
		}
	}

	class MockPluginSettingTab extends MockSettingTab {}

	class MockSetting {
		setName = vi.fn().mockReturnThis();
		setDesc = vi.fn().mockReturnThis();
		addDropdown = vi.fn((cb: (dropdown: any) => void) => {
			cb({
				addOption: vi.fn().mockReturnThis(),
				setValue: vi.fn().mockReturnThis(),
				onChange: vi.fn().mockReturnThis(),
			});
			return this;
		});
		addToggle = vi.fn((cb: (toggle: any) => void) => {
			cb({
				setValue: vi.fn().mockReturnThis(),
				onChange: vi.fn().mockReturnThis(),
			});
			return this;
		});
	}

	return {
		PluginSettingTab: MockPluginSettingTab,
		Setting: MockSetting,
		App: vi.fn(),
		Plugin: vi.fn(),
	};
});

describe('JsonToolkitSettingTab', () => {
	let mockPlugin: IPluginWithSettings;
	let settingTab: JsonToolkitSettingTab;

	beforeEach(() => {
		mockPlugin = {
			settings: { ...DEFAULT_SETTINGS },
			saveSettings: vi.fn().mockResolvedValue(undefined),
			onEngineChanged: vi.fn(),
		} as unknown as IPluginWithSettings;

		settingTab = new JsonToolkitSettingTab({} as any, mockPlugin);
	});

	it('returns declarative setting definitions', () => {
		const defs = settingTab.getSettingDefinitions();
		expect(defs).toHaveLength(5);

		const names = defs.map((d: any) => d.name);
		expect(names).toEqual([
			'Active parser engine',
			'Indent size',
			'Use tabs',
			'Sort keys',
			'Notify on success',
		]);
	});

	it('reads control values correctly via getControlValue', () => {
		mockPlugin.settings.selectedEngine = 'json5';
		mockPlugin.settings.indentSize = 4;
		mockPlugin.settings.useTabs = true;
		mockPlugin.settings.sortKeys = true;
		mockPlugin.settings.notifyOnSuccess = false;

		expect(settingTab.getControlValue('selectedEngine')).toBe('json5');
		expect(settingTab.getControlValue('indentSize')).toBe('4');
		expect(settingTab.getControlValue('useTabs')).toBe(true);
		expect(settingTab.getControlValue('sortKeys')).toBe(true);
		expect(settingTab.getControlValue('notifyOnSuccess')).toBe(false);
		expect(settingTab.getControlValue('unknownKey')).toBeUndefined();
	});

	it('updates selectedEngine and triggers onEngineChanged via setControlValue', async () => {
		await settingTab.setControlValue('selectedEngine', 'json5');

		expect(mockPlugin.settings.selectedEngine).toBe('json5');
		expect(mockPlugin.onEngineChanged).toHaveBeenCalledWith('json5');
		expect(mockPlugin.saveSettings).toHaveBeenCalled();
	});

	it('updates indentSize via setControlValue', async () => {
		await settingTab.setControlValue('indentSize', '4');

		expect(mockPlugin.settings.indentSize).toBe(4);
		expect(mockPlugin.saveSettings).toHaveBeenCalled();
	});

	it('updates boolean toggles via setControlValue', async () => {
		await settingTab.setControlValue('useTabs', true);
		expect(mockPlugin.settings.useTabs).toBe(true);

		await settingTab.setControlValue('sortKeys', true);
		expect(mockPlugin.settings.sortKeys).toBe(true);

		await settingTab.setControlValue('notifyOnSuccess', false);
		expect(mockPlugin.settings.notifyOnSuccess).toBe(false);

		expect(mockPlugin.saveSettings).toHaveBeenCalledTimes(3);
	});

	it('calls display and empties containerEl for legacy imperative rendering', () => {
		settingTab.display();
		expect(settingTab.containerEl.empty).toHaveBeenCalled();
	});
});
