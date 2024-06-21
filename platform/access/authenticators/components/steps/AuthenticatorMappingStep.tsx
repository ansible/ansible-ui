import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { MouseEvent, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { gatewayAPI } from '../../../../api/gateway-api-utils';
import { useGet } from '../../../../../frontend/common/crud/useGet';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { RequestError } from '../../../../../frontend/common/crud/RequestError';
import { AuthenticatorMapType } from '../../../../interfaces/AuthenticatorMap';
import type { AuthenticatorMapValues } from '../AuthenticatorForm';
import { MapFields } from './MapFields';
import { PlatformItemsResponse } from '../../../../interfaces/PlatformItemsResponse';
import { PlatformRole } from '../../../../interfaces/PlatformRole';

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

  const { data: roles, isLoading: isRolesLoading } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/?order_by=name`
  );

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
      <TextContent>
        <Text component={TextVariants.h2}>{t('Authentication mapping')}</Text>
      </TextContent>
      <PageFormSection singleColumn>
        {mappings.map((map, i) => (
          <MapFields
            key={map.id}
            index={i}
            map={map as unknown as AuthenticatorMapValues}
            onDelete={removeMap}
            roles={!roles || isRolesLoading ? undefined : roles.results}
          />
        ))}
      </PageFormSection>
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
        <Toggle
          ref={ref}
          onClick={() => setIsOpen(!isOpen)}
          id="add-mapping"
          icon={<PlusCircleIcon />}
        >
          {t('Add authentication mapping')}
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
        <DropdownItem value="role" ouiaId="add-map-role">
          {t('Role')}
        </DropdownItem>
        <DropdownItem value="is_superuser" ouiaId="add-map-superuser">
          {t('Superuser')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
}

export function validateMappingStep(formData: object, t: (s: string) => string) {
  const mappings = (formData as { mappings: AuthenticatorMapValues[] }).mappings;
  const names = mappings.map((mapping) => mapping.name);
  const hasDuplicateNames = names.length !== new Set(names).size;

  if (!hasDuplicateNames) {
    return;
  }

  const errors = {
    non_field_errors: [t('Mapping names must be unique')],
  };

  throw new RequestError('', '', 400, '', errors);
}
