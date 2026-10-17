import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ChatPage from '../src/app/chat/page';

describe('ChatPage', () => {
  it('renders the input form with no messages yet', () => {
    const html = renderToString(createElement(ChatPage));
    expect(html).toContain('placeholder="メッセージを入力..."');
    expect(html).not.toContain('<strong>');
  });
});
