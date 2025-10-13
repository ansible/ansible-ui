import { useTranslation } from 'react-i18next';
import { PageFormMultiSelect } from '../../../../framework/PageForm/Inputs/PageFormMultiSelect';
import {
  groupFromRoleType,
  PlatformContentTypeEnum,
} from '@ansible/common-ui/access/components/usePlatformRoleMetadata';
import { usePlatformRoleMetadata } from '@ansible/common-ui/access/components/usePlatformRoleMetadata';

export function PageFormRolePermissionsSelect(props: {
  name: string;
  contentType: string;
  isRequired?: boolean;
  isDisabled?: string;
}) {
  const { t } = useTranslation();
  const platformRoleMetadata = usePlatformRoleMetadata();
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
        group: groupFromRoleType(key, t),
      }))}
      placeholder={t('Select permissions')}
      isRequired={props?.isRequired}
      isDisabled={props?.isDisabled}
    />
  );
}
