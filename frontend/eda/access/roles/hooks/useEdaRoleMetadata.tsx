import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type EdaRoleMetadaContentType = {
  displayName: string;
  permissions: {
    [key: string]: string;
  };
};

export enum EdaContentTypes {
  Activation = 'eda.activation',
  AuditRule = 'eda.auditrule',
  Credential = 'eda.edacredential',
  CredentialType = 'eda.credentialtype',
  DecisionEnvironment = 'eda.decisionenvironment',
  ExtraVar = 'eda.extravar',
  Organization = 'shared.organization',
  Project = 'eda.project',
  Rulebook = 'eda.rulebook',
  RulebookProcess = 'eda.rulebookprocess',
  Team = 'shared.team',
}

export interface EdaRoleMetadata {
  content_types: Record<EdaContentTypes, EdaRoleMetadaContentType>;
}

export function useEdaRoleMetadata(): EdaRoleMetadata {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      content_types: {
        'eda.activation': {
          displayName: t('Activation'),
          permissions: {
            'eda.enable_activation': t('Enable activation'),
            'eda.disable_activation': t('Disable activation'),
            'eda.restart_activation': t('Restart activation'),
            'eda.view_activation': t('View activation'),
            'eda.delete_activation': t('Delete activation'),
            'eda.view_rulebookprocess': t('View rulebook process'),
            'eda.view_auditrule': t('View audit rule'),
          },
        },
        'eda.auditrule': {
          displayName: t('Audit Rule'),
          permissions: {
            'eda.view_auditrule': t('View audit rule'),
          },
        },
        'eda.edacredential': {
          displayName: t('Credential'),
          permissions: {
            'eda.add_edacredential': t('Add credential'),
            'eda.change_edacredential': t('Change credential'),
            'eda.delete_edacredential': t('Delete credential'),
            'eda.view_edacredential': t('View credential'),
          },
        },
        'eda.credentialtype': {
          displayName: t('Credential Type'),
          permissions: {
            'eda.change_credentialtype': t('Change credential type'),
            'eda.delete_credentialtype': t('Delete credential type'),
            'eda.view_credentialtype': t('View credential type'),
          },
        },
        'eda.decisionenvironment': {
          displayName: t('Decision Environment'),
          permissions: {
            'eda.change_decisionenvironment': t('Change decision environment'),
            'eda.delete_decisionenvironment': t('Delete decision environment'),
            'eda.view_decisionenvironment': t('View decision environment'),
          },
        },
        'eda.extravar': {
          displayName: t('Extra Var'),
          permissions: {
            'eda.view_extravar': t('View extra var'),
          },
        },
        'shared.organization': {
          displayName: t('Organization'),
          permissions: {
            'shared.member_organization': t('Member organization'),
            'shared.change_organization': t('Change organization'),
            'shared.delete_organization': t('Delete organization'),
            'shared.view_organization': t('View organization'),
            'eda.enable_activation': t('Enable activation'),
            'eda.disable_activation': t('Disable activation'),
            'eda.restart_activation': t('Restart activation'),
            'eda.add_activation': t('Add activation'),
            'eda.view_activation': t('View activation'),
            'eda.delete_activation': t('Delete activation'),
            'eda.view_rulebookprocess': t('View rulebook process'),
            'eda.view_auditrule': t('View audit rule'),
            'eda.add_credentialtype': t('Add credential type'),
            'eda.change_credentialtype': t('Change credential type'),
            'eda.delete_credentialtype': t('Delete credential type'),
            'eda.view_credentialtype': t('View credential type'),
            'eda.add_edacredential': t('Add credential'),
            'eda.change_edacredential': t('Change credential'),
            'eda.delete_edacredential': t('Delete credential'),
            'eda.view_edacredential': t('View credential'),
            'eda.add_decisionenvironment': t('Add decision environment'),
            'eda.change_decisionenvironment': t('Change decision environment'),
            'eda.delete_decisionenvironment': t('Delete decision environment'),
            'eda.view_decisionenvironment': t('View decision environment'),
            'eda.add_extravar': t('Add extra var'),
            'eda.view_extravar': t('View extra var'),
            'eda.add_project': t('Add project'),
            'eda.change_project': t('Change project'),
            'eda.delete_project': t('Delete project'),
            'eda.view_project': t('View project'),
            'eda.view_rulebook': t('View rulebook'),
            'shared.member_team': t('Member team'),
            'shared.add_team': t('Add team'),
            'shared.change_team': t('Change team'),
            'shared.delete_team': t('Delete team'),
            'shared.view_team': t('View team'),
          },
        },
        'eda.project': {
          displayName: t('Project'),
          permissions: {
            'eda.change_project': t('Change project'),
            'eda.delete_project': t('Delete project'),
            'eda.view_project': t('View project'),
            'eda.view_rulebook': t('View rulebook'),
          },
        },
        'eda.rulebook': {
          displayName: t('Rulebook'),
          permissions: {
            'eda.view_rulebook': t('View rulebook'),
          },
        },
        'eda.rulebookprocess': {
          displayName: t('Rulebook Process'),
          permissions: {
            'eda.view_rulebookprocess': t('View rulebook process'),
            'eda.view_auditrule': t('View audit rule'),
          },
        },
        'shared.team': {
          displayName: t('Team'),
          permissions: {
            'shared.member_team': t('Member team'),
            'shared.add_team': t('Add team'),
            'shared.change_team': t('Change team'),
            'shared.delete_team': t('Delete team'),
            'shared.view_team': t('View team'),
          },
        },
      },
    }),
    [t]
  );
}
