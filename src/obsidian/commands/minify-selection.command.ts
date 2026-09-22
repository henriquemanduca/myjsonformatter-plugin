import type { Command, Editor } from 'obsidian';
import type { JsonService } from '../../core/services/json-service';
import type { NoticeHelper } from '../utils/notice-helper';
import { findJsonBlockUnderCursor } from '../utils/editor-detector';

export function createMinifyCommand(
	jsonService: JsonService,
	noticeHelper: NoticeHelper
): Command {
	return {
		id: 'minify-json',
		name: 'JSON: Minify Selection / Block',
		editorCallback: (editor: Editor) => {
			const selection = editor.getSelection();

			if (selection && selection.trim().length > 0) {
				const result = jsonService.minify(selection);
				if (result.success && result.data !== undefined) {
					editor.replaceSelection(result.data);
					noticeHelper.showSuccess('Selection minified successfully');
				} else {
					noticeHelper.showError('Minification failed', result.error);
				}
				return;
			}

			const block = findJsonBlockUnderCursor(editor);
			if (block) {
				if (block.isEmpty || block.content.trim().length === 0) {
					noticeHelper.showInfo('JSON code block is empty.');
					return;
				}

				const result = jsonService.minify(block.content);
				if (result.success && result.data !== undefined) {
					editor.replaceRange(result.data, block.from, block.to);
					noticeHelper.showSuccess('JSON block minified successfully');
				} else {
					noticeHelper.showError('Minification failed', result.error);
				}
				return;
			}

			noticeHelper.showInfo(
				'Select JSON text or place cursor inside a JSON code block to minify.'
			);
		},
	};
}
