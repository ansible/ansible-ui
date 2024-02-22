import { useMemo, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, CopyCell, DateTimeCell, BytesCell } from '../../../../../framework';
import { LabelGroup } from '@patternfly/react-core';
import { TagLink, ShaLink, TagLabel, ShaLabel } from '../components/ImageLabels';
import styled from 'styled-components';
import { getContainersURL } from '../../../common/utils/getContainersURL';
import { ImageLayer, ExecutionEnvironmentImage as Image } from '../ExecutionEnvironmentImage';

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
            {image.tags.map((tag) => (
              <Fragment key={tag}>
                {isManifestList(image) ? (
                  <TagLabel tag={tag} />
                ) : (
                  <>{id ? <TagLink id={id} tag={tag} /> : null}</>
                )}
              </Fragment>
            ))}
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
        cell: (image) =>
          isManifestList(image) ? <>---</> : <BytesCell bytes={sumLayers(image.layers)} />,
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
