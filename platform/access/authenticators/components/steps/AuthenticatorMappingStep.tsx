import { useState, MouseEvent } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { AuthenticatorMapType } from '../../../../interfaces/AuthenticatorMap';
import type { AuthenticatorMapValues } from '../AuthenticatorForm';
import { MapFields } from './MapFields';

export function AuthenticatorMappingStep() {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const {
    fields: mappings,
    append: addMap,
    remove: removeMap,
  } = useFieldArray({
    control,
    name: 'mappings',
  });

  const addMapping = (value: AuthenticatorMapType) => {
    const map: AuthenticatorMapValues = {
      name: '',
      map_type: value,
      revoke: false,
      trigger: 'always',
    };
    addMap(map);
  };

  return (
    <>
      <TextContent
        style={{
          paddingBottom: 15,
          marginBottom: 15,
          borderBottom: '1px solid var(--pf-v5-global--palette--black-400)',
        }}
      >
        <Text component={TextVariants.h2}>{t('Authentication mapping')}</Text>
      </TextContent>
      {mappings.map((map, i) => (
        <MapFields
          key={map.id}
          index={i}
          map={map as unknown as AuthenticatorMapValues}
          onDelete={removeMap}
        />
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
        <Toggle ref={ref} onClick={() => setIsOpen(!isOpen)} id="add-mapping">
          <PlusCircleIcon style={{ marginRight: 5 }} /> {t('Add authentication mapping')}
        </Toggle>
      )}
    >
      <DropdownList>
        <DropdownItem value="allow" ouiaId="add-map-allow">
          {t('Allow')}
        </DropdownItem>
        <DropdownItem value="organization" ouiaId="add-map-organization">
          {t('Organization')}
        </DropdownItem>
        <DropdownItem value="team" ouiaId="add-map-team">
          {t('Team')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
}
