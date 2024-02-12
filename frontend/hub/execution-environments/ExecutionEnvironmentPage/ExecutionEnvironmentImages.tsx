import { useTranslation } from 'react-i18next';
import { Scrollable, PageTable } from '../../../../framework';
import { useHubView } from '../../common/useHubView';
import { PageSection } from '@patternfly/react-core';
import { useParams } from 'react-router-dom';
import { hubAPI } from '../../common/api/formatPath';
import { idKeyFn } from '../../../common/utils/nameKeyFn';
import { useImagesFilters } from './hooks/useImagesFilters';
import { useImagesToolbarActions } from './hooks/useImagesToolbarActions';
import { useImagesColumns } from './hooks/useImagesColumns';

export interface ImageLayer {
  digest: string;
  size: number;
}

export interface Image {
  id: string;
  pulp_href: string;
  digest: string;
  schema_version: number;
  media_type: string;
  config_blob: { digest?: string };
  tags: string[];
  created_at: string;
  updated_at: string;
  layers: ImageLayer[];
  image_manifests: {
    os: string;
    architecture: string;
    os_version: string;
    os_features: string;
    features: string;
    variant: string;
    digest: string;
  }[];
}

export function ExecutionEnvironmentImages() {
  const { t } = useTranslation();

  const { id } = useParams<{ id: string }>();

  const tableColumns = useImagesColumns(id);
  const rowActions = useImagesToolbarActions();
  const toolbarFilters = useImagesFilters();

  const view = useHubView<Image>({
    url: hubAPI`/v3/plugin/execution-environments/repositories/${id || ''}/_content/images/`,
    keyFn: idKeyFn,
    tableColumns,
    toolbarFilters,
    queryParams: {
      exclude_child_manifests: 'true',
    },
  });

  return (
    <Scrollable>
      <PageSection variant="light">
        <PageTable<Image>
          id="hub-execution-environment-images-table"
          tableColumns={tableColumns}
          rowActions={rowActions}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading images')}
          emptyStateTitle={t('No images yet')}
          emptyStateDescription={t('Images will appear once uploaded')}
          {...view}
          defaultTableView="table"
          defaultSubtitle={t('Images')}
        />
      </PageSection>
    </Scrollable>
  );
}
