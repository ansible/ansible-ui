import {
  Button,
  ContextSelector,
  ContextSelectorItem,
  Divider,
  Flex,
  PageSection,
  Text,
  Title,
} from '@patternfly/react-core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../../../framework/Settings'
import { RouteE } from '../../Routes'
import { useAutomationServers } from './AutomationServerProvider'

export function AutomationServerSwitcher() {
  const { t } = useTranslation()
  const settings = useSettings()
  const { automationServer, automationServers } = useAutomationServers()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  return (
    <PageSection
      variant="dark"
      style={{
        padding: 12,
        backgroundColor:
          settings.theme === 'light' ? undefined : 'var(--pf-global--BackgroundColor--400)',
        borderTop: 'thin solid #fff2',
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
                : t('Automation hub')}
            </Text>
          </Flex>
        }
        // onSearchInputChange={onSearchInputChange}
        isOpen={open}
        // searchInputValue={searchValue}
        onToggle={() => setOpen((open) => !open)}
        screenReaderLabel="Selected Project:"
        isPlain
        footer={
          <>
            <Divider />
            <Button variant="link" isInline style={{ margin: 16 }}>
              {t('Manage automation servers')}
            </Button>
          </>
        }
      >
        {automationServers.map((automationServer, index) => (
          <ContextSelectorItem
            key={index}
            onClick={() =>
              navigate(RouteE.Login + '?server=' + encodeURIComponent(automationServer.url))
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
                  : t('Automation hub')}
              </Text>
            </Flex>
          </ContextSelectorItem>
        ))}
      </ContextSelector>
    </PageSection>
  )
}
