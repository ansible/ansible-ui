import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { CommentIcon } from '@patternfly/react-icons';
import { ChatbotStateEnum, useAppChatbotContext } from './ChatbotProvider';
import { useChatbot } from './ChatbotState';
import { useTranslation } from 'react-i18next';

export function ChatbotButton() {
  const { t } = useTranslation();
  const chatbotEnabled = useChatbot();
  const { chatbotState, setChatbotState } = useAppChatbotContext();

  if (!chatbotEnabled) return null;

  return (
    <Tooltip content={t`Chat`} position="bottom">
      <Button
        aria-label={t`Chat`}
        data-cy="chatbot-badge"
        data-testid="chatbot-badge"
        variant={ButtonVariant.plain}
        onClick={() =>
          setChatbotState(
            chatbotState === ChatbotStateEnum.Closed
              ? ChatbotStateEnum.Open
              : ChatbotStateEnum.Closed
          )
        }
      >
        <CommentIcon />
      </Button>
    </Tooltip>
  );
}
