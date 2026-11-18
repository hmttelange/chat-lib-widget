import { CSSProperties } from 'react';
import { ChatTheme } from './types';

export const DEFAULT_THEME: Required<ChatTheme> = {
  primaryColor: '#2563eb',
  headerTextColor: '#ffffff',
  userBubbleBg: '#2563eb',
  userBubbleColor: '#ffffff',
  agentBubbleBg: '#f1f5f9',
  agentBubbleColor: '#0f172a',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  borderRadius: '16px',
  width: '380px',
  height: '560px',
  position: 'bottom-right',
  zIndex: 9999,
  bubbleShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
};

const KEYFRAMES_ID = 'agent-chat-keyframes';

export function injectGlobalStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;

  const styleEl = document.createElement('style');
  styleEl.id = KEYFRAMES_ID;
  styleEl.innerHTML = `
    @keyframes agentDotBounce {
      0%, 80%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      40% {
        transform: translateY(-5px);
        opacity: 1;
      }
    }
    @keyframes agentChatSlideIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(12px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `;
  document.head.appendChild(styleEl);
}

export function getPositionStyles(position: ChatTheme['position'] = 'bottom-right'): CSSProperties {
  switch (position) {
    case 'bottom-left':
      return { bottom: '24px', left: '24px' };
    case 'top-right':
      return { top: '24px', right: '24px' };
    case 'top-left':
      return { top: '24px', left: '24px' };
    case 'bottom-right':
    default:
      return { bottom: '24px', right: '24px' };
  }
}

export interface ChatWidgetStyles {
  wrapper: CSSProperties;
  launcherContainer: CSSProperties;
  launcherButton: CSSProperties;
  launcherLabel: CSSProperties;
  badge: CSSProperties;
  chatWindow: CSSProperties;
  header: CSSProperties;
  headerProfile: CSSProperties;
  avatarWrapper: CSSProperties;
  headerInfo: CSSProperties;
  headerTitle: CSSProperties;
  headerSubtitle: CSSProperties;
  statusDot: CSSProperties;
  headerActions: CSSProperties;
  iconButton: CSSProperties;
  messagesContainer: CSSProperties;
  messageWrapper: (role: 'user' | 'assistant' | 'system') => CSSProperties;
  bubble: (role: 'user' | 'assistant' | 'system') => CSSProperties;
  timestamp: (role: 'user' | 'assistant' | 'system') => CSSProperties;
  typingIndicator: CSSProperties;
  dot: (delay: string) => CSSProperties;
  suggestionsRow: CSSProperties;
  suggestionPill: CSSProperties;
  errorBanner: CSSProperties;
  retryBtn: CSSProperties;
  footer: CSSProperties;
  inputRow: CSSProperties;
  input: CSSProperties;
  sendButton: (disabled: boolean) => CSSProperties;
  disclaimer: CSSProperties;
}

