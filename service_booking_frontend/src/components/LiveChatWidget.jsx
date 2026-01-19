import React, { useEffect, useMemo, useRef, useState } from 'react';
import './landing.css';

const BOT_NAME = 'OceanFix Support';

function nowTime() {
  try {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// PUBLIC_INTERFACE
export default function LiveChatWidget() {
  /** Floating live chat widget stub (no backend). */
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => [
    { from: 'bot', text: 'Hi! How can we help you today?', at: nowTime() }
  ]);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      // focus input when opening
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    // auto-scroll to bottom on new message
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  function send() {
    if (!canSend) return;

    const userText = input.trim();
    setInput('');

    setMessages((m) => [...m, { from: 'user', text: userText, at: nowTime() }]);

    // Simple canned reply to feel realistic.
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          from: 'bot',
          text: 'Thanks! Please share your device brand/model and pincode. You can also use “Book Now” to start instantly.',
          at: nowTime()
        }
      ]);
    }, 450);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="lp-chat" aria-label="Live chat widget">
      <button
        type="button"
        className="lp-chat__fab"
        aria-label={open ? 'Close live chat' : 'Open live chat'}
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
      >
        {open ? '×' : 'Chat'}
      </button>

      <div className={`lp-chat__panel ${open ? 'is-open' : ''}`} role="dialog" aria-label="Live chat panel">
        <div className="lp-chat__head">
          <div className="lp-chat__title">{BOT_NAME}</div>
          <div className="lp-chat__sub">Typically replies in a few minutes</div>
        </div>

        <div ref={listRef} className="lp-chat__messages" aria-label="Chat messages">
          {messages.map((m, idx) => (
            <div key={String(idx)} className={`lp-chat__msg lp-chat__msg--${m.from}`}>
              <div className="lp-chat__bubble">{m.text}</div>
              <div className="lp-chat__time">{m.at}</div>
            </div>
          ))}
        </div>

        <div className="lp-chat__composer" aria-label="Chat input">
          <textarea
            ref={inputRef}
            className="lp-chat__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message…"
            rows={1}
            aria-label="Message"
          />
          <button className="lp-btn lp-btn--primary lp-btn--small" type="button" onClick={send} disabled={!canSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
