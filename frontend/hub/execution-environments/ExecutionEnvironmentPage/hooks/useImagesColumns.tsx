import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, CopyCell, DateTimeCell } from '../../../../../framework';
import { LabelGroup } from '@patternfly/react-core';
import { TagLink, ShaLink } from '../components/ImageLabels';
import styled from 'styled-components';
import { getContainersURL } from '../../../common/utils/getContainersURL';
import { getHumanSize } from '../../../common/utils/getHumanSize';
import { Image, ImageLayer } from '../ExecutionEnvironmentImages';

const DigestAndCopyCell = styled.div`
  display: flex;
  gap: 8px;
`;

export function useImagesColumns(id?: string) {
  const { t } = useTranslation();

  const instructions =
    'podman pull ' +
    getContainersURL({
      name: id || '',
    });

  const sumLayers = (layers: ImageLayer[]) => layers.reduce((acc, curr) => acc + curr.size, 0);

  // const isManifestList = (item: Image) => {
  //   return !!item.media_type.match('manifest.list');
  // };

  return useMemo<ITableColumn<Image>[]>(
    () => [
      {
        header: t('Tag'),
        cell: (item) => (
          <LabelGroup style={{ maxWidth: '300px' }}>
            {item.tags.map((tag) => (id ? <TagLink key={tag} id={id} tag={tag} /> : null))}
          </LabelGroup>
        ),
      },
      {
        header: t('Published'),
        cell: (item) => <DateTimeCell format="since" value={item.created_at} />,
      },
      {
        header: t('Layers'),
        type: 'count',
        value: (item) => item.layers?.length ?? 0,
      },
      {
        header: t('Size'),
        type: 'text',
        value: (item) => getHumanSize(sumLayers(item.layers), t),
      },
      {
        header: t('Digest'),
        cell: (item) => (
          <DigestAndCopyCell>
            {id && <ShaLink id={id} digest={item.digest} />}
            <CopyCell minWidth={50} text={instructions} />
          </DigestAndCopyCell>
        ),
      },
    ],
    [id, instructions, t]
  );
}
