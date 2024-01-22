import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TextCell, compareStrings } from '../../../../../framework';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { CredentialType } from '../../../interfaces/CredentialType';
import { useCredentialTypesColumns } from './useCredentialTypesColumns';

export function useDeleteCredentialTypes(onComplete: (users: CredentialType[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useCredentialTypesColumns();
  const deleteActionNameColumn = useMemo(
    () => ({
      header: t('Name'),
      cell: (credentialType: CredentialType) => <TextCell text={credentialType.name} />,
      sort: 'name',
      maxWidth: 200,
    }),
    [t]
  );

  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const cannotDeleteCredentialTypeDueToPermissions = (credentialType: CredentialType) =>
    credentialType.summary_fields?.user_capabilities?.delete
      ? ''
      : t(`The credential type cannot be deleted due to insufficient permissions.`);
  const cannotDeleteManagedCredentialType = (credentialType: CredentialType) =>
    credentialType.managed
      ? t(`The credential type is provided by the system and is read-only.`)
      : '';

  const bulkAction = useAwxBulkConfirmation<CredentialType>();
  const deleteCredentialTypes = (credentialTypes: CredentialType[]) => {
    const undeletableManagedCredentialTypes: CredentialType[] = credentialTypes.filter(
      (credentialType) => credentialType.managed
    );
    const customCredentialTypes: CredentialType[] = credentialTypes.filter(
      (credentialType) => !credentialType.managed
    );
    const undeletableCustomCredentialTypesDueToPermissions: CredentialType[] =
      customCredentialTypes.filter(cannotDeleteCredentialTypeDueToPermissions);

    bulkAction({
      title: t('Permanently delete credential types', { count: credentialTypes.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} credential types.', {
        count:
          credentialTypes.length -
          undeletableManagedCredentialTypes.length -
          undeletableCustomCredentialTypesDueToPermissions.length,
      }),
      actionButtonText: t('Delete credential types', { count: credentialTypes.length }),
      items: credentialTypes.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompts:
        undeletableManagedCredentialTypes.length ||
        undeletableCustomCredentialTypesDueToPermissions.length
          ? [
              ...(undeletableManagedCredentialTypes.length
                ? [
                    t(
                      '{{count}} of the selected credential types cannot be deleted because they are read-only.',
                      {
                        count: undeletableManagedCredentialTypes.length,
                      }
                    ),
                  ]
                : []),
              ...(undeletableCustomCredentialTypesDueToPermissions.length
                ? [
                    t(
                      '{{count}} of the selected credential types cannot be deleted due to insufficient permissions.',
                      {
                        count: undeletableCustomCredentialTypesDueToPermissions.length,
                      }
                    ),
                  ]
                : []),
            ]
          : undefined,
      isItemNonActionable: (credentialType: CredentialType) =>
        cannotDeleteManagedCredentialType(credentialType)
          ? cannotDeleteManagedCredentialType(credentialType)
          : cannotDeleteCredentialTypeDueToPermissions(credentialType),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (credentialType: CredentialType, signal) =>
        requestDelete(awxAPI`/credential_types/${credentialType.id.toString()}/`, signal),
    });
  };
  return deleteCredentialTypes;
}
