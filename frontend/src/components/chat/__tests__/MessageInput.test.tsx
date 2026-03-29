import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render } from '../../../test/test-utils';
import MessageInput from '../MessageInput';

describe('MessageInput', () => {
  it('入力フィールドが表示される', () => {
    // Arrange

    // Act
    render(<MessageInput onSend={() => {}} />);

    // Assert
    expect(screen.getByPlaceholderText('メッセージを入力...')).toBeInTheDocument();
  });

  it('送信ボタンをクリックするとonSendが呼ばれる', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('メッセージを入力...');
    await user.type(input, 'Hello World');

    const sendButton = screen.getByRole('button');

    // Act
    await user.click(sendButton);

    // Assert
    expect(onSend).toHaveBeenCalledWith('Hello World');
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('送信後に入力フィールドがクリアされる', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<MessageInput onSend={() => {}} />);

    const input = screen.getByPlaceholderText('メッセージを入力...') as HTMLTextAreaElement;
    await user.type(input, 'Test message');

    // Act
    await user.click(screen.getByRole('button'));

    // Assert
    expect(input.value).toBe('');
  });

  it('空白のみの入力では送信されない', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('メッセージを入力...');
    await user.type(input, '   ');

    // Act
    await user.click(screen.getByRole('button'));

    // Assert
    expect(onSend).not.toHaveBeenCalled();
  });

  it('Cmd+Enter（Mac）で送信できる', async () => {
    // Arrange
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('メッセージを入力...');
    await userEvent.type(input, 'Quick send');

    // Act
    fireEvent.keyDown(input, { key: 'Enter', metaKey: true });

    // Assert
    expect(onSend).toHaveBeenCalledWith('Quick send');
  });

  it('Ctrl+Enter（Windows/Linux）で送信できる', async () => {
    // Arrange
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('メッセージを入力...');
    await userEvent.type(input, 'Quick send');

    // Act
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });

    // Assert
    expect(onSend).toHaveBeenCalledWith('Quick send');
  });

  it('disabled=trueのとき、入力と送信ができない', () => {
    // Arrange
    const onSend = vi.fn();

    // Act
    render(<MessageInput onSend={onSend} disabled />);

    const input = screen.getByPlaceholderText('メッセージを入力...');
    const sendButton = screen.getByRole('button');

    // Assert
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('空の入力では送信ボタンがdisabled', () => {
    // Arrange

    // Act
    render(<MessageInput onSend={() => {}} />);

    const sendButton = screen.getByRole('button');

    // Assert
    expect(sendButton).toBeDisabled();
  });

  it('入力があるときは送信ボタンが有効', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<MessageInput onSend={() => {}} />);

    const input = screen.getByPlaceholderText('メッセージを入力...');
    const sendButton = screen.getByRole('button');

    // Assert
    expect(sendButton).toBeDisabled();

    // Act
    await user.type(input, 'Test');

    // Assert
    expect(sendButton).not.toBeDisabled();
  });
});
