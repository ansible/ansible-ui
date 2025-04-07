import { useCallback, useEffect, useState } from 'react';
import { ChatbotStateEnum, useAppChatbotContext } from './ChatbotProvider';
import { useGetRequest } from '@ansible/common-ui/crud/useGet';
import {
  LightspeedStatusDependencyStatus,
  LightspeedStatusResponse,
} from './interfaces/LightspeedStatus';

const LIGHTSPEED_HEALTH_STATUS_PATH = `/api/lightspeed/v1/health/status/`;

export function useChatbot() {
  const { chatbotState, setChatbotState } = useAppChatbotContext();
  const [checkStatus, setCheckStatus] = useState(false);

  const get = useGetRequest<LightspeedStatusResponse>();

  const setChatbotEnablementState = useCallback(async () => {
    try {
      const lightspeedStatusResponse = await get(LIGHTSPEED_HEALTH_STATUS_PATH, {});
      lightspeedStatusResponse.dependencies.forEach((dependency) => {
        if (dependency.name === 'chatbot-service') {
          if (dependency.status === ChatbotStateEnum.Disabled) {
            setChatbotState(ChatbotStateEnum.Disabled);
          } else {
            const chatbotStatus: LightspeedStatusDependencyStatus =
              dependency.status as LightspeedStatusDependencyStatus;
            if (chatbotStatus.models === 'ok') {
              setChatbotState(ChatbotStateEnum.Closed);
            } else {
              setChatbotState(ChatbotStateEnum.Disabled);
            }
          }
        }
      });
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
