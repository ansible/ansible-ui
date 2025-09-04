import { SharedContentType } from '@ansible/common-ui/access/roles/SharedContentType';
import { useTranslation } from 'react-i18next';
import { ContentType } from './ContentType';

/**
 * Hook to retrieve the component names associated with a given content type.
 * @param contentType - The content type for which to retrieve component names.
 * @returns An array of component names associated with the content type.
 */
export function useContentTypeComponentNames() {
  const { t } = useTranslation();
  return (contentType: ContentType) => {
    const componentId = contentType ? contentType.split('.')[0] : 'galaxy';
    switch (componentId) {
      case 'awx':
        return [t('Automation Execution')];
      case 'eda':
        return [t('Automation Decisions')];
      case 'galaxy':
        return [t('Automation Content')];
      case 'shared':
        switch (contentType) {
          case SharedContentType.Organization:
            return [t('Automation Execution'), t('Automation Decisions')];
        }
        return [t('Automation Execution'), t('Automation Decisions'), t('Automation Content')];
      default:
        return [];
    }
  };
}
