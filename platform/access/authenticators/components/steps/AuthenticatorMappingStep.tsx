import { useState, MouseEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { Dropdown, DropdownList, DropdownItem, MenuToggle } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { AuthenticatorMapType } from '../../../../interfaces/AuthenticatorMap';
import type { AuthenticatorFormValues, AuthenticatorMapValues } from '../AuthenticatorForm';
import {
  PageFormGrid,
  PageFormCheckbox,
  PageFormSelect,
  PageFormTextInput,
} from '../../../../../framework';
import { PageFormPlatformOrganizationSelect } from '../../../organizations/components/PageFormPlatformOrganizationSelect';
import { PageFormHidden } from '../../../../../framework/PageForm/Utils/PageFormHidden';

const Checkbox = styled(PageFormCheckbox)`
  margin-block-start: 2em;

  & > input {
    align-self: center;
    margin-block-start: -0.5em;
  }

  & > label {
    align-self: center;
  }
`;

export function AuthenticatorMappingStep() {
  const { wizardData } = usePageWizard();
  const [mappings, setMappings] = useState((wizardData as AuthenticatorFormValues).mappings || []);

  const addMapping = (value: AuthenticatorMapType) => {
    const map: AuthenticatorMapValues = {
      name: '',
      map_type: value,
      revoke: false,
      trigger: 'always',
    };
    setMappings([...mappings, map]);
  };

  return (
    <>
      {mappings.map((map, i) => (
        <MapFields key={i} index={i} map={map} />
      ))}
      <AddMappingDropdown onSelect={addMapping} />
    </>
  );
}

function AddMappingDropdown(props: { onSelect: (value: AuthenticatorMapType) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const onSelect = (
    event?: MouseEvent<Element> | undefined,
    value?: string | number | undefined
  ) => {
    setIsOpen(false);
    if (value) {
      props.onSelect(value as AuthenticatorMapType);
    }
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={onSelect}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(ref) => (
        <MenuToggle ref={ref} onClick={() => setIsOpen(!isOpen)}>
          {t('Add authentication mapping')}
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem value="allow">{t('Allow')}</DropdownItem>
        <DropdownItem value="organization">{t('Organization')}</DropdownItem>
        <DropdownItem value="team">{t('Team')}</DropdownItem>
      </DropdownList>
    </Dropdown>
  );
}

function MapFields(props: { index: number; map: AuthenticatorMapValues }) {
  const { index, map } = props;
  const { register } = useFormContext();
  const { t } = useTranslation();

  const label = {
    allow: t('Allow'),
    organization: t('Organization'),
    team: t('Team'),
  }[map.map_type];

  return (
    <div style={{ marginBottom: 25 }}>
      {label}
      <input
        type="hidden"
        {...register(`mappings[${index}].map_type`, { value: map.map_type })}
        defaultValue={map.map_type}
      />
      <PageFormGrid>
        <PageFormTextInput
          id={`mappings-${index}-name`}
          name={`mappings[${index}].name`}
          label={t('Name')}
          isRequired
        />
        <PageFormSelect
          id={`mappings-${index}-trigger`}
          name={`mappings[${index}].trigger`}
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
        <Checkbox name={`mappings[${index}.revoke]`} label={t('Revoke')} />
        <PageFormHidden watch={`mappings[${index}].trigger`} hidden={(value) => value !== 'groups'}>
          <PageFormSelect
            id={`mappings-${index}-groups-conditional`}
            name={`mappings[${index}].conditional`}
            label={t('Conditional')}
            options={[
              { value: 'or', label: t('or') },
              { value: 'and', label: t('and') },
            ]}
            placeholderText={t('Select conditional')}
          />
          <PageFormTextInput
            id={`mappings-${index}-groups-value`}
            name={`mappings[${index}].groups_value`}
            label={t('Groups')}
          />
        </PageFormHidden>
        <PageFormHidden
          watch={`mappings[${index}].trigger`}
          hidden={(value) => value !== 'attributes'}
        >
          <PageFormSelect
            id={`mappings-${index}-attributes-conditional`}
            name={`mappings[${index}].conditional`}
            label={t('Conditional')}
            options={[
              { value: 'or', label: t('or') },
              { value: 'and', label: t('and') },
            ]}
          />
          <PageFormTextInput
            id={`mappings-${index}-attributes-criteria`}
            name={`mappings[${index}].criteria`}
            label={t('Criteria')}
          />
          <PageFormSelect
            id={`mappings-${index}-attributes-criteria-conditional`}
            name={`mappings[${index}].criteria_conditional`}
            label=""
            options={[
              { value: 'contains', label: t('contains') },
              { value: 'matches', label: t('matches') },
              { value: 'ends_with', label: t('ends with') },
              { value: 'equals', label: t('equals') },
              { value: 'in', label: t('in') },
            ]}
            placeholderText={t('Select conditional')}
          />
          <PageFormTextInput
            id={`mappings-${index}-attributes-value`}
            name={`mappings[${index}].criteria_value`}
            label=""
          />
        </PageFormHidden>
        <PageFormHidden watch={`mappings[${index}].map_type`} hidden={(value) => value !== 'team'}>
          <div />
        </PageFormHidden>
        <PageFormHidden
          watch={`mappings[${index}].map_type`}
          hidden={(value: string) => !['team', 'organization'].includes(value)}
        >
          <PageFormPlatformOrganizationSelect name={`mappings[${index}].organization`} isRequired />
        </PageFormHidden>
      </PageFormGrid>
    </div>
  );
}
