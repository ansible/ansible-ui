import { useTranslation } from 'react-i18next';
import { Scrollable, PageTable } from '../../../../framework';
import { useHubView } from '../../common/useHubView';
import { PageSection, Title } from '@patternfly/react-core';
import { useOutletContext } from 'react-router-dom';
import { hubAPI } from '../../common/api/formatPath';
import { idKeyFn } from '../../../common/utils/nameKeyFn';
import { useImagesFilters } from './hooks/useImagesFilters';
import { useImagesToolbarActions } from './hooks/useImagesToolbarActions';
import { useImagesColumns } from './hooks/useImagesColumns';
import { Table, Thead, Tbody, Th, Tr, Td } from '@patternfly/react-table';
import { ShaLink } from './components/ImageLabels';
import { isManifestList } from '../../common/utils/isManifestList';
import { ExecutionEnvironmentImage as Image } from './ExecutionEnvironmentImage';
import { ExecutionEnvironment } from '../ExecutionEnvironment';

export function ExecutionEnvironmentImages() {
  const { t } = useTranslation();
  const { executionEnvironment } = useOutletContext<{
    executionEnvironment: ExecutionEnvironment;
  }>();

  const id = executionEnvironment.name;

  const tableColumns = useImagesColumns({ id });
  const rowActions = useImagesToolbarActions(id);
  const toolbarFilters = useImagesFilters();

  const view = useHubView<Image>({
    url: hubAPI`/v3/plugin/execution-environments/repositories/${id}/_content/images/`,
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
          expandedRow={(image: Image) =>
            isManifestList(image) ? <ExpandedContentTable id={id} image={image} /> : null
          }
        />
      </PageSection>
    </Scrollable>
  );
}

function ExpandedContentTable({ image, id }: { image: Image; id: string }) {
  const { t } = useTranslation();

  return (
    <Table variant="compact">
      <Thead>
        <Tr>
          <Th>
            <Title headingLevel="h3">{t('Digest')}</Title>
          </Th>
          <Th>
            <Title headingLevel="h3">{t('OS / Arch')}</Title>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {image.image_manifests.map((manifest) => (
          <Tr key={manifest.digest}>
            <Td>
              <ShaLink id={id} digest={manifest.digest} />
            </Td>
            <Td>
              {manifest.os} / {manifest.architecture} {manifest.variant}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
