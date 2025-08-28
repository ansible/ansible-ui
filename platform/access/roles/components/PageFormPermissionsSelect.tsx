import { useTranslation } from 'react-i18next';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { PlatformPermission } from '../../../interfaces/PlatformPermission';
import { PageFormMultiSelect } from '../../../../framework/PageForm/Inputs/PageFormMultiSelect';

export function PageFormRolePermissionsSelect(props: {
  name: string;
  contentType: string;
  isRequired?: boolean;
  isDisabled?: string;
}) {
  const { t } = useTranslation();
  const responsePermissions = useGet<PlatformItemsResponse<PlatformPermission>>(
    props.contentType === 'shared.organization'
      ? gatewayAPI`/service-index/role-permissions/?or__content_type__api_slug__startswith=awx&or__content_type__api_slug__startswith=eda`
      : gatewayAPI`/service-index/role-permissions/?or__content_type__api_slug=${props.contentType}`
  );
  const dataPermissions = responsePermissions?.data;

  const groupFromContentType = (rolePermission: PlatformPermission): string => {
    const group = rolePermission.content_type.split('.')[0];
    switch (group) {
      case 'awx':
        return t('Automation Execution');
      case 'eda':
        return t('Automation Decisions');
      case 'galaxy':
        return t('Automation Content');
      default:
        return t('Platform');
    }
  };

  return (
    <PageFormMultiSelect
      name={props?.name ?? 'permissions'}
      label={t('Permissions')}
      options={
        dataPermissions?.results
          ? dataPermissions?.results.map((rolePermission) => {
              return {
                label: rolePermission.name,
                value: rolePermission.api_slug,
                group:
                  props?.contentType === 'shared.organization'
                    ? groupFromContentType(rolePermission)
                    : '',
              };
            })
          : []
      }
      isRequired={props?.isRequired}
      isDisabled={props?.isDisabled}
      placeholder={t('Select permissions')}
    />
  );
}
