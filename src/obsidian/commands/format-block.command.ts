import type { Command, Editor } from 'obsidian';
import type { JsonService } from '../../core/services/json-service';
import type { FormatOptions } from '../../core/contracts/format-options.interface';
import type { NoticeHelper } from '../utils/notice-helper';
import { findJsonBlockUnderCursor } from '../utils/editor-detector';

export function createFormatBlockCommand(
	jsonService: JsonService,
	getFormatOptions: () => FormatOptions,
	noticeHelper: NoticeHelper
): Command {
	return {
		id: 'format-block-under-cursor',
		name: 'JSON: Format Block under Cursor',
		editorCallback: (editor: Editor) => {
			const block = findJsonBlockUnderCursor(editor);

			if (!block) {
				noticeHelper.showInfo('No JSON code block (```json) found under cursor.');
				return;
			}

			if (block.isEmpty || block.content.trim().length === 0) {
				noticeHelper.showInfo('JSON code block is empty.');
				return;
			}

			const options = getFormatOptions();
			const result = jsonService.format(block.content, options);

			if (result.success && result.data !== undefined) {
				editor.replaceRange(result.data, block.from, block.to);
				noticeHelper.showSuccess('JSON block formatted successfully');
			} else {
				noticeHelper.showError('Formatting block failed', result.error);
			}
		},
	};
}
