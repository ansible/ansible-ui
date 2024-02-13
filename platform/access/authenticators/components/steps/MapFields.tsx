import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, TextVariants, Button } from '@patternfly/react-core';
import styled from 'styled-components';
import { AngleDownIcon, TrashIcon } from '@patternfly/react-icons';
import type { AuthenticatorFormValues, AuthenticatorMapValues } from '../AuthenticatorForm';
import {
  PageFormGrid,
  PageFormSelect,
  PageFormTextInput,
  PageFormCheckbox,
} from '../../../../../framework';
import { PageFormCreatableSelect } from '../../../../../framework/PageForm/Inputs/PageFormCreatableSelect';
import { PageFormPlatformOrganizationSelect } from '../../../organizations/components/PageFormPlatformOrganizationSelect';
import { PageFormPlatformTeamSelect } from '../../../teams/components/PageFormPlatformTeamSelect';
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

const HeadingRow = styled.div`
  margin-bottom: 15px;
  display: flex;
  align-items: center;

  & > :nth-child(1) {
    flex-basis: 30px;
  }

  & > :nth-child(2) {
    flex: 1;
  }
`;

const FieldContainer = styled.div`
  margin-inline-start: 30px;
`;

const FormGrid = styled(PageFormGrid)`
  & + & {
    margin-block-start: var(--pf-v5-l-grid--m-gutter--GridGap);
  }
`;

export function MapFields(props: {
  index: number;
  map: AuthenticatorMapValues;
  onDelete: (id: number) => void;
}) {
  const { index, map, onDelete } = props;
  const { register, getValues } = useFormContext();
  const { t } = useTranslation();

  const options = new Set<string>();
  const { mappings = [] } = getValues() as AuthenticatorFormValues;

  mappings?.forEach((mapping) => {
    if (mapping.trigger !== 'groups') {
      return;
    }
    mapping.groups_value.forEach(({ name }) => options.add(name));
  });

  const groupOptions = Array.from(options).map((name) => ({
    value: name,
    label: name,
  }));

  const label = {
    allow: t('Allow'),
    organization: t('Organization'),
    team: t('Team'),
  }[map.map_type];

  return (
    <div style={{ marginBottom: 25 }}>
      <HeadingRow>
        <AngleDownIcon />
        <Text component={TextVariants.h3}>{label}</Text>
        <Button
          id={`map-delete-${index}`}
          icon={<TrashIcon />}
          aria-label={t('Delete map')}
          onClick={() => onDelete(index)}
          variant="plain"
        />
      </HeadingRow>
      <input
        type="hidden"
        {...register(`mappings.${index}.map_type`, { value: map.map_type })}
        defaultValue={map.map_type}
      />
      <FieldContainer>
        <FormGrid>
          <PageFormTextInput
            id={`mappings-${index}-name`}
            name={`mappings.${index}.name`}
            label={t('Name')}
            isRequired
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
          <Checkbox name={`mappings.${index}.revoke`} label={t('Revoke')} />
          <PageFormHidden
            watch={`mappings.${index}.trigger`}
            hidden={(value) => value !== 'groups'}
          >
            <PageFormSelect
              id={`mappings-${index}-groups-conditional`}
              label={t('Conditional')}
              options={[
                { value: 'or', label: t('or') },
                { value: 'and', label: t('and') },
              ]}
              placeholderText={t('Select conditional')}
              // eslint-disable-next-line i18next/no-literal-string
              {...register(`mappings.${index}.conditional`, { value: 'or' })}
            />
            <PageFormCreatableSelect
              id={`mappings-${index}-groups-value`}
              name={`mappings.${index}.groups_value`}
              label={t('Groups')}
              options={groupOptions}
              isRequired
            />
          </PageFormHidden>
          <PageFormHidden
            watch={`mappings.${index}.trigger`}
            hidden={(value) => value !== 'attributes'}
          >
            <PageFormSelect
              id={`mappings-${index}-attributes-conditional`}
              name={`mappings.${index}.conditional`}
              label={t('Conditional')}
              options={[
                { value: 'or', label: t('or') },
                { value: 'and', label: t('and') },
              ]}
              isRequired
            />
            <PageFormTextInput
              id={`mappings-${index}-attributes-criteria`}
              name={`mappings.${index}.criteria`}
              label={t('Criteria')}
              isRequired
            />
            <PageFormSelect
              id={`mappings-${index}-attributes-criteria-conditional`}
              name={`mappings.${index}.criteria_conditional`}
              label="&nbsp;"
              options={[
                { value: 'contains', label: t('contains') },
                { value: 'matches', label: t('matches') },
                { value: 'ends_with', label: t('ends with') },
                { value: 'equals', label: t('equals') },
                { value: 'in', label: t('in') },
              ]}
              placeholderText={t('Select conditional')}
              isRequired
            />
            <PageFormTextInput
              id={`mappings-${index}-attributes-value`}
              name={`mappings.${index}.criteria_value`}
              label="&nbsp;"
              isRequired
            />
          </PageFormHidden>
        </FormGrid>
        <FormGrid>
          <PageFormHidden watch={`mappings.${index}.map_type`} hidden={(value) => value !== 'team'}>
            <PageFormPlatformTeamSelect name={`mappings.${index}.team`} isRequired />
          </PageFormHidden>
          <PageFormHidden
            watch={`mappings.${index}.map_type`}
            hidden={(value: string) => !['team', 'organization'].includes(value)}
          >
            <PageFormPlatformOrganizationSelect
              name={`mappings.${index}.organization`}
              isRequired
            />
          </PageFormHidden>
        </FormGrid>
      </FieldContainer>
    </div>
  );
}
