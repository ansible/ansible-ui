import { useTranslation } from 'react-i18next';
import { PageFormMultiSelect } from '../../../../framework/PageForm/Inputs/PageFormMultiSelect';
import { PlatformContentTypeEnum } from '@ansible/common-ui/access/components/usePlatformRoleMetadata';
import { usePlatformRoleMetadata } from '@ansible/common-ui/access/components/usePlatformRoleMetadata';

export function PageFormRolePermissionsSelect(props: {
  name: string;
  contentType: string;
  isRequired?: boolean;
  isDisabled?: string;
}) {
  const { t } = useTranslation();
  const platformRoleMetadata = usePlatformRoleMetadata();
  const groupFromRoleType = (type: string): string => {
    const group = type.split('.')[0];
    switch (group) {
      case 'awx':
        return t('Automation Execution');
      case 'eda':
        return t('Automation Decisions');
      case 'galaxy':
        return t('Automation Content');
      default:
        return '';
    }
  };
  return (
    <PageFormMultiSelect
      name="permissions"
      label={t('Permissions')}
      options={Object.entries(
        platformRoleMetadata.content_types[props?.contentType as PlatformContentTypeEnum]
          ?.permissions || {}
      ).map(([key, value]) => ({
        label: value,
        value: key,
        group: groupFromRoleType(key),
      }))}
      placeholder={t('Select permissions')}
      isRequired={props?.isRequired}
      isDisabled={props?.isDisabled}
    />
  );
}
