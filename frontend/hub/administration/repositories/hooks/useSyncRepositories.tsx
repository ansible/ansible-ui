import { Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  PageForm,
  usePageDialog,
  PageFormSwitch,
  errorToAlertProps,
  usePageAlertToaster,
} from '../../../../../framework';
import { Repository } from '../Repository';
import { useCallback } from 'react';
import { postHubRequest } from '../../../common/api/request';
import { pulpAPI } from '../../../common/api/formatPath';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';

interface SyncFormProps {
  mirror: boolean;
  optimize: boolean;
}

export function useSyncRepositories() {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const alertToaster = usePageAlertToaster();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);
  const syncFormValues: SyncFormProps = {
    mirror: true,
    optimize: true,
  };
  return (repository: Repository) => {
    setDialog(
      <Modal
        title={t(`Sync repository ${repository.name}`)}
        aria-label={t(`Syn repository ${repository.name}`)}
        isOpen
        onClose={() => {
          onClose();
        }}
        variant={ModalVariant.large}
        tabIndex={0}
        hasNoBodyWrapper
      >
        <PageForm<SyncFormProps>
          submitText={t('Sync')}
          onSubmit={(values: SyncFormProps) => {
            return postHubRequest(
              pulpAPI`/repositories/ansible/ansible/${
                parsePulpIDFromURL(repository.pulp_href) || ''
              }/sync/`,
              values
            )
              .then(() => onClose())
              .catch((error) => {
                alertToaster.addAlert(errorToAlertProps(error));
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
            labelOff={t`Sync will only add missing content`}
          />
          <br />
          <PageFormSwitch
            name="optimize"
            label={t`Optimize`}
            labelHelp={t(
              'Only perform the sync if no changes are reported by the remote server. To force a sync to happen, deselect this option.'
            )}
            labelOn={t`Only perform the sync if no changes are reported by the remote server.`}
            labelOff={t`Force a sync to happen.`}
          />
          <br />
        </PageForm>
      </Modal>
    );
  };
}
