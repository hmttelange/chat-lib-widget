import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AgentChatWidgetProps } from './types';
import { useAgentChat } from './useAgentChat';
import { createStyles, injectGlobalStyles } from './styles';
import { ChatBubbleIcon, CloseIcon, SendIcon, ResetIcon, BotIcon } from './icons';
import { FormattedMessage } from './markdown';

export const AgentChatWidget: React.FC<AgentChatWidgetProps> = (props) => {
  const {
    isOpen: controlledIsOpen,
    defaultOpen = false,
    onToggle,
    agentName = 'AI Assistant',
    agentSubtitle = 'Online',
    agentAvatar,
    placeholder = 'Ask a question...',
    disclaimer = 'Powered by AI Agent',
    buttonLabel,
    showBadge = false,
    suggestedPrompts = [],
    theme = {},
    className = '',
    style = {},
    onOpen,
    onClose,
  } = props;

  // Uncontrolled open state if isOpen is not passed
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const [inputValue, setInputValue] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Hook for backend connection and messages
  const { messages, isLoading, error, sendMessage, retryLastMessage, clearMessages } =
    useAgentChat(props);

  // Inject keyframes on mount
  useEffect(() => {
    injectGlobalStyles();
  }, []);

  // Auto-scroll on new message or typing state change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle open/close toggle
  const handleToggle = () => {
    const nextState = !isOpen;
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(nextState);
    }
    onToggle?.(nextState);
    if (nextState) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const text = inputValue;
    setInputValue('');
    await sendMessage(text);
  };

  const handlePromptClick = (prompt: string) => {
    if (isLoading) return;
    sendMessage(prompt);
  };

  // Keyboard shortcut: close on Esc
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      handleToggle();
    }
  };

  return (
    <div
      className={`agent-chat-container ${className}`}
      style={{ ...styles.wrapper, ...style }}
      onKeyDown={handleKeyDown}
    >
      {/* Chat Window Panel */}
      {isOpen && (
        <section
          className="agent-chat-window"
          style={styles.chatWindow}
          role="dialog"
          aria-label={`${agentName} window`}
        >
          {/* Header */}
          <header style={styles.header}>
            <div style={styles.headerProfile}>
              <div style={styles.avatarWrapper}>
                {typeof agentAvatar === 'string' ? (
                  <img
                    src={agentAvatar}
                    alt={agentName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  agentAvatar || <BotIcon size={22} color="currentColor" />
                )}
              </div>
              <div style={styles.headerInfo}>
                <h3 style={styles.headerTitle}>{agentName}</h3>
                <span style={styles.headerSubtitle}>
                  <span style={styles.statusDot} />
                  {agentSubtitle}
                </span>
              </div>
            </div>

            <div style={styles.headerActions}>
              <button
                type="button"
                onClick={clearMessages}
                style={styles.iconButton}
                title="Restart conversation"
                aria-label="Restart conversation"
              >
                <ResetIcon size={16} color="currentColor" />
              </button>
              <button
                type="button"
                onClick={handleToggle}
                style={styles.iconButton}
                title="Close chat"
                aria-label="Close chat"
              >
                <CloseIcon size={20} color="currentColor" />
              </button>
            </div>
          </header>

          {/* Messages Body */}
          <div style={styles.messagesContainer}>
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isAssistant = msg.role === 'assistant';

              // If it's an assistant message currently streaming / loading and still empty, we show typing indicator below
              if (isAssistant && !msg.content && msg.status === 'sending') {
                return null;
              }

              return (
                <div key={msg.id} style={styles.messageWrapper(msg.role)}>
                  <div style={styles.bubble(msg.role)}>
                    {isUser ? (
                      <div style={{ wordBreak: 'break-word', fontSize: '14px' }}>{msg.content}</div>
                    ) : (
                      <FormattedMessage content={msg.content} />
                    )}
                  </div>
                  <span style={styles.timestamp(msg.role)}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}

            {/* Typing / Loading indicator */}
            {isLoading && (
              <div style={styles.typingIndicator} aria-label="Agent is typing">
                <div style={styles.dot('0s')} />
                <div style={styles.dot('0.2s')} />
                <div style={styles.dot('0.4s')} />
              </div>
            )}

            {/* Error banner with retry */}
            {error && (
              <div style={styles.errorBanner} role="alert">
                <span>{error}</span>
                <button type="button" onClick={retryLastMessage} style={styles.retryBtn}>
                  Retry
                </button>
              </div>
            )}

            {/* Suggested quick prompt chips */}
            {suggestedPrompts.length > 0 && messages.length <= 2 && (
              <div style={styles.suggestionsRow}>
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptClick(prompt)}
                    style={styles.suggestionPill}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <footer style={styles.footer}>
            <form onSubmit={handleSend} style={styles.inputRow}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                style={styles.input}
                disabled={isLoading}
                aria-label="Chat message input"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                style={styles.sendButton(!inputValue.trim() || isLoading)}
                aria-label="Send message"
              >
                <SendIcon size={16} color="#ffffff" />
              </button>
            </form>
            {disclaimer && <p style={styles.disclaimer}>{disclaimer}</p>}
          </footer>
        </section>
      )}

      {/* Floating Trigger Launcher Button */}
      <div style={styles.launcherContainer}>
        {buttonLabel && !isOpen && <div style={styles.launcherLabel}>{buttonLabel}</div>}
        <button
          type="button"
          onClick={handleToggle}
          style={styles.launcherButton}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          title={isOpen ? 'Close chat' : 'Chat with agent'}
        >
          {isOpen ? (
            <CloseIcon size={24} color={styles.launcherButton.color} />
          ) : (
            <ChatBubbleIcon size={26} color={styles.launcherButton.color} />
          )}

          {showBadge && !isOpen && <span style={styles.badge}>1</span>}
        </button>
      </div>
    </div>
  );
};
