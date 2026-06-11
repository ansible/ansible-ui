import { useCallback, useEffect, useState } from 'react';
import { ChatbotStateEnum, useAppChatbotContext } from './ChatbotProvider';
import { useGetRequest } from '@ansible/common-ui/crud/useGet';
import { LightspeedStatusResponse } from './interfaces/LightspeedStatus';

const LIGHTSPEED_HEALTH_STATUS_PATH = `/api/lightspeed/v1/health/status/chatbot/`;

export function useChatbot() {
  const { chatbotState, setChatbotState } = useAppChatbotContext();
  const [checkStatus, setCheckStatus] = useState(false);

  const get = useGetRequest<LightspeedStatusResponse>();

  const setChatbotEnablementState = useCallback(async () => {
    try {
      const lightspeedStatusResponse = await get(LIGHTSPEED_HEALTH_STATUS_PATH, {});
      const state: string = lightspeedStatusResponse['chatbot-service'];
      if (state === 'ok') {
        setChatbotState(ChatbotStateEnum.Closed);
      } else {
        setChatbotState(ChatbotStateEnum.Disabled);
      }
    } catch {
      setChatbotState(ChatbotStateEnum.Disabled);
    }
  }, [get, setChatbotState]);

  useEffect(() => {
    if (!checkStatus) {
      void (async () => {
        setCheckStatus(true);
        await setChatbotEnablementState();
      })();
    }
  }, [checkStatus, setChatbotEnablementState]);

  return chatbotState !== ChatbotStateEnum.Disabled;
}
