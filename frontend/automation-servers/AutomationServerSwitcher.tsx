import {
  ContextSelector,
  ContextSelectorItem,
  Flex,
  PageSection,
  Text,
  Title,
} from '@patternfly/react-core';
import { useState } from 'react';
import { useLoginModal } from '../common/LoginModal';
import { useActiveAutomationServer, useAutomationServers } from './AutomationServersProvider';
import { useAutomationServerTypes } from './hooks/useAutomationServerTypes';

export function AutomationServerSwitcher() {
  const automationServers = useAutomationServers();
  const automationServer = useActiveAutomationServer();
  const automationServerTypes = useAutomationServerTypes();
  const [open, setOpen] = useState(false);
  // const automationServerTypes = useAutomationServerTypes();
  const openLoginModal = useLoginModal();
  return (
    <PageSection
      variant="dark"
      className="dark-0"
      style={{ padding: 12 }}
      padding={{ default: 'padding' }}
    >
      <ContextSelector
        toggleText={
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsNone' }}
            alignItems={{ default: 'alignItemsFlexStart' }}
          >
            <Title headingLevel="h2">{automationServer?.name}</Title>
            {automationServer && (
              <Text component="small" style={{ opacity: 0.7 }}>
                {automationServerTypes[automationServer.type]?.name ?? ''}
              </Text>
            )}
          </Flex>
        }
        isOpen={open}
        onToggle={() => setOpen((open) => !open)}
        isPlain
        className="ansible-context-selector"
      >
        {automationServers?.map((automationServer, index) => (
          <ContextSelectorItem
            key={index}
            onClick={() => {
              setOpen(false);
              openLoginModal(automationServer.id);
            }}
          >
            <Flex
              direction={{ default: 'column' }}
              spaceItems={{ default: 'spaceItemsNone' }}
              alignItems={{ default: 'alignItemsFlexStart' }}
            >
              <Title headingLevel="h6">{automationServer?.name}</Title>
              {automationServer && (
                <Text component="small" style={{ opacity: 0.7 }}>
                  {automationServerTypes[automationServer.type]?.name ?? ''}
                </Text>
              )}
            </Flex>
          </ContextSelectorItem>
        ))}
      </ContextSelector>
    </PageSection>
  );
}
