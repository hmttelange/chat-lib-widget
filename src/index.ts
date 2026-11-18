export { AgentChatWidget } from './AgentChatWidget';
export { useAgentChat } from './useAgentChat';
export { createStyles, injectGlobalStyles, DEFAULT_THEME } from './styles';
export { ChatBubbleIcon, CloseIcon, SendIcon, ResetIcon, BotIcon } from './icons';
export { FormattedMessage } from './markdown';

export type {
  ChatMessage,
  ChatTheme,
  AgentChatConfig,
  AgentChatWidgetProps,
  CustomSendHandler,
  MessageRole,
} from './types';

export type { UseAgentChatReturn } from './useAgentChat';

import { AgentChatWidget } from './AgentChatWidget';
export default AgentChatWidget;
