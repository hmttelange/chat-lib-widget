import React from 'react';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
  metadata?: Record<string, unknown>;
}

export interface ChatTheme {
  primaryColor?: string;
  headerTextColor?: string;
  userBubbleBg?: string;
  userBubbleColor?: string;
  agentBubbleBg?: string;
  agentBubbleColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  width?: string;
  height?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  zIndex?: number;
  bubbleShadow?: string;
}

export type CustomSendHandler = (
  message: string,
  history: ChatMessage[],
  config: {
    agentId?: string;
    userId?: string;
    conversationId?: string;
    metadata?: Record<string, unknown>;
  }
) => Promise<string | ReadableStream<Uint8Array> | Response>;

export interface AgentChatConfig {
  /**
   * The backend URL endpoint for sending messages (e.g. '/api/chat' or 'https://api.example.com/agent')
   */
  apiEndpoint?: string;

  /**
   * Optional custom request headers (e.g. Authorization or custom tokens)
   */
  headers?: Record<string, string> | (() => Promise<Record<string, string>> | Record<string, string>);

  /**
   * Optional identifier for the specific AI agent to route to
   */
  agentId?: string;

  /**
   * Optional user identifier
   */
  userId?: string;

  /**
   * Optional conversation or session ID
   */
  conversationId?: string;

  /**
   * Optional arbitrary metadata sent with each backend request
   */
  metadata?: Record<string, unknown>;

  /**
   * Greeting message displayed by the agent when conversation starts
   * @default "Hello! How can I help you today?"
   */
  welcomeMessage?: string;

  /**
   * Initial messages to preload into conversation history
   */
  initialMessages?: Array<{ role: MessageRole; content: string }>;

  /**
   * Agent display name in header
   * @default "AI Support Agent"
   */
  agentName?: string;

  /**
   * Subtitle displayed below agent name
   * @default "Online"
   */
  agentSubtitle?: string;

  /**
   * Avatar URL or custom React node for agent icon
   */
  agentAvatar?: string | React.ReactNode;

  /**
   * Input placeholder text
   * @default "Ask something..."
   */
  placeholder?: string;

  /**
   * Disclaimer note displayed at bottom of chat window
   * @default "Powered by AI Agent"
   */
  disclaimer?: string;

  /**
   * Whether to stream backend responses token by token (SSE / Chunked stream)
   * @default false
   */
  streaming?: boolean;

  /**
   * Persist messages across page reloads using sessionStorage or localStorage
   * @default false
   */
  persistSession?: boolean;

  /**
   * Key used for session storage persistence
   * @default "agent_chat_history"
   */
  storageKey?: string;

  /**
   * Quick suggested question chips shown at the top of chat
   */
  suggestedPrompts?: string[];

  /**
   * Custom sender function if you want to bypass standard HTTP fetch (e.g. WebSockets or custom SDK)
   */
  customSendMessage?: CustomSendHandler;

  /**
   * Callbacks
   */
  onMessageSent?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;

  /**
   * UI Theme styling
   */
  theme?: ChatTheme;
}

export interface AgentChatWidgetProps extends AgentChatConfig {
  /**
   * Controlled open state of chat window
   */
  isOpen?: boolean;

  /**
   * Initial open state when uncontrolled
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Callback fired when open state toggles
   */
  onToggle?: (isOpen: boolean) => void;

  /**
   * Optional text label displayed next to floating action bubble
   */
  buttonLabel?: string;

  /**
   * Show notification dot or count on launcher button
   */
  showBadge?: boolean;

  /**
   * Custom CSS class name for outer wrapper
   */
  className?: string;

  /**
   * Custom inline styles for outer wrapper
   */
  style?: React.CSSProperties;
}
