import { useTranslation } from 'react-i18next';
import { PlatformResourceType } from '../../../interfaces/PlatformResourceType';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMapContentTypeToDisplayName } from '@ansible/common-ui/access/hooks/useMapContentTypeToDisplayName';

export function PageFormRoleTypeSelect(props: {
  name: string;
  isRequired?: boolean;
  isDisabled?: string;
}) {
  const { t } = useTranslation();
  const responseRoles = useGet<PlatformItemsResponse<PlatformResourceType>>(
    gatewayAPI`/service-index/role-types/?or__api_slug__startswith=awx&or__api_slug__startswith=eda&or__api_slug__startswith=galaxy&or__api_slug=shared.organization&order_by=-api_slug`
  );
  const dataRoles = responseRoles.data;
  const getDisplayName = useMapContentTypeToDisplayName();

  const groupFromResourceType = (role: PlatformResourceType): string => {
    const group = role.service.split('.')[0];
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

  const descriptionForResourceType = (role: PlatformResourceType): string => {
    if (role.api_slug === 'shared.organization') {
      return t(
        'An organization role grants access to all relevant resources within that organization based on permissions.'
      );
    } else if (role.api_slug === 'galaxy.system') {
      return t(
        'A system role grants access to all relevant Automation Content resources based on permissions.'
      );
    } else {
      return '';
    }
  };

  return (
    <PageFormSingleSelect
      name={props?.name ?? 'content_type'}
      label={t('Resource type')}
      options={
        dataRoles?.results
          ? dataRoles.results.map((role) => {
              return {
                label: getDisplayName(role.model, { isTitleCase: true }),
                value: role.api_slug,
                order_by: role.model,
                group: groupFromResourceType(role),
                description: descriptionForResourceType(role),
              };
            })
          : []
      }
      disableSortOptions
      isRequired={props?.isRequired}
      isDisabled={props?.isDisabled}
      placeholder={t('Select resource type')}
    />
  );
}
