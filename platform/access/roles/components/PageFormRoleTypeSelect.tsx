import { useTranslation } from 'react-i18next';
import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { ResourceTypeOption } from '../../common/roles-wizard/useResourceTypeOptions';
import {
  groupFromRoleType,
  usePlatformRoleMetadata,
} from '@ansible/common-ui/access/components/usePlatformRoleMetadata';
import {
  ALLOWED_EDA_TYPES,
  ALLOWED_GALAXY_TYPES,
  EXCLUDED_SERVICES,
} from '../../teams/constants/resourceTypeConstants';
const isAllowedRoleType = (roleType: string): boolean => {
  const service = roleType?.split('.')[0] || roleType;
  // Exclude specified services
  if (EXCLUDED_SERVICES.some((type) => service === type)) {
    return false;
  }
  // For the eda service, only include specific allowed types
  if (service === 'eda') {
    return ALLOWED_EDA_TYPES.some((allowedType) => allowedType === roleType);
  }

  // For galaxy service, only include specific allowed types
  if (service === 'galaxy') {
    return ALLOWED_GALAXY_TYPES.some((allowedType) => allowedType === roleType);
  }

  return true;
};
export function PageFormRoleTypeSelect(props: {
  name: string;
  isRequired?: boolean;
  isDisabled?: string;
}) {
  const { t } = useTranslation();

  const platformRoleMetadata = usePlatformRoleMetadata();
  const options = Object.entries(platformRoleMetadata.content_types)
    .filter(([option]) => isAllowedRoleType(option))
    .filter(
      ([option]) =>
        option !== 'shared.team' && option !== 'shared.organization' && option !== 'null'
    )
    .map(([key, value]) => ({
      label: value?.displayName,
      group: groupFromRoleType(key, t),
      value: key,
    }));
  const dataRoles: ResourceTypeOption[] = [
    {
      value: 'shared.organization',
      label: t('Organization'),
      group: '',
      description: t(
        'An organization role grants access to all relevant resources within that organization based on permissions.'
      ),
    },
    ...options,
    {
      value: 'null',
      label: t('System'),
      group: 'Automation Content',
      description: t(
        t(
          'A system role grants access to all relevant Automation Content resources based on permissions.'
        )
      ),
    },
  ];

  return (
    <PageFormSingleSelect
      name={props?.name ?? 'content_type'}
      label={t('Resource type')}
      options={dataRoles ?? []}
      disableSortOptions
      isRequired={props?.isRequired}
      isDisabled={props?.isDisabled}
      placeholder={t('Select resource type')}
    />
  );
}
