import { Button, FormFieldGroup, FormFieldGroupHeader } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormCheckbox, PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { PageFormCreatableSelect } from '../../../../../framework/PageForm/Inputs/PageFormCreatableSelect';
import { PageFormHidden } from '../../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormPlatformOrganizationNameSelect } from '../../../organizations/components/PageFormPlatformOrganizationNameSelect';
import { PageFormPlatformTeamNameSelect } from '../../../organizations/components/PageFormPlatformTeamNameSelect';
import { PageFormPlatformRoleNameSelect } from '../../../roles/components/PageFormPlatformRoleNameSelect';
import type { AuthenticatorFormValues, AuthenticatorMapValues } from '../AuthenticatorForm';
import { AuthenticatorMapType } from '../../../../interfaces/AuthenticatorMap';

export function MapFields(props: {
  index: number;
  map: AuthenticatorMapValues;
  onDelete: (id: number) => void;
}) {
  const { index, map, onDelete } = props;
  const { register, getValues } = useFormContext();
  const { t } = useTranslation();
  const mapType = map.map_type;

  const options = new Set<string>();
  const { mappings = [] } = getValues() as AuthenticatorFormValues;

  mappings?.forEach((mapping) => {
    if (mapping.trigger !== 'groups') {
      return;
    }
    mapping.groups_value?.forEach(({ name }) => options.add(name));
  });

  const groupOptions = Array.from(options).map((name) => ({
    value: name,
    label: name,
  }));

  const label = {
    allow: t('Allow'),
    organization: t('Organization'),
    team: t('Team'),
    role: t('Role'),
    is_superuser: t('Superuser'),
  }[map.map_type];

  let roleContentType = null;
  if (map.map_type === AuthenticatorMapType.team) {
    roleContentType = 'shared.team';
  }
  if (map.map_type === AuthenticatorMapType.organization) {
    roleContentType = 'shared.organization';
  }

  return (
    <FormFieldGroup
      header={
        <FormFieldGroupHeader
          titleText={{ text: label, id: label }}
          actions={
            <>
              <Button
                id={`map-delete-${index}`}
                icon={<TrashIcon />}
                aria-label={t('Delete map')}
                onClick={() => onDelete(index)}
                variant="plain"
              />
            </>
          }
        />
      }
    >
      <input
        type="hidden"
        {...register(`mappings.${index}.map_type`, { value: map.map_type })}
        defaultValue={map.map_type}
      />
      <PageFormSection>
        <PageFormTextInput
          id={`mappings-${index}-name`}
          name={`mappings.${index}.name`}
          label={t('Name')}
          isRequired
          placeholder={t('Enter name')}
        />
        <PageFormSelect
          id={`mappings-${index}-trigger`}
          name={`mappings.${index}.trigger`}
          label={t('Trigger')}
          options={[
            {
              value: 'always',
              label: t('Always'),
            },
            {
              value: 'never',
              label: t('Never'),
            },
            {
              value: 'groups',
              label: t('Groups'),
            },
            {
              value: 'attributes',
              label: t('Attributes'),
            },
          ]}
          placeholderText={t('Select trigger')}
          isRequired
        />
        <PageFormCheckbox name={`mappings.${index}.revoke`} label={t('Revoke')} />
        <PageFormHidden watch={`mappings.${index}.trigger`} hidden={(value) => value !== 'groups'}>
          <PageFormSelect
            id={`mappings-${index}-groups-conditional`}
            label={t('Operation')}
            options={[
              { value: 'or', label: t('or') },
              { value: 'and', label: t('and') },
            ]}
            placeholderText={t('Select operation')}
            name={`mappings.${index}.conditional`}
            isRequired
          />
          <PageFormCreatableSelect
            id={`mappings-${index}-groups-value`}
            name={`mappings.${index}.groups_value`}
            label={t('Groups')}
            options={groupOptions}
            isRequired
            placeholderText={t('Select groups')}
          />
        </PageFormHidden>
        <PageFormHidden
          watch={`mappings.${index}.trigger`}
          hidden={(value) => value !== 'attributes'}
        >
          <PageFormSelect
            id={`mappings-${index}-attributes-conditional`}
            name={`mappings.${index}.conditional`}
            label={t('Operation')}
            placeholderText={t('Select operation')}
            options={[
              { value: 'or', label: t('or') },
              { value: 'and', label: t('and') },
            ]}
            isRequired
          />
          <PageFormSection>
            <PageFormTextInput
              id={`mappings-${index}-attributes-criteria`}
              name={`mappings.${index}.criteria`}
              label={t('Attribute')}
              isRequired
              placeholder={t('Enter attribute')}
            />
            <PageFormSelect
              id={`mappings-${index}-attributes-criteria-conditional`}
              name={`mappings.${index}.criteria_conditional`}
              label={t('Comparison')}
              placeholderText={t('Select comparison')}
              options={[
                { value: 'contains', label: t('contains') },
                { value: 'matches', label: t('matches') },
                { value: 'ends_with', label: t('ends with') },
                { value: 'equals', label: t('equals') },
                { value: 'in', label: t('in') },
              ]}
              isRequired
            />
            <PageFormTextInput
              id={`mappings-${index}-attributes-value`}
              name={`mappings.${index}.criteria_value`}
              label={t('Value')}
              placeholder={t('Enter value')}
              isRequired
            />
          </PageFormSection>
        </PageFormHidden>
      </PageFormSection>
      <PageFormSection>
        <PageFormHidden
          watch={`mappings.${index}.map_type`}
          hidden={(value: string) => !['team', 'role'].includes(value)}
        >
          <PageFormPlatformTeamNameSelect
            name={`mappings.${index}.team`}
            isRequired={['team'].includes(mapType)}
          />
        </PageFormHidden>
        <PageFormHidden
          watch={`mappings.${index}.map_type`}
          hidden={(value: string) => !['team', 'organization', 'role'].includes(value)}
        >
          <PageFormPlatformOrganizationNameSelect
            name={`mappings.${index}.organization`}
            isRequired={['team', 'organization'].includes(mapType)}
          />
          <PageFormPlatformRoleNameSelect
            name={`mappings.${index}.role`}
            contentType={roleContentType}
            isRequired
          />
        </PageFormHidden>
      </PageFormSection>
    </FormFieldGroup>
  );
}
