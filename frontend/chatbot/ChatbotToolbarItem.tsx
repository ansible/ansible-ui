import { Button, ButtonVariant, ToolbarItem } from '@patternfly/react-core';
import { CommentIcon } from '@patternfly/react-icons';
import { ChatbotStateEnum, useAppChatbotContext } from './ChatbotProvider';
import { useChatbot } from './ChatbotState';

export function ChatbotToolbarItem() {
  const chatbotEnabled = useChatbot();
  const { chatbotState, setChatbotState } = useAppChatbotContext();

  return (
    <>
      {chatbotEnabled && (
        <ToolbarItem>
          <Button
            data-cy="chatbot-badge"
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
        </ToolbarItem>
      )}
    </>
  );
}
