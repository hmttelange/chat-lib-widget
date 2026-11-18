import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, AgentChatConfig } from './types';

export interface UseAgentChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearMessages: () => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export function useAgentChat(config: AgentChatConfig): UseAgentChatReturn {
  const {
    apiEndpoint = '/api/chat',
    headers = {},
    agentId,
    userId,
    conversationId,
    metadata,
    welcomeMessage = 'Hello! How can I help you today?',
    initialMessages = [],
    persistSession = false,
    storageKey = 'agent_chat_history',
    customSendMessage,
    onMessageSent,
    onMessageReceived,
    onError,
  } = config;

  const createInitialState = (): ChatMessage[] => {
    if (persistSession && typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Fallback to defaults on storage read error
      }
    }

    const base: ChatMessage[] = [];
    if (welcomeMessage) {
      base.push({
        id: 'msg-welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: Date.now(),
        status: 'sent',
      });
    }

    if (initialMessages.length > 0) {
      initialMessages.forEach((msg, idx) => {
        base.push({
          id: `msg-init-${idx}`,
          role: msg.role,
          content: msg.content,
          timestamp: Date.now() + idx,
          status: 'sent',
        });
      });
    }

    return base;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(createInitialState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);

  // Sync to session storage if enabled
  useEffect(() => {
    if (persistSession && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(messages));
      } catch {
        // Ignore storage quota errors
      }
    }
  }, [messages, persistSession, storageKey]);

  const resolveHeaders = async (): Promise<Record<string, string>> => {
    if (typeof headers === 'function') {
      return await headers();
    }
    return headers;
  };

  const parseServerResponse = async (response: Response): Promise<string> => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (typeof data === 'string') return data;
      // Support common backend response keys
      if (data.reply) return String(data.reply);
      if (data.message) return typeof data.message === 'string' ? data.message : data.message.content || '';
      if (data.response) return String(data.response);
      if (data.content) return String(data.content);
      if (data.answer) return String(data.answer);
      if (data.text) return String(data.text);
      if (data.choices?.[0]?.message?.content) return String(data.choices[0].message.content);
      if (data.choices?.[0]?.text) return String(data.choices[0].text);
      return JSON.stringify(data);
    }
    return await response.text();
  };

  const streamResponse = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    assistantMsgId: string
  ): Promise<string> => {
    const decoder = new TextDecoder('utf-8');
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // Handle Server-Sent Events (SSE) formatting if present
      const lines = chunk.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const parsed = JSON.parse(payload);
            const token =
              parsed.token ||
              parsed.content ||
              parsed.delta?.content ||
              parsed.choices?.[0]?.delta?.content ||
              '';
            accumulated += token;
          } catch {
            accumulated += payload;
          }
        } else if (trimmed) {
          // Plain chunk stream
          accumulated += trimmed;
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, content: accumulated, status: 'sending' } : msg
        )
      );
    }

    return accumulated;
  };

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      lastUserMessageRef.current = trimmed;
      setError(null);

      const userMsgId = `user-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
        status: 'sent',
      };

      const assistantMsgId = `asst-${Date.now()}`;
      const placeholderAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        status: 'sending',
      };

      // Add user message immediately
      setMessages((prev) => [...prev, userMessage, placeholderAssistantMsg]);
      setIsLoading(true);
      onMessageSent?.(userMessage);

      try {
        let replyContent = '';

        if (customSendMessage) {
          // Custom handler provided by caller
          const result = await customSendMessage(trimmed, messages.concat(userMessage), {
            agentId,
            userId,
            conversationId,
            metadata,
          });

          if (typeof result === 'string') {
            replyContent = result;
          } else if (result instanceof Response) {
            if (result.body && config.streaming) {
              const reader = result.body.getReader();
              replyContent = await streamResponse(reader, assistantMsgId);
            } else {
              replyContent = await parseServerResponse(result);
            }
          } else if (result && typeof (result as ReadableStream).getReader === 'function') {
            const reader = (result as ReadableStream<Uint8Array>).getReader();
            replyContent = await streamResponse(reader, assistantMsgId);
          }
        } else {
          // Default HTTP POST to apiEndpoint
          const reqHeaders = await resolveHeaders();
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: config.streaming ? 'text/event-stream, application/json, text/plain' : 'application/json, text/plain',
              ...reqHeaders,
            },
            body: JSON.stringify({
              message: trimmed,
              messages: messages.concat(userMessage).map((m) => ({
                role: m.role,
                content: m.content,
              })),
              agentId,
              userId,
              conversationId,
              metadata,
            }),
          });

          if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
          }

          const isStreamResponse =
            config.streaming ||
            response.headers.get('content-type')?.includes('text/event-stream') ||
            response.headers.get('transfer-encoding') === 'chunked';

          if (isStreamResponse && response.body) {
            const reader = response.body.getReader();
            replyContent = await streamResponse(reader, assistantMsgId);
          } else {
            replyContent = await parseServerResponse(response);
          }
        }

        const finalAssistantMsg: ChatMessage = {
          id: assistantMsgId,
          role: 'assistant',
          content: replyContent || 'I received your request.',
          timestamp: Date.now(),
          status: 'sent',
        };

        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMsgId ? finalAssistantMsg : msg))
        );
        onMessageReceived?.(finalAssistantMsg);
      } catch (err: unknown) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        const errorMessage = errorObj.message || 'Failed to connect to agent backend.';
        setError(errorMessage);
        onError?.(errorObj);

        // Remove empty placeholder or mark with error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: '⚠️ Sorry, there was an issue reaching the agent. Please try again.',
                  status: 'error',
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      messages,
      customSendMessage,
      apiEndpoint,
      agentId,
      userId,
      conversationId,
      metadata,
      config.streaming,
      onMessageSent,
      onMessageReceived,
      onError,
    ]
  );

  const retryLastMessage = useCallback(async () => {
    if (lastUserMessageRef.current) {
      // Remove failed assistant error message if it's the last item
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && last.status === 'error') {
          return prev.slice(0, -1);
        }
        return prev;
      });
      await sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    if (persistSession && typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        // Ignore
      }
    }
    const fresh: ChatMessage[] = [];
    if (welcomeMessage) {
      fresh.push({
        id: 'msg-welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: Date.now(),
        status: 'sent',
      });
    }
    setMessages(fresh);
    setError(null);
  }, [welcomeMessage, persistSession, storageKey]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    retryLastMessage,
    clearMessages,
    setMessages,
  };
}
