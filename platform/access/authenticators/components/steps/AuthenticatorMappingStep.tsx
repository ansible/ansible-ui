import { useState } from 'react';
import { Dropdown, DropdownList, DropdownItem, MenuToggle } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import type { AuthenticatorPlugins } from '../../../../interfaces/AuthenticatorPlugin';
import { AuthenticatorMapType } from '../../../../interfaces/AuthenticatorMap';
import type { AuthenticatorForm } from '../AuthenticatorForm';

export function AuthenticatorMappingStep(props: { plugins: AuthenticatorPlugins }) {
  const { t } = useTranslation();
  const { wizardData, setWizardData } = usePageWizard();
  const { mappings = [] } = wizardData;

  const addMapping = (value: AuthenticatorMapType) => {
    setWizardData({
      ...wizardData,
      mappings: [...mappings, { type: value }],
    });
  };

  return (
    <>
      <AddMappingDropdown onSelect={addMapping} />
    </>
  );
}

function AddMappingDropdown(props: { onSelect: (value: AuthenticatorMapType) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const onSelect = (value: AuthenticatorMapType) => {
    setIsOpen(false);
    props.onSelect(value);
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
