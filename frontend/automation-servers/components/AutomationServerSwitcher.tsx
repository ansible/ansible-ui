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
import { useSettings } from '../../../framework/Settings';
import { useLoginModal } from '../../common/LoginModal';
import { useAutomationServers } from '../contexts/AutomationServerProvider';

export function AutomationServerSwitcher() {
  const { t } = useTranslation();
  const settings = useSettings();
  const { automationServer, automationServers } = useAutomationServers();
  const [open, setOpen] = useState(false);
  const openLoginModal = useLoginModal();
  return (
    <PageSection
      variant="dark"
      style={{
        padding: 12,
        backgroundColor:
          settings.theme === 'light' ? undefined : 'var(--pf-global--BackgroundColor--300)',
      }}
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
              {automationServer?.type === 'controller'
                ? t('Automation controller')
                : automationServer?.type === 'hub'
                ? t('Automation hub')
                : t('Event driven automation')}
            </Text>
          </Flex>
        }
        // onSearchInputChange={onSearchInputChange}
        isOpen={open}
        // searchInputValue={searchValue}
        onToggle={() => setOpen((open) => !open)}
        // screenReaderLabel="Selected Project:"
        isPlain
        // footer={
        //   <div style={{ borderTop: 'thin solid var(--pf-global--BorderColor--100)' }}>
        //     <Button
        //       variant="link"
        //       isInline
        //       style={{ margin: 16 }}
        //       onClick={() => {
        //         automationServer?.type === 'controller'
        //           ? navigate(RouteE.ControllerAutomationServers)
        //           : automationServer?.type === 'hub'
        //           ? navigate(RouteE.HubAutomationServers)
        //           : navigate(RouteE.AutomationServers);
        //         setOpen(false);
        //       }}
        //     >
        //       {t('Manage automation servers')}
        //     </Button>
        //   </div>
        // }
        className="ansible-context-selector"
      >
        {automationServers.map((automationServer, index) => (
          <ContextSelectorItem
            key={index}
            onClick={
              () => {
                setOpen(false);
                openLoginModal(automationServer.url);
              }
              // navigate(RouteE.Login + '?server=' + encodeURIComponent(automationServer.url))
            }
          >
            <Flex
              direction={{ default: 'column' }}
              spaceItems={{ default: 'spaceItemsNone' }}
              alignItems={{ default: 'alignItemsFlexStart' }}
            >
              <Title headingLevel="h6">{automationServer?.name}</Title>
              <Text component="small" style={{ opacity: 0.7 }}>
                {automationServer?.type === 'controller'
                  ? t('Automation controller')
                  : automationServer?.type === 'hub'
                  ? t('Automation hub')
                  : t('Event driven automation')}
              </Text>
            </Flex>
          </ContextSelectorItem>
        ))}
      </ContextSelector>
    </PageSection>
  );
}
