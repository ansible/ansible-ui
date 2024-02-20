import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LabelGroup, ClipboardCopyButton, Stack, StackItem } from '@patternfly/react-core';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  BytesCell,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { useGet } from '../../../common/crud/useGet';
import { HubRoute } from '../../main/HubRoutes';
import { ShaLabel, TagLabel } from './components/ImageLabels';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { ImageLayer, ExecutionEnvironmentImage } from './ExecutionEnvironmentImage';

export function ExecutionEnvironmentImagePage() {
  const { t } = useTranslation();
  const { id, tag } = useParams<{ id: string; tag: string }>();
  const getPageUrl = useGetPageUrl();

  const {
    data: ee,
    isLoading: isEELoading,
    error: EEError,
  } = useGet<ExecutionEnvironment>(
    id && tag ? hubAPI`/v3/plugin/execution-environments/repositories/${id}/` : ''
  );

  const {
    data: image,
    isLoading: isEEimageLoading,
    error: imageError,
  } = useGet<ExecutionEnvironmentImage>(
    id && tag
      ? hubAPI`/v3/plugin/execution-environments/repositories/${id}/_content/images/${tag}/`
      : ''
  );

  if (EEError || !ee) {
    return <HubError error={EEError} />;
  }

  if (isEELoading || isEEimageLoading) {
    return <LoadingPage breadcrumbs tabs />;
  }

  const sumLayers = (layers: ImageLayer[]) => layers.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <PageLayout>
      <PageHeader
        title={t`Image layers`}
        breadcrumbs={[
          { label: t('Execution Environments'), to: getPageUrl(HubRoute.ExecutionEnvironments) },
          {
            label: ee.name,
            to: getPageUrl(HubRoute.ExecutionEnvironmentDetails, { params: { id: ee.name } }),
          },
          { label: t('Image layers') },
        ]}
        footer={
          <div>
            <Stack hasGutter>
              {image && (
                <StackItem>
                  <ShaLabel digest={image.digest} long={true} />
                  <ClipboardCopyButton
                    variant={'plain'}
                    onClick={() => {
                      void navigator.clipboard.writeText(image.digest);
                    }}
                    id={image.digest}
                    textId={t`Copy to clipboard`}
                  >
                    {image.digest}
                  </ClipboardCopyButton>
                </StackItem>
              )}
              <StackItem>
                <LabelGroup>
                  {image ? (
                    <>
                      {image.tags.map((tag) => (
                        <TagLabel key={tag} tag={tag} />
                      ))}
                    </>
                  ) : (
                    <TagLabel tag={tag ?? ''} />
                  )}
                </LabelGroup>
              </StackItem>
              {image && (
                <StackItem>
                  {t`Size`}: <BytesCell bytes={sumLayers(image?.layers)} />
                </StackItem>
              )}
            </Stack>
          </div>
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Execution Environment'),
          page: HubRoute.ExecutionEnvironmentImages,
          persistentFilterKey: '',
        }}
        tabs={[]}
        params={{ id: ee?.name }}
        componentParams={{ image, imageError }}
      />
    </PageLayout>
  );
}
