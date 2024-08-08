import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useMapContentTypeToDisplayName() {
  const { t } = useTranslation();
  /**
   * Maps content/resource types to a translated display name
   *
   * @param contentType content-type field received from the role_user_assignment/ role_team_assignment/ role_definitions APIs
   * @param options.isTitleCase indicates if the display name should be title case or not
   */
  return useCallback(
    (contentType: string, options?: { isTitleCase: boolean }) => {
      const contentTypeToDisplayName: { [key: string]: string } = {
        edacredential: options?.isTitleCase ? t('Credential') : t('credential'),
        credential: options?.isTitleCase ? t('Credential') : t('credential'),
        project: options?.isTitleCase ? t('Project') : t('project'),
        activation: options?.isTitleCase ? t('Rulebook activation') : t('rulebook activation'),
        rulebook: options?.isTitleCase ? t('Rulebook') : t('rulebook'),
        rulebookprocess: options?.isTitleCase ? t('Rulebook Process') : t('rulebook process'),
        credentialtype: options?.isTitleCase ? t('Credential Type') : t('credential type'),
        decisionenvironment: options?.isTitleCase
          ? t('Decision Environment')
          : t('decision environment'),
        auditrule: options?.isTitleCase ? t('Rule Audit') : t('rule audit'),
        team: options?.isTitleCase ? t('Team') : t('team'),
        organization: options?.isTitleCase ? t('Organization') : t('organization'),
        executionenvironment: options?.isTitleCase
          ? t('Execution Environment')
          : t('execution environment'),
        jobtemplate: options?.isTitleCase ? t('Job Template') : t('job template'),
        workflowjobtemplate: options?.isTitleCase
          ? t('Workflow Job Template')
          : t('workflow job template'),
        notificationtemplate: options?.isTitleCase
          ? t('Notification Template')
          : t('notification template'),
        instancegroup: options?.isTitleCase ? t('Instance Group') : t('instance group'),
        inventory: options?.isTitleCase ? t('Inventory') : t('inventory'),
        namespace: options?.isTitleCase ? t('Namespace') : t('namespace'),
        collectionremote: options?.isTitleCase ? t('Remote') : t('remote'),
        containernamespace: options?.isTitleCase
          ? t('Execution Environment')
          : t('execution environment'),
        ansiblerepository: options?.isTitleCase ? t('Repository') : t('repository'),
        system: options?.isTitleCase ? t('System') : t('system'),
      };
      const shortType = contentType?.split('.').pop() || contentType;

      return contentTypeToDisplayName[shortType] ?? shortType;
    },
    [t]
  );
}
