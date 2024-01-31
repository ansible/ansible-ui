import { useState, MouseEvent } from 'react';
import { Dropdown, DropdownList, DropdownItem, MenuToggle } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { AuthenticatorMapType } from '../../../../interfaces/AuthenticatorMap';
import type { AuthenticatorFormValues, AuthenticatorMapValues } from '../AuthenticatorForm';
import { MapFields } from './MapFields';

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

  const deleteMapping = (index: number) => {
    setMappings([...mappings.slice(0, index), ...mappings.slice(index + 1)]);
  };

  return (
    <>
      {mappings.map((map, i) => (
        <MapFields key={i} index={i} map={map} onDelete={deleteMapping} />
      ))}
      <AddMappingDropdown onSelect={addMapping} />
    </>
  );
}

const Toggle = styled(MenuToggle)`
  color: var(--pf-v5-global--link--Color);

  &::before,
  &::after {
    border: 0;
  }
`;

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
        <Toggle ref={ref} onClick={() => setIsOpen(!isOpen)}>
          <PlusCircleIcon style={{ marginRight: 5 }} /> {t('Add authentication mapping')}
        </Toggle>
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
