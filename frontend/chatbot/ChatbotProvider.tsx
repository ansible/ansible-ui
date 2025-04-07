import { createContext, ReactNode, useContext, useState, useMemo } from 'react';

export enum ChatbotStateEnum {
  Open = 'open',
  Closed = 'closed',
  Disabled = 'disabled',
}

export type ChatbotContext = {
  chatbotState: ChatbotStateEnum;
  setChatbotState: (c: ChatbotStateEnum) => void;
};

export const AppChatbotContext = createContext<ChatbotContext>({
  chatbotState: ChatbotStateEnum.Disabled,
  setChatbotState: () => {},
});

export const useAppChatbotContext = () => useContext(AppChatbotContext);

export function ChatbotProvider(props: { children: ReactNode }) {
  const [chatbotState, setChatbotState] = useState<ChatbotStateEnum>(ChatbotStateEnum.Disabled);

  const appChatbotContextValue = useMemo(
    () => ({ chatbotState, setChatbotState }),
    [chatbotState, setChatbotState]
  );

  return (
    <AppChatbotContext.Provider value={appChatbotContextValue}>
      {props.children}
    </AppChatbotContext.Provider>
  );
}
