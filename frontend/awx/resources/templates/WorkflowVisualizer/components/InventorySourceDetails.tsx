import { useTranslation } from 'react-i18next';
import { PageDetail, TextCell, useGetPageUrl } from '../../../../../../framework';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useOptions } from '../../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../../interfaces/OptionsResponse';
import { InventorySource } from '../../../../interfaces/InventorySource';
import { useVerbosityString } from '../../../../common/useVerbosityString';
import { AwxRoute } from '../../../../main/AwxRoutes';

export function InventorySourceDetails({ source }: { source: InventorySource }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const sourceOptions = useGetSourceOptions();
  const verbosityString = useVerbosityString(source.verbosity);

  return (
    <>
      <PageDetail label={t('Organization')} isEmpty={!source.summary_fields.organization}>
        <TextCell
          text={source.summary_fields.organization?.name}
          to={getPageUrl(AwxRoute.OrganizationDetails, {
            params: { id: source.summary_fields.organization?.id },
          })}
        />
      </PageDetail>
      <PageDetail label={t('Inventory')} isEmpty={!source.summary_fields.inventory}>
        <TextCell
          text={source.summary_fields.inventory?.name}
          to={getPageUrl(AwxRoute.InventoryDetails, {
            params: { id: source.summary_fields.inventory?.id },
          })}
        />
      </PageDetail>
      <PageDetail label={t('Project')} isEmpty={!source.summary_fields.source_project}>
        <TextCell
          text={source.summary_fields.source_project?.name}
          to={getPageUrl(AwxRoute.ProjectDetails, {
            params: { id: source.summary_fields.source_project?.id },
          })}
        />
      </PageDetail>
      <PageDetail label={t`Source`}>{sourceOptions[source.source]}</PageDetail>
      <PageDetail label={t`Inventory file`}>
        {source.source_path === '' ? t`/ (project root)` : source.source_path}
      </PageDetail>
      <PageDetail label={t`Verbosity`}>{verbosityString}</PageDetail>
      <PageDetail label={t`Source control branch`}>{source.scm_branch}</PageDetail>
      <PageDetail
        label={t('Cache Timeout')}
      >{`${source?.update_cache_timeout} seconds`}</PageDetail>
    </>
  );
}

function useGetSourceOptions() {
  const { data: sourceOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventory_sources/`
  );
  const sourceMap = sourceOptions?.actions?.GET?.source?.choices?.reduce(
    (acc, [key, val]) => {
      acc[key] = val;
      return acc;
    },
    {} as Record<string, string>
  );
  return sourceMap ?? {};
}
