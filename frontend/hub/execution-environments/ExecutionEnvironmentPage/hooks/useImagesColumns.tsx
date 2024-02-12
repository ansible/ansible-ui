import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, CopyCell, DateTimeCell } from '../../../../../framework';
import { LabelGroup } from '@patternfly/react-core';
import { TagLink, ShaLink, TagLabel, ShaLabel } from '../components/ImageLabels';
import styled from 'styled-components';
import { getContainersURL } from '../../../common/utils/getContainersURL';
import { getHumanSize } from '../../../common/utils/getHumanSize';
import { Image, ImageLayer } from '../ExecutionEnvironmentImages';

const DigestAndCopyCell = styled.div`
  display: flex;
  gap: 8px;
`;

export function useImagesColumns(
  id: string | undefined,
  isManifestList: (image: Image) => boolean
) {
  const { t } = useTranslation();

  const instructions =
    'podman pull ' +
    getContainersURL({
      name: id || '',
    });

  const sumLayers = (layers: ImageLayer[]) => layers.reduce((acc, curr) => acc + curr.size, 0);

  return useMemo<ITableColumn<Image>[]>(
    () => [
      {
        header: t('Tag'),
        cell: (image) => (
          <LabelGroup style={{ maxWidth: '300px' }}>
            {image.tags.map((tag) =>
              isManifestList(image) ? (
                <TagLabel key={tag} tag={tag} />
              ) : (
                <>{id ? <TagLink key={tag} id={id} tag={tag} /> : null}</>
              )
            )}
          </LabelGroup>
        ),
      },
      {
        header: t('Published'),
        cell: (image) => <DateTimeCell value={image.created_at} />,
      },
      {
        header: t('Layers'),
        type: 'text',
        value: (image) => (isManifestList(image) ? '---' : image.layers?.length.toString() ?? '0'),
      },
      {
        header: t('Size'),
        type: 'text',
        value: (image) =>
          isManifestList(image) ? '---' : getHumanSize(sumLayers(image.layers), t),
      },
      {
        header: t('Digest'),
        cell: (image) => (
          <DigestAndCopyCell>
            {isManifestList(image) ? (
              <ShaLabel digest={image.digest} />
            ) : (
              <>{id && <ShaLink id={id} digest={image.digest} />}</>
            )}
            <CopyCell minWidth={50} text={instructions} />
          </DigestAndCopyCell>
        ),
      },
    ],
    [id, instructions, isManifestList, t]
  );
}
