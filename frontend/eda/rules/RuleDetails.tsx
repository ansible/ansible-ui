import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  PageSection,
  Skeleton,
  Stack,
} from '@patternfly/react-core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
  useGetPageUrl,
} from '../../../framework';
import { formatDateString } from '../../../framework/utils/formatDateString';
import { useGet } from '../../common/crud/useGet';
import { EdaRoute } from '../EdaRoutes';
import { EdaProjectCell } from '../Resources/projects/components/EdaProjectCell';
import { PageDetailsSection } from '../common/PageDetailsSection';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../constants';
import { EdaRule } from '../interfaces/EdaRule';
import { EdaRulebookCell } from '../rulebooks/components/EdaRulebookCell';

export function RuleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: rule } = useGet<EdaRule>(`${API_PREFIX}/rules/${params.id ?? ''}/`, undefined, {
    refreshInterval: SWR_REFRESH_INTERVAL,
  });
  const [copied, setCopied] = React.useState(false);

  const clipboardCopyFunc = (event: React.MouseEvent, text: { toString: () => string }) => {
    void navigator.clipboard.writeText(text.toString());
  };
  const onClick = (event: React.MouseEvent, text: { toString: () => string }) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  const actions = (
    <React.Fragment>
      <CodeBlockAction>
        <ClipboardCopyButton
          id="basic-copy-button"
          textId="code-content"
          aria-label="Copy to clipboard"
          onClick={(e) => onClick(e, rule?.conditions || '')}
          exitDelay={copied ? 1500 : 600}
          maxWidth="110px"
          variant="plain"
          onTooltipHidden={() => setCopied(false)}
        >
          {copied ? t('Successfully copied to clipboard!') : t('Copy to clipboard')}
        </ClipboardCopyButton>
      </CodeBlockAction>
    </React.Fragment>
  );

  const renderRuleDetailsTab = (rule: EdaRule | undefined): JSX.Element => {
    return (
      <React.Fragment>
        <PageDetails>
          <PageDetail label={t('Name')}>{rule?.name || ''}</PageDetail>
          <PageDetail label={t('Description')}>{rule?.description || ''}</PageDetail>
          {/* <PageDetail label={t('Rule set')}>
            <EdaRuleSetCell />
          </PageDetail> */}
          <PageDetail label={t('Project')}>
            <EdaProjectCell id={rule?.project} />
          </PageDetail>
          <PageDetail label={t('Rulebook')}>
            <EdaRulebookCell id={rule?.project} />
          </PageDetail>

          <PageDetail label={t('Rule type')}>{rule?.type || ''}</PageDetail>
          <PageDetail label={t('Fire count')}>{rule?.fired_stats?.fired_count || 0}</PageDetail>
          <PageDetail label={t('Last fired date')}>
            {rule?.fired_stats?.last_fired_at
              ? formatDateString(rule?.fired_stats?.last_fired_at)
              : ''}
          </PageDetail>
          <PageDetail label={t('Created')}>
            {rule?.created_at ? formatDateString(rule.created_at) : ''}
          </PageDetail>
          <PageDetail label={t('Last modified')}>
            {rule?.modified_at ? formatDateString(rule.modified_at) : ''}
          </PageDetail>
        </PageDetails>
        <PageDetailsSection>
          <PageDetail label={t('Conditions')}>
            <CodeBlock actions={actions}>
              <CodeBlockCode id="code-content">{rule?.conditions || ''} </CodeBlockCode>
            </CodeBlock>
          </PageDetail>
        </PageDetailsSection>
      </React.Fragment>
    );
  };
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={rule?.name}
        breadcrumbs={[{ label: t('Rules'), to: getPageUrl(EdaRoute.Rules) }, { label: rule?.name }]}
      />
      {rule ? (
        <PageTabs>
          <PageTab label={t('Details')}>{renderRuleDetailsTab(rule)}</PageTab>
        </PageTabs>
      ) : (
        <PageTabs>
          <PageTab>
            <PageSection variant="light">
              <Stack hasGutter>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </Stack>
            </PageSection>
          </PageTab>
        </PageTabs>
      )}
    </PageLayout>
  );
}
