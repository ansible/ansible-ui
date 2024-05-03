import { useTranslation } from 'react-i18next';
import {
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import { PageDetail, useGetPageUrl, TextCell } from '../../../../../../framework';
import { useGet } from '../../../../../common/crud/useGet';
import { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { jsonToYaml } from '../../../../../../framework/utils/codeEditorUtils';
import { AwxItemsResponse } from '../../../../common/AwxItemsResponse';
import { Label as ILabel } from '../../../../interfaces/Label';
import { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import { parseStringToTagArray } from '../../JobTemplateFormHelpers';
import { GraphNodeData } from '../types';
import { NodeCodeEditorDetail } from './NodeCodeEditorDetail';
import { NodeTagDetail } from './NodeTagDetail';
import { PromptDetail } from './PromptDetail';

export function WorkflowJobTemplateDetails({
  node,
  template,
}: {
  node: GraphNodeData;
  template: WorkflowJobTemplate;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { data: webhookKey } = useGet<{ webhook_key: string }>(template?.related?.webhook_key);
  const { data: nodeLabels } = useGet<AwxItemsResponse<ILabel>>(node?.resource?.related?.labels);
  const { data: launchConfig } = useGet<LaunchConfiguration>(template?.related?.launch);

  const showOptionsField = template.allow_simultaneous || template.webhook_service;
  const { launch_data: promptValues, resource: nodeValues, survey_data: surveyValues } = node;

  const scmBranch = promptValues?.scm_branch ?? nodeValues?.scm_branch ?? template?.scm_branch;
  const limit = promptValues?.limit ?? nodeValues?.limit ?? template?.limit;
  const inventory =
    promptValues?.inventory ??
    nodeValues.summary_fields.inventory ??
    template.summary_fields.inventory;
  let variables =
    promptValues?.extra_vars ??
    (nodeValues?.extra_data ? jsonToYaml(JSON.stringify(nodeValues.extra_data)) : undefined) ??
    template.extra_vars;

  if (surveyValues) {
    const jsonObj: { [key: string]: string } = {};

    if (variables) {
      const lines = variables.split('\n');
      lines.forEach((line) => {
        const [key, value] = line.split(':').map((part) => part.trim());
        jsonObj[key] = value;
      });
    }

    const mergedData: { [key: string]: string | string[] | { name: string }[] } = {
      ...jsonObj,
      ...surveyValues,
    };

    variables = jsonToYaml(JSON.stringify(mergedData));
  }

  return (
    <>
      <PageDetail label={t('Organization')} isEmpty={!template.summary_fields.organization}>
        <TextCell
          text={template.summary_fields.organization?.name}
          to={getPageUrl(AwxRoute.OrganizationDetails, {
            params: { id: template.summary_fields.organization?.id },
          })}
        />
      </PageDetail>
      <PromptDetail
        label={t('Inventory')}
        isOverridden={inventory?.id !== template.summary_fields.inventory?.id}
        overriddenValue={template.summary_fields.inventory?.name}
        isEmpty={!inventory}
      >
        <TextCell
          text={inventory?.name}
          to={getPageUrl(AwxRoute.InventoryDetails, {
            params: { id: inventory?.id },
          })}
        />
      </PromptDetail>
      <PromptDetail
        label={t('Source control branch')}
        isEmpty={!scmBranch}
        isOverridden={scmBranch !== template.scm_branch}
        overriddenValue={template.scm_branch}
      >
        {scmBranch}
      </PromptDetail>
      <PromptDetail
        label={t('Limit')}
        isEmpty={!limit}
        isOverridden={limit !== template.limit}
        overriddenValue={template.limit}
      >
        {limit}
      </PromptDetail>
      <PageDetail label={t('Webhook service')} isEmpty={!template.webhook_service}>
        {template.webhook_service === 'github' ? t('GitHub') : t('GitLab')}
      </PageDetail>
      <PageDetail label={t('Webhook key')} isEmpty={!webhookKey?.webhook_key}>
        {webhookKey?.webhook_key}
      </PageDetail>
      <PageDetail label={t('Webhook url')} isEmpty={!webhookKey?.webhook_key}>
        {`${window.location.origin}${template.related.webhook_receiver}`}
      </PageDetail>
      <PageDetail label={t('Enabled options')} isEmpty={!showOptionsField}>
        <TextList component={TextListVariants.ul}>
          {template.allow_simultaneous && (
            <TextListItem component={TextListItemVariants.li}>{t`Concurrent jobs`}</TextListItem>
          )}
          {template.webhook_service && (
            <TextListItem component={TextListItemVariants.li}>{t`Webhooks`}</TextListItem>
          )}
        </TextList>
      </PageDetail>
      <NodeTagDetail
        label={t('Labels')}
        nodeTags={
          launchConfig?.ask_labels_on_launch
            ? promptValues?.labels ?? nodeLabels?.results
            : template.summary_fields.labels?.results
        }
        templateTags={template.summary_fields.labels?.results}
      />
      <NodeTagDetail
        label={t('Job tags')}
        nodeTags={
          launchConfig?.ask_tags_on_launch
            ? promptValues?.job_tags ?? parseStringToTagArray(nodeValues?.job_tags || '')
            : parseStringToTagArray(template.job_tags || '')
        }
        templateTags={parseStringToTagArray(template.job_tags || '')}
      />
      <NodeTagDetail
        label={t('Skip tags')}
        nodeTags={
          launchConfig?.ask_skip_tags_on_launch
            ? promptValues?.skip_tags ?? parseStringToTagArray(nodeValues?.skip_tags || '')
            : parseStringToTagArray(template.skip_tags || '')
        }
        templateTags={parseStringToTagArray(template.skip_tags || '')}
      />
      <NodeCodeEditorDetail
        label={t('Variables')}
        nodeExtraVars={variables}
        templateExtraVars={template.extra_vars}
      />
    </>
  );
}
