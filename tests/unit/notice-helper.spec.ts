import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoticeHelper } from '../../src/obsidian/utils/notice-helper';
import { Notice } from 'obsidian';

vi.mock('obsidian', () => {
	return {
		Notice: vi.fn(),
	};
});

describe('NoticeHelper', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should show error with line and column information', () => {
		const helper = new NoticeHelper(() => true);
		helper.showError('Formatting error', {
			message: 'Unexpected token',
			line: 5,
			column: 12,
		});

		expect(Notice).toHaveBeenCalledWith(
			'JSON Toolkit: Formatting error (line 5, col 12): Unexpected token',
			6000
		);
	});

	it('should show error without line and column when missing', () => {
		const helper = new NoticeHelper(() => false);
		helper.showError('Something failed');

		expect(Notice).toHaveBeenCalledWith('JSON Toolkit: Something failed', 6000);
	});

	it('should show success only when notifyOnSuccess returns true', () => {
		let notify = false;
		const helper = new NoticeHelper(() => notify);

		helper.showSuccess('All good');
		expect(Notice).not.toHaveBeenCalled();

		notify = true;
		helper.showSuccess('All good');
		expect(Notice).toHaveBeenCalledWith('JSON Toolkit: All good', 3000);
	});

	it('should force show success when force flag is true', () => {
		const helper = new NoticeHelper(() => false);

		helper.showSuccess('Forced success', true);
		expect(Notice).toHaveBeenCalledWith('JSON Toolkit: Forced success', 3000);
	});

	it('should show info message', () => {
		const helper = new NoticeHelper(() => false);

		helper.showInfo('Informative notice');
		expect(Notice).toHaveBeenCalledWith('JSON Toolkit: Informative notice', 4000);
	});
});
