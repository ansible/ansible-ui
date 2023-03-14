import {
  ContextSelector,
  ContextSelectorItem,
  Flex,
  PageSection,
  Text,
  Title,
} from '@patternfly/react-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoginModal } from '../../common/LoginModal';
import { useAutomationServers } from '../contexts/AutomationServerProvider';
import { AutomationServerType } from '../interfaces/AutomationServerType';

export function AutomationServerSwitcher() {
  const { t } = useTranslation();
  const { automationServer, automationServers } = useAutomationServers();
  const [open, setOpen] = useState(false);
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
            <Text component="small" style={{ opacity: 0.7 }}>
              {automationServer?.type === AutomationServerType.AWX
                ? t('AWX Ansible server')
                : automationServer?.type === AutomationServerType.HUB
                ? t('Galaxy Ansible server')
                : automationServer?.type === AutomationServerType.EDA
                ? t('EDA server')
                : t('Unknown')}
            </Text>
          </Flex>
        }
        isOpen={open}
        onToggle={() => setOpen((open) => !open)}
        isPlain
        className="ansible-context-selector"
      >
        {automationServers.map((automationServer, index) => (
          <ContextSelectorItem
            key={index}
            onClick={() => {
              setOpen(false);
              openLoginModal(automationServer.url);
            }}
          >
            <Flex
              direction={{ default: 'column' }}
              spaceItems={{ default: 'spaceItemsNone' }}
              alignItems={{ default: 'alignItemsFlexStart' }}
            >
              <Title headingLevel="h6">{automationServer?.name}</Title>
              <Text component="small" style={{ opacity: 0.7 }}>
                {automationServer?.type === AutomationServerType.AWX
                  ? t('AWX Ansible server')
                  : automationServer?.type === AutomationServerType.HUB
                  ? t('Galaxy Ansible server')
                  : automationServer?.type === AutomationServerType.EDA
                  ? t('EDA server')
                  : t('Unknown')}
              </Text>
            </Flex>
          </ContextSelectorItem>
        ))}
      </ContextSelector>
    </PageSection>
  );
}
