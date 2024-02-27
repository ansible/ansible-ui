import { Button, ClipboardCopy, Title } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  LoadingPage,
  PageDetail,
  PageDetails,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import { EmptyStateNoData } from '../../../../framework/components/EmptyStateNoData';
import { useClipboard } from '../../../../framework/hooks/useClipboard';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { MarkdownEditor } from '../../common/MarkdownEditor';
import { hubAPI } from '../../common/api/formatPath';
import { hubAPIPut } from '../../common/api/hub-api-utils';
import { getContainersURL } from '../../common/utils/getContainersURL';
import { HubRoute } from '../../main/HubRoutes';

const ControlButtons = styled.div`
  display: flex;
`;

const EditButtonWrapper = styled.div`
  float: right;
`;

interface ReadmeType {
  updated_at: string;
  created_at: string;
  text: string;
}

export function ExecutionEnvironmentDetails() {
  const { t } = useTranslation();
  const { writeToClipboard } = useClipboard();
  const { id } = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const alertToaster = usePageAlertToaster();

  const [markdownEditing, setMarkdownEditing] = useState(false);
  const [readme, setReadme] = useState<string>('');

  const { data, isLoading, error, refresh } = useGet<ReadmeType>(
    id ? hubAPI`/v3/plugin/execution-environments/repositories/${id}/_content/readme/` : ''
  );

  useEffect(() => {
    setReadme(data?.text ?? '');
  }, [data]);

  const saveMarkdown = async (name: string) => {
    try {
      await hubAPIPut<ReadmeType>(
        hubAPI`/v3/plugin/execution-environments/repositories/${name}/_content/readme/`,
        {
          text: readme,
        }
      );
    } catch (e) {
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to save README file'),
        children: error instanceof Error && error.message,
      });
    }

    setMarkdownEditing(false);
  };

  if (isLoading || !id) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  const instructions =
    'podman pull ' +
    getContainersURL({
      name: id,
    });

  return (
    <PageDetails numberOfColumns={'single'}>
      <Title headingLevel="h2">{t('Instructions')}</Title>
      <PageDetail label={t('Pull this image')}>
        <ClipboardCopy
          data-cy="clipboard-copy"
          hoverTip={t('Copy to clipboard')}
          clickTip={t('Successfully copied to clipboard!')}
          textAriaLabel={t('Copyable input')}
          toggleAriaLabel={t('Show content')}
          onCopy={() => {
            writeToClipboard(instructions ?? '');
          }}
          isReadOnly
        >
          {instructions}
        </ClipboardCopy>
      </PageDetail>
      <PageDetail label={(markdownEditing || readme) && t('README')}>
        {!markdownEditing && readme && (
          <EditButtonWrapper>
            <Button
              variant={'primary'}
              onClick={() => {
                setMarkdownEditing(true);
              }}
            >
              {t`Edit`}
            </Button>
          </EditButtonWrapper>
        )}
        {!markdownEditing && !readme ? (
          <EmptyStateNoData
            title={t`No README`}
            description={t`Add a README with instructions for using this container.`}
            button={
              <Button
                data-cy="add-readme"
                variant="primary"
                onClick={() => setMarkdownEditing(true)}
              >
                {t`Add`}
              </Button>
            }
          />
        ) : (
          <MarkdownEditor
            text={readme}
            placeholder={''}
            helperText={''}
            updateText={(value: string) => {
              setReadme(value);
            }}
            editing={markdownEditing}
          />
        )}
        {markdownEditing && (
          <ControlButtons>
            <div data-cy="save-readme">
              <Button
                variant={'primary'}
                onClick={() => {
                  void saveMarkdown(id);
                }}
              >
                {t`Save`}
              </Button>
            </div>
            <Button
              variant={'link'}
              onClick={() => {
                pageNavigate(HubRoute.ExecutionEnvironmentPage, { params: { id } });
              }}
            >
              {t`Cancel`}
            </Button>
          </ControlButtons>
        )}
      </PageDetail>
    </PageDetails>
  );
}
