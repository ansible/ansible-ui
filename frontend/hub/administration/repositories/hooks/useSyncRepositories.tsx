import {
  PageFormSwitch,
  useGetPageUrl,
  usePageAlertToaster,
  usePageDialog,
} from '@ansible/ansible-ui-framework';
import { Modal, ModalVariant, ModalHeader, ModalBody } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { HubPageForm } from '../../../common/HubPageForm';
import { pulpAPI } from '../../../common/api/formatPath';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { postHubRequest } from '../../../common/api/request';
import { extractErrorDescription } from '../../../common/utils/errorUtils';
import { HubRoute } from '../../../main/HubRoutes';
import { TaskResponse } from '../../tasks/Task';
import { Repository } from '../Repository';

interface SyncFormProps {
  mirror: boolean;
  optimize: boolean;
}

export function useSyncRepositories() {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const alertToaster = usePageAlertToaster();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);
  const getPageUrl = useGetPageUrl();
  const syncFormValues: SyncFormProps = {
    mirror: true,
    optimize: true,
  };
  return (repository: Repository) => {
    setDialog(
      <Modal
        aria-label={t(`Sync repository ${repository.name}`)}
        isOpen
        onClose={() => {
          onClose();
        }}
        variant={ModalVariant.large}
        tabIndex={0}
      >
        <ModalHeader title={t(`Sync repository ${repository.name}`)} />
        <ModalBody>
          <HubPageForm<SyncFormProps>
            submitText={t('Sync')}
            onSubmit={(values: SyncFormProps) => {
              return postHubRequest(
                pulpAPI`/repositories/ansible/ansible/${
                  parsePulpIDFromURL(repository.pulp_href) || ''
                }/sync/`,
                values
              )
                .then(({ response, statusCode }) => {
                  const taskId =
                    statusCode === 202
                      ? parsePulpIDFromURL((response as TaskResponse)?.task)
                      : null;
                  alertToaster.addAlert({
                    variant: 'info',
                    title: t(`Sync started for repository "${repository.name}".`),
                    children: (
                      <span>
                        {t('See the task management ')}
                        {taskId ? (
                          <Link to={getPageUrl(HubRoute.TaskPage, { params: { id: taskId } })}>
                            {t('detail page')}
                          </Link>
                        ) : (
                          t('detail page')
                        )}
                        {t(' for the status of this task.')}
                      </span>
                    ),
                  });
                  onClose();
                })
                .catch((error: unknown) => {
                  alertToaster.addAlert({
                    variant: 'danger',
                    title: t(`Failed to sync repository "${repository.name}"`),
                    children: extractErrorDescription(error),
                  });
                  onClose();
                });
            }}
            onCancel={() => onClose()}
            defaultValue={syncFormValues}
          >
            <PageFormSwitch
              name={'mirror'}
              label={t`Mirror`}
              labelHelp={t(
                'If selected, all content that is not present in the remote repository will be removed from the local repository; otherwise, sync will add missing content.'
              )}
              labelOn={t`Content not present in remote repository will be removed from the local repository`}
            />
            <br />
            <PageFormSwitch
              name="optimize"
              label={t`Optimize`}
              labelHelp={t(
                'Only perform the sync if no changes are reported by the remote server. To force a sync to happen, deselect this option.'
              )}
              labelOn={t`Only perform the sync if no changes are reported by the remote server.`}
            />
            <br />
          </HubPageForm>
        </ModalBody>
      </Modal>
    );
  };
}
