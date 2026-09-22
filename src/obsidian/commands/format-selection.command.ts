import type { Command, Editor } from 'obsidian';
import type { JsonService } from '../../core/services/json-service';
import type { FormatOptions } from '../../core/contracts/format-options.interface';
import type { NoticeHelper } from '../utils/notice-helper';

export function createFormatSelectionCommand(
	jsonService: JsonService,
	getFormatOptions: () => FormatOptions,
	noticeHelper: NoticeHelper
): Command {
	return {
		id: 'format-selection',
		name: 'JSON: Format Selection',
		editorCallback: (editor: Editor) => {
			const selection = editor.getSelection();

			if (!selection || selection.trim().length === 0) {
				noticeHelper.showInfo(
					'No text selected. Select a JSON string to format, or use "Format Block under Cursor".'
				);
				return;
			}

			const options = getFormatOptions();
			const result = jsonService.format(selection, options);

			if (result.success && result.data !== undefined) {
				editor.replaceSelection(result.data);
				noticeHelper.showSuccess('Selection formatted successfully');
			} else {
				noticeHelper.showError('Formatting failed', result.error);
			}
		},
	};
}
