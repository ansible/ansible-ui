import { useTranslation } from 'react-i18next';
import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import {
  ResourceTypeOption,
  useResourceTypeOptions,
} from '../../common/roles-wizard/useResourceTypeOptions';

export function PageFormRoleTypeSelect(props: {
  name: string;
  isRequired?: boolean;
  isDisabled?: string;
}) {
  const { t } = useTranslation();

  const { options } = useResourceTypeOptions();
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
