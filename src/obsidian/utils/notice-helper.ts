import { Notice } from 'obsidian';
import type { EngineError } from '../../core/contracts/json-engine.interface';

export class NoticeHelper {
	constructor(private getNotifyOnSuccess: () => boolean) {}

	showError(prefix: string, error?: EngineError): void {
		let message = prefix;
		if (error) {
			const pos = error.line !== undefined ? ` (line ${error.line}, col ${error.column ?? 1})` : '';
			message = `${prefix}${pos}: ${error.message}`;
		}
		new Notice(`JSON Toolkit: ${message}`, 6000);
	}

	showSuccess(message: string, force = false): void {
		if (force || this.getNotifyOnSuccess()) {
			new Notice(`JSON Toolkit: ${message}`, 3000);
		}
	}

	showInfo(message: string): void {
		new Notice(`JSON Toolkit: ${message}`, 4000);
	}
}
