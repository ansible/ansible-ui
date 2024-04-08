import {
  Button,
  Grid,
  GridItem,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
  ValidatedOptions,
  Divider,
  Stack,
  Radio,
  Flex,
  FlexItem,
  Checkbox,
} from '@patternfly/react-core';
import { Trans, useTranslation } from 'react-i18next';
import { PageFormGroup } from '../../../framework/PageForm/Inputs/PageFormGroup';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import styled from 'styled-components';
import React, { useMemo } from 'react';
import { getDocsBaseUrl } from './util/getDocsBaseUrl';
import { useAwxConfig } from './useAwxConfig';

const DividerWithSpace = styled(Divider)`
  padding-top: var(--pf-v5-global--spacer--md);
  padding-bottom: var(--pf-v5-global--spacer--md);
`;

export type MultipleChoiceFieldType = 'multiplechoice' | 'multiselect';

interface IProps {
  type: MultipleChoiceFieldType;
}

export interface ChoiceOption {
  name: string;
  id: string;
  default: boolean;
}

export function MultipleChoiceField(props: IProps) {
  const { t } = useTranslation();
  const config = useAwxConfig();

  const { type } = props;

  const docsURL = `${getDocsBaseUrl(config)}/html/userguide/job_templates.html#surveys`;

  const defaultOptLabel = t('Default option');

  const { control, setValue } = useFormContext();

  const { fields, append, remove, update, replace } = useFieldArray({
    control,
    name: 'formattedChoices',
  });

  const choices = fields as ChoiceOption[];
  const updatedChoices = (useWatch({ name: 'formattedChoices' }) as ChoiceOption[]) ?? [];

  const addChoice = (useWatch({ name: 'add-choice' }) as string) ?? '';

  const handleAdd = () => {
    append({ name: addChoice, default: false });
    setValue('add-choice', '');
  };

  const plainChoices = useMemo(() => choices.map((choice) => choice.name), [choices]);
  return (
    <PageFormGroup
      fieldId={'multiple-choice-options'}
      label={t('Multiple Choice Options')}
      labelHelp={
        <Trans>
          Refer to the{' '}
          <a href={docsURL} target="_blank" rel="noreferrer">
            documentation
          </a>{' '}
          for more information.
        </Trans>
      }
      isRequired={true}
    >
      <Grid hasGutter>
        <GridItem span={10}>
          <Controller
            name={`add-choice`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Stack hasGutter>
                <TextInput
                  id={'add-choice-input'}
                  data-cy={'add-choice-input'}
                  aria-label={t('Add choice input')}
                  {...field}
                  placeholder={t('Enter multiple choice option')}
                />
                {error?.message && (
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem variant="error">{error.message}</HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                )}
              </Stack>
            )}
          />
        </GridItem>
        <GridItem span={2}>
          <Button
            type="button"
            variant="plain"
            aria-label={t('Add choice')}
            data-cy={'add-choice'}
            onClick={handleAdd}
            isDisabled={plainChoices.includes(addChoice) || addChoice?.length === 0}
          >
            <PlusCircleIcon />
          </Button>
        </GridItem>
      </Grid>

      <DividerWithSpace />

      {choices.map((choice, index) => (
        <Flex
          columnGap={{ default: 'columnGapNone' }}
          alignContent={{ default: 'alignContentSpaceBetween' }}
          key={choice.id}
        >
          <FlexItem flex={{ default: 'flex_1' }}>
            <Stack>
              <Controller
                name={`formattedChoices[${index}].name`}
                control={control}
                rules={{
                  required: t('Choice option cannot be empty.'),
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <TextInput
                      validated={error?.message ? ValidatedOptions.error : undefined}
                      id={`choice-option-${index}`}
                      data-cy={`choice-option-${index}`}
                      aria-label={t('Choice option')}
                      {...field}
                    />
                    {error?.message && (
                      <FormHelperText>
                        <HelperText>
                          <HelperTextItem variant="error">{error.message}</HelperTextItem>
                        </HelperText>
                      </FormHelperText>
                    )}
                  </>
                )}
              />
            </Stack>
          </FlexItem>
          <FlexItem>
            <Flex style={{ maxWidth: '180px' }} gap={{ default: 'gapNone' }}>
              <FlexItem>
                <Button
                  type="button"
                  variant="plain"
                  aria-label={t('Remove choice')}
                  data-cy={`remove-choice-${index}`}
                  onClick={() => {
                    remove(index);
                  }}
                >
                  <TrashIcon />
                </Button>
              </FlexItem>
              <FlexItem>
                <Controller
                  control={control}
                  name={`formattedChoices[${index}].default`}
                  render={({ field }) => (
                    <>
                      {type === 'multiplechoice' ? (
                        <Radio
                          {...field}
                          data-cy={`choice-radio-${index}`}
                          id={`choice-radio-${index}`}
                          label={defaultOptLabel}
                          isDisabled={updatedChoices[index]?.name.length <= 0}
                          onChange={() => {
                            replace(
                              updatedChoices.map((choice) => ({ ...choice, default: false }))
                            );
                            update(index, { ...choice, default: true });
                          }}
                          onClick={() => {
                            if (choice.default === true)
                              update(index, { ...choice, default: false });
                          }}
                          isChecked={choice.default}
                        />
                      ) : (
                        <Checkbox
                          {...field}
                          data-cy={`choice-checkbox-${index}`}
                          id={`choice-checkbox-${index}`}
                          label={defaultOptLabel}
                          isChecked={choice.default}
                          onClick={() => update(index, { ...choice, default: !choice.default })}
                          isDisabled={updatedChoices[index]?.name.length <= 0}
                        />
                      )}
                    </>
                  )}
                />
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      ))}
    </PageFormGroup>
  );
}
