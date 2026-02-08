import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render } from '../../../test/test-utils';
import MessageInput from '../MessageInput';

describe('MessageInput', () => {
  it('入力フィールドが表示される', () => {
    render(<MessageInput onSend={() => {}} />);
    expect(screen.getByPlaceholderText('メッセージを入力...')).toBeInTheDocument();
  });

  it('送信ボタンをクリックするとonSendが呼ばれる', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('メッセージを入力...');
    await user.type(input, 'Hello World');

    const sendButton = screen.getByRole('button');
    await user.click(sendButton);

    expect(onSend).toHaveBeenCalledWith('Hello World');
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('送信後に入力フィールドがクリアされる', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={() => {}} />);

    const input = screen.getByPlaceholderText('メッセージを入力...') as HTMLTextAreaElement;
    await user.type(input, 'Test message');
    await user.click(screen.getByRole('button'));

    expect(input.value).toBe('');
  });

  it('空白のみの入力では送信されない', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('メッセージを入力...');
    await user.type(input, '   ');
    await user.click(screen.getByRole('button'));

    expect(onSend).not.toHaveBeenCalled();
  });

  it('Cmd+Enter（Mac）で送信できる', async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('メッセージを入力...');
    await userEvent.type(input, 'Quick send');

    fireEvent.keyDown(input, { key: 'Enter', metaKey: true });

    expect(onSend).toHaveBeenCalledWith('Quick send');
  });

  it('Ctrl+Enter（Windows/Linux）で送信できる', async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('メッセージを入力...');
    await userEvent.type(input, 'Quick send');

    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });

    expect(onSend).toHaveBeenCalledWith('Quick send');
  });

  it('disabled=trueのとき、入力と送信ができない', () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} disabled />);

    const input = screen.getByPlaceholderText('メッセージを入力...');
    const sendButton = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('空の入力では送信ボタンがdisabled', () => {
    render(<MessageInput onSend={() => {}} />);

    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeDisabled();
  });

  it('入力があるときは送信ボタンが有効', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={() => {}} />);

    const input = screen.getByPlaceholderText('メッセージを入力...');
    const sendButton = screen.getByRole('button');

    expect(sendButton).toBeDisabled();

    await user.type(input, 'Test');

    expect(sendButton).not.toBeDisabled();
  });
});