export function createStyles(theme: Partial<ChatTheme> = {}): ChatWidgetStyles {
  const merged = { ...DEFAULT_THEME, ...theme };
  const positionStyle = getPositionStyles(merged.position);

  return {
    wrapper: {
      position: 'fixed',
      ...positionStyle,
      zIndex: merged.zIndex,
      fontFamily: merged.fontFamily,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: merged.position?.includes('left') ? 'flex-start' : 'flex-end',
    },

    launcherContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
    },

    launcherButton: {
      width: '56px',
      height: '56px',
      borderRadius: '28px',
      backgroundColor: merged.primaryColor,
      color: merged.headerTextColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
      transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
      position: 'relative',
      outline: 'none',
    },

    launcherLabel: {
      backgroundColor: '#ffffff',
      color: '#1e293b',
      padding: '8px 14px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: 600,
      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      whiteSpace: 'nowrap',
      userSelect: 'none',
    },

    badge: {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      fontSize: '11px',
      fontWeight: 700,
      width: '20px',
      height: '20px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #ffffff',
    },

    chatWindow: {
      width: merged.width,
      maxWidth: 'calc(100vw - 32px)',
      height: merged.height,
      maxHeight: 'calc(100vh - 100px)',
      backgroundColor: '#ffffff',
      borderRadius: merged.borderRadius,
      boxShadow: merged.bubbleShadow,
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      marginBottom: '14px',
      animation: 'agentChatSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    },

    header: {
      backgroundColor: merged.primaryColor,
      color: merged.headerTextColor,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopLeftRadius: merged.borderRadius,
      borderTopRightRadius: merged.borderRadius,
    },

    headerProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },

    avatarWrapper: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: merged.headerTextColor,
      overflow: 'hidden',
      flexShrink: 0,
    },

    headerInfo: {
      display: 'flex',
      flexDirection: 'column',
    },

    headerTitle: {
      margin: 0,
      fontSize: '15px',
      fontWeight: 600,
      lineHeight: '1.2',
    },

    headerSubtitle: {
      margin: '2px 0 0 0',
      fontSize: '12px',
      opacity: 0.9,
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },

    statusDot: {
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      backgroundColor: '#4ade80',
      display: 'inline-block',
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },

    iconButton: {
      background: 'transparent',
      border: 'none',
      color: merged.headerTextColor,
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.85,
      transition: 'opacity 0.15s, background-color 0.15s',
    },

    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      backgroundColor: '#f8fafc',
    },

    messageWrapper: (role: 'user' | 'assistant' | 'system'): CSSProperties => ({
      display: 'flex',
      flexDirection: 'column',
      alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
      maxWidth: '82%',
    }),

    bubble: (role: 'user' | 'assistant' | 'system'): CSSProperties => ({
      padding: '10px 14px',
      borderRadius: '14px',
      borderBottomRightRadius: role === 'user' ? '2px' : '14px',
      borderBottomLeftRadius: role === 'assistant' ? '2px' : '14px',
      backgroundColor: role === 'user' ? merged.userBubbleBg : merged.agentBubbleBg,
      color: role === 'user' ? merged.userBubbleColor : merged.agentBubbleColor,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      fontSize: '14px',
      lineHeight: '1.45',
    }),

    timestamp: (role: 'user' | 'assistant' | 'system'): CSSProperties => ({
      fontSize: '10px',
      color: '#94a3b8',
      marginTop: '4px',
      alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    }),

    typingIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '10px 14px',
      borderRadius: '14px',
      backgroundColor: merged.agentBubbleBg,
      width: 'fit-content',
    },

    dot: (delay: string): CSSProperties => ({
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: '#64748b',
      animation: 'agentDotBounce 1.2s infinite ease-in-out',
      animationDelay: delay,
    }),

    suggestionsRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginTop: '8px',
    },

    suggestionPill: {
      backgroundColor: '#ffffff',
      color: merged.primaryColor,
      border: `1px solid ${merged.primaryColor}40`,
      borderRadius: '16px',
      padding: '5px 10px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'background-color 0.15s',
      fontWeight: 500,
    },

    errorBanner: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '4px',
    },

    retryBtn: {
      background: 'none',
      border: 'none',
      color: '#b91c1c',
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: 'underline',
      padding: 0,
      fontSize: '12px',
    },

    footer: {
      padding: '12px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },

    inputRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#f1f5f9',
      borderRadius: '24px',
      padding: '4px 6px 4px 14px',
    },

    input: {
      flex: 1,
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: '14px',
      color: '#0f172a',
      fontFamily: 'inherit',
      padding: '6px 0',
    },

    sendButton: (disabled: boolean): CSSProperties => ({
      width: '34px',
      height: '34px',
      borderRadius: '50%',
      backgroundColor: disabled ? '#cbd5e1' : merged.primaryColor,
      color: '#ffffff',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.15s, transform 0.1s',
      flexShrink: 0,
    }),

    disclaimer: {
      fontSize: '11px',
      color: '#94a3b8',
      textAlign: 'center',
      margin: '2px 0 0 0',
    },
  };
}
