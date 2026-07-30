/* eslint-disable i18next/no-literal-string */
import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { usePlatformActiveUser } from '@ansible/platform-ui/main/PlatformActiveUserProvider';
import { ChatbotWindow } from './ChatbotWindow';
import chatbot_css from '@ansible/ansible-ai-connect-chatbot/style.css?inline';
import type { ChatbotContext } from './types';
import { Spinner } from '@patternfly/react-core';

export interface ChatbotMessage {
  context: ChatbotContext;
}

function ChatbotPortal({ ...props }) {
  const chatbotFrameRef = useRef<HTMLIFrameElement>(null);
  const { activePlatformUser } = usePlatformActiveUser();

  const injectStyles = () => {
    const chatbot_style_element = document.createElement('style');
    chatbot_style_element.textContent = chatbot_css;
    chatbotFrameRef.current?.contentWindow?.document.head.appendChild(chatbot_style_element);
  };

  const sendChatbotState = () => {
    sendMessage({
      context: {
        username: activePlatformUser?.username,
      },
    });
  };

  const [loading, setLoading] = useState(true);

  const sendMessage = (message: ChatbotMessage) => {
    const www = chatbotFrameRef.current?.contentWindow;
    www?.postMessage(JSON.stringify(message));
  };

  const chatbotLoadCompleted = () => {
    injectStyles();
    setLoading(false);
    sendChatbotState();
  };

  return (
    <>
      {loading ? <Spinner /> : <></>}
      <iframe
        title="Ansible Chatbot IFrame"
        srcDoc="<!DOCTYPE html>"
        ref={chatbotFrameRef}
        onLoad={chatbotLoadCompleted}
        {...props}
        style={{
          height: '100%',
          width: '100%',
          position: 'sticky',
          padding: '0px',
          margin: '0px',
          border: '0px',
          overflow: 'hidden',
        }}
      >
        {chatbotFrameRef.current !== null &&
          ReactDOM.createPortal(
            <ChatbotWindow />,
            // @ts-expect-error IFrame for chatbot must exist
            chatbotFrameRef.current?.contentWindow.document.body
          )}
      </iframe>
    </>
  );
}

// eslint-disable-next-line no-restricted-exports
export default ChatbotPortal;
