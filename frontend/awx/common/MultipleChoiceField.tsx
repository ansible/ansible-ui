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

interface IProps {
  type: 'multiplechoice' | 'multiselect';
}

interface ChoiceOption {
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
    name: 'choices',
  });

  const choices = fields as ChoiceOption[];

  const addChoice = useWatch({ name: 'add-choice' }) as string;

  const handleAdd = () => {
    append({ name: addChoice });
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
        <GridItem span={8}>
          <Controller
            name={`add-choice`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Stack hasGutter>
                <TextInput
                  id={'add-choice-option'}
                  data-cy={'add-choice-option'}
                  aria-label={t('Add choice option')}
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
        <GridItem span={4}>
          <Button
            type="button"
            variant="plain"
            aria-label={t('Add choice')}
            onClick={handleAdd}
            isDisabled={plainChoices.includes(addChoice) || addChoice?.length === 0}
          >
            <PlusCircleIcon />
          </Button>
        </GridItem>
      </Grid>

      <DividerWithSpace />

      <Grid hasGutter>
        {choices.map((choice, index) => (
          <React.Fragment key={choice.id}>
            <GridItem span={8}>
              <Stack>
                <Controller
                  name={`choices[${index}].name`}
                  control={control}
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
            </GridItem>
            <GridItem span={4}>
              <Flex>
                <FlexItem>
                  <Button
                    type="button"
                    variant="plain"
                    aria-label={t('Remove choice')}
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
                    name={`choices[${index}].default`}
                    render={({ field }) => (
                      <>
                        {type === 'multiplechoice' ? (
                          <Radio
                            {...field}
                            data-cy={`choice-radio-${index}`}
                            id={`choice-radio-${index}`}
                            label={defaultOptLabel}
                            onChange={() => {
                              replace(choices.map((choice) => ({ ...choice, default: false })));
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
                          />
                        )}
                      </>
                    )}
                  />
                </FlexItem>
              </Flex>
            </GridItem>
          </React.Fragment>
        ))}
      </Grid>
    </PageFormGroup>
  );
}
