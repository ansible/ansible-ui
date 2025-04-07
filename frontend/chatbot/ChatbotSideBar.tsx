/* eslint-disable i18next/no-literal-string */
import {
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { LazyChatbot } from './LazyChatbot';
import { ChatbotStateEnum, useAppChatbotContext } from './ChatbotProvider';
import { useTranslation } from 'react-i18next';

const DrawerContentBodyStyled = styled(DrawerContentBody)`
  max-height: 100%;
`;

export const ChatbotSideBar = (props: { children?: ReactNode }) => {
  const { chatbotState, setChatbotState } = useAppChatbotContext();
  const { t } = useTranslation();

  const drawerRef = React.useRef<HTMLDivElement | null>(null);

  const onExpand = () => {
    drawerRef.current !== null && drawerRef.current.focus();
  };

  const onCloseClick = () => {
    setChatbotState(ChatbotStateEnum.Closed);
  };

  const panelContent = (
    <DrawerPanelContent isResizable>
      <DrawerHead>
        <span tabIndex={chatbotState === ChatbotStateEnum.Open ? 0 : -1} ref={drawerRef}>
          {t('Ansible Virtual Assistant')}
        </span>
        <DrawerActions>
          <DrawerCloseButton onClick={onCloseClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ padding: '0px 0px 0px 0px' }}>
        <LazyChatbot />
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <Drawer isExpanded={chatbotState === ChatbotStateEnum.Open} onExpand={onExpand} isInline>
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBodyStyled>{props.children}</DrawerContentBodyStyled>
      </DrawerContent>
    </Drawer>
  );
};
