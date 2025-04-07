import React, { useContext, useEffect, useState } from 'react';
import { ChatbotMessage } from './ChatbotPortal';
import { ChatbotContext } from '@ansible/ansible-ai-connect-chatbot/dist/AnsibleChatbot/AnsibleChatbot';
import { App as Chatbot } from '@ansible/ansible-ai-connect-chatbot';
import { PageSettingsContext } from '@ansible/ansible-ui-framework';

const THEME_CLASS_LIGHT = 'pf-v6-theme-light';
const THEME_CLASS_DARK = 'pf-v6-theme-dark';

export const ChatbotWindow = () => {
  const [context, setContext] = useState<ChatbotContext | null>(null); // string | undefined
  const [settings] = useContext(PageSettingsContext);

  const getFrameWindow = () => window[0];

  const onMessage = (event: MessageEvent<string>) => {
    if (!(window.location.href.startsWith(event.origin) && window === event.source)) {
      return;
    }

    if (event.data) {
      try {
        const message = JSON.parse(event.data) as ChatbotMessage;
        setContext(message.context);
      } catch {
        setContext(null);
      }
    }
  };

  useEffect(function () {
    const f = getFrameWindow();
    f.addEventListener('message', onMessage);
    return () => f.removeEventListener('message', onMessage);
  }, []);

  useEffect(
    function () {
      if (settings.theme) {
        const classList = getFrameWindow().document.getElementsByTagName('html')[0].classList;
        if (settings.theme === 'dark') {
          classList.remove(THEME_CLASS_LIGHT);
          classList.add(THEME_CLASS_DARK);
        } else if (settings.theme === 'light') {
          classList.remove(THEME_CLASS_DARK);
          classList.add(THEME_CLASS_LIGHT);
        } else {
          // default is 'system'
          classList.remove(THEME_CLASS_LIGHT, THEME_CLASS_DARK);
        }
      }
    },
    [settings.theme]
  );

  return <Chatbot username={context?.username} />;
};
