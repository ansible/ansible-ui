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
        activation: options?.isTitleCase ? t('Rulebook activation') : t('rulebook activation'),
        ansiblerepository: options?.isTitleCase ? t('Repository') : t('repository'),
        auditrule: options?.isTitleCase ? t('Rule Audit') : t('rule audit'),
        collection: options?.isTitleCase ? t('Collection') : t('collection'),
        collectionimport: options?.isTitleCase ? t('Collection Import') : t('collection import'),
        collectionremote: options?.isTitleCase ? t('Remote') : t('remote'),
        containernamespace: options?.isTitleCase
          ? t('Execution Environment')
          : t('execution environment'),
        containerregistryremote: options?.isTitleCase
          ? t('Container Registry Remote')
          : t('container registry remote'),
        containerrepository: options?.isTitleCase
          ? t('Container Repository')
          : t('container repository'),
        credential: options?.isTitleCase ? t('Credential') : t('credential'),
        credentialtype: options?.isTitleCase ? t('Credential Type') : t('credential type'),
        decisionenvironment: options?.isTitleCase
          ? t('Decision Environment')
          : t('decision environment'),
        edacredential: options?.isTitleCase ? t('Credential') : t('credential'),
        eventstream: options?.isTitleCase ? t('Event Stream') : t('event stream'),
        executionenvironment: options?.isTitleCase
          ? t('Execution Environment')
          : t('execution environment'),
        instancegroup: options?.isTitleCase ? t('Instance Group') : t('instance group'),
        inventory: options?.isTitleCase ? t('Inventory') : t('inventory'),
        jobtemplate: options?.isTitleCase ? t('Job Template') : t('job template'),
        namespace: options?.isTitleCase ? t('Namespace') : t('namespace'),
        notificationtemplate: options?.isTitleCase
          ? t('Notification Template')
          : t('notification template'),
        null: options?.isTitleCase ? t('System') : t('system'),
        organization: options?.isTitleCase ? t('Organization') : t('organization'),
        project: options?.isTitleCase ? t('Project') : t('project'),
        rulebook: options?.isTitleCase ? t('Rulebook') : t('rulebook'),
        rulebookprocess: options?.isTitleCase ? t('Rulebook Process') : t('rulebook process'),
        system: options?.isTitleCase ? t('System') : t('system'),
        task: options?.isTitleCase ? t('Task') : t('task'),
        team: options?.isTitleCase ? t('Team') : t('team'),
        workflowjobtemplate: options?.isTitleCase
          ? t('Workflow Job Template')
          : t('workflow job template'),
        awx: options?.isTitleCase ? t('Automation Execution') : t('automation execution'),
        eda: options?.isTitleCase ? t('Automation Decisions') : t('automation decisions'),
        galaxy: options?.isTitleCase ? t('Automation Content') : t('automation content'),
        shared: options?.isTitleCase ? t('Multiple Components') : t('multiple components'),
      };
      const shortType = contentType?.split('.').pop() || contentType;

      return contentTypeToDisplayName[shortType] ?? shortType;
    },
    [t]
  );
}
