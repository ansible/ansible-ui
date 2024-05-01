import { useTranslation } from 'react-i18next';
import { ITableColumn, IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { useMemo } from 'react';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import { Title } from '@patternfly/react-core';
import { EdaActivationInstance } from '../../../interfaces/EdaActivationInstance';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../../../interfaces/EdaDecisionEnvironment';
import { EdaRulebook } from '../../../interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../interfaces/EdaRulebookActivation';
import { EdaRuleAudit } from '../../../interfaces/EdaRuleAudit';
import { EdaProject } from '../../../interfaces/EdaProject';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';
import { useEdaMultiSelectListView } from '../../../common/useEdaMultiSelectListView';
import { edaAPI } from '../../../common/eda-utils';
import styled from 'styled-components';

export type EdaResourceType =
  | EdaActivationInstance
  | EdaCredential
  | EdaDecisionEnvironment
  | EdaRulebook
  | EdaRulebookActivation
  | EdaRuleAudit
  | EdaProject
  | EdaCredentialType;

const resourceToEndpointMapping: { [key: string]: string } = {
  'eda.edacredential': edaAPI`/eda-credentials/`,
  'eda.project': edaAPI`/projects/`,
  'eda.activation': edaAPI`/activations/`,
  'eda.rulebook': edaAPI`/rulebooks/`,
  'eda.rulebookprocess': edaAPI`/activation-instances/`,
  'eda.credentialtype': edaAPI`/credential-types/`,
  'eda.decisionenvironment': edaAPI`/decision-environments/`,
  'eda.auditrule': edaAPI`/audit-rules/`,
};

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

/** Roles wizard step for selecting resources based on the resourceType selected */
export function EdaSelectResourcesStep() {
  const { wizardData } = usePageWizard();
  const { t } = useTranslation();
  const { resourceType } = wizardData as { [key: string]: unknown };

  const resourceToTitleMapping = useMemo<{ [key: string]: string }>(() => {
    return {
      'eda.edacredential': t('Select credentials'),
      'eda.project': t('Select projects'),
      'eda.activation': t('Select rulebook activations'),
      'eda.rulebook': t('Select rulebooks'),
      'eda.rulebookprocess': t('Select rulebook processes'),
      'eda.credentialtype': t('Select credential types'),
      'eda.decisionenvironment': t('Select decision environments'),
      'eda.auditrule': t('Select audit rules'),
    };
  }, [t]);
  const tableColumns = useMemo<ITableColumn<EdaResourceType>[]>(
    () => [
      {
        header: t('Name'),
        type: 'text',
        value: (item: EdaResourceType) => item.name,
        sort: 'name',
      },
    ],
    [t]
  );
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name__contains',
        comparison: 'contains',
      },
    ],
    [t]
  );

  const view = useEdaMultiSelectListView<EdaResourceType>(
    {
      url: resourceToEndpointMapping[resourceType as string],
      toolbarFilters,
      tableColumns,
    },
    'resources'
  );

  return (
    <>
      <StyledTitle headingLevel="h1">{resourceToTitleMapping[resourceType as string]}</StyledTitle>
      <h2 style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        {t(
          "Choose the resources that will be receiving new roles. You'll be able to select the roles to apply in the next step. Note that the resources chosen here will receive all roles chosen in the next step."
        )}
      </h2>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        labelForSelectedItems={t('Selected')}
      />
    </>
  );
}
