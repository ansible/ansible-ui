import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { CopyIcon, PencilAltIcon, SyncAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../../framework';
import { CollectionVersionSearch } from '../../../collections/Collection';
import { PROTECTED_REPOSITORIES } from '../../../common/constants';
import { Repository } from '../Repository';
import { useDeleteRepositories } from './useDeleteRepositories';
import { getRepositoryBasePath } from '../../../common/api/hub-api-utils';
import { getRepoURL } from '../../../common/api/hub-api-utils';
import { useClipboard } from '../../../../../framework/hooks/useClipboard';
import { HubRoute } from '../../../main/HubRoutes';
import { useSyncRepositories } from './useSyncRepositories';
import { useDeleteCollectionsFromRepository } from '../../../collections/hooks/useDeleteCollectionsFromRepository';

export function useRepositoryActions(options: {
  onRepositoriesDeleted: (repositories: Repository[]) => void;
}) {
  const { t } = useTranslation();
  const { onRepositoriesDeleted } = options;
  const deleteRepositories = useDeleteRepositories(onRepositoriesDeleted);
  const alertToaster = usePageAlertToaster();
  const syncRepositories = useSyncRepositories();
  const { writeToClipboard } = useClipboard();
  const pageNavigate = usePageNavigate();
  const actions = useMemo<IPageAction<Repository>[]>(
    () => [
      {
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit repository'),
        onClick: (repository) =>
          pageNavigate(HubRoute.EditRepository, { params: { id: repository.name } }),
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
      {
        type: PageActionType.Seperator,
      },
      {
        icon: SyncAltIcon,
        label: t('Sync repository'),
        onClick: (repo) => {
          syncRepositories(repo);
        },
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        isDisabled: (repo) => {
          return repo.remote
            ? undefined
            : t('There are no remotes associated with this repository');
        },
      },
      {
        icon: CopyIcon,
        label: t('Copy CLI configuration'),
        onClick: (repo) => {
          const alertNoDistro: AlertProps = {
            variant: 'danger',
            title: t('There are no distributions associated with this repository.'),
          };

          getRepositoryBasePath(repo.name, repo.pulp_href, t).then(
            (distroBasePath) => {
              const cliConfig = [
                '[galaxy]',
                `server_list = ${distroBasePath}`,
                '',
                `[galaxy_server.${distroBasePath}]`,
                `url=${getRepoURL(distroBasePath)}`,
                'token=<put your token here>',
              ].join('\n');
              // This will show alert Copied to clipboard
              writeToClipboard(cliConfig);
            },
            () => alertToaster.addAlert(alertNoDistro)
          );
        },
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
      },
      { type: PageActionType.Seperator },
      {
        icon: TrashIcon,
        label: t('Delete repository'),
        onClick: (repository) => deleteRepositories([repository]),
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        isDanger: true,
        isDisabled: (repo) => {
          return PROTECTED_REPOSITORIES.includes(repo.name)
            ? t('Protected repository cannot be deleted')
            : undefined;
        },
      },
    ],
    [t, deleteRepositories, alertToaster, writeToClipboard, pageNavigate, syncRepositories]
  );

  return actions;
}

export function useCollectionVersionsActionsRemove(
  repository: Repository,
  callback?: (collections: CollectionVersionSearch[]) => void
) {
  const { t } = useTranslation();
  const deleteCollectionsVersionsFromRepository = useDeleteCollectionsFromRepository(
    repository,
    callback,
    true,
    false
  );

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      {
        icon: TrashIcon,
        label: t('Remove'),
        onClick: (collections) => deleteCollectionsVersionsFromRepository([collections]),
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        isDanger: true,
        isPinned: true,
      },
    ],
    [t, deleteCollectionsVersionsFromRepository]
  );
}
