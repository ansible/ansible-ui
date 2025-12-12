import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { ExternalLink } from '@ansible/hub-ui/common/ExternalLink';
import {
  Button,
  Checkbox,
  Divider,
  Flex,
  FlexItem,
  FormHelperText,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  Radio,
  Stack,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useEffect } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAwxConfig } from './useAwxConfig';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';

const DividerWithSpace = styled(Divider)`
  padding-top: var(--pf-t--global--spacer--md);
  padding-bottom: var(--pf-t--global--spacer--md);
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

  const docsURL = useGetDocsUrl(config, 'jobTemplateSurveys');

  const emptyChoiceMsg = t('Choice option cannot be empty.');
  const duplicateChoiceMsg = t('Choice option already exists.');
  const defaultOptLabel = t('Default option');

  const { control, setValue, setError, clearErrors, getFieldState } = useFormContext();

  const { fields, append, remove, update, replace } = useFieldArray({
    control,
    name: 'formattedChoices',
  });

  const choices = fields as ChoiceOption[];
  const updatedChoices = (useWatch({ name: 'formattedChoices' }) as ChoiceOption[]) ?? [];

  const addChoice = (useWatch({ name: 'add-choice' }) as string) ?? '';

  const plainChoices = updatedChoices.map((choice) => choice.name);

  const handleAdd = () => {
    if (addChoice.length <= 0) {
      setError('add-choice', { message: emptyChoiceMsg });
      return;
    }

    if (plainChoices.includes(addChoice)) {
      setError('add-choice', { message: duplicateChoiceMsg });
      return;
    }

    append({ name: addChoice, default: false });
    setValue('add-choice', '');
    clearErrors('add-choice');
  };

  useEffect(() => {
    if (type === 'multiplechoice' && choices.filter((c) => c.default).length > 1)
      replace(updatedChoices.map((choice) => ({ ...choice, default: false })));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return (
    <PageFormGroup
      fieldId={'multiple-choice-options'}
      label={t('Multiple Choice Options')}
      labelHelp={
        <Trans>
          Refer to the <ExternalLink href={docsURL}>documentation</ExternalLink> for more
          information.
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
                  data-testid={'add-choice-input'}
                  aria-label={t('Add choice input')}
                  {...field}
                  placeholder={t('Enter multiple choice option')}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      handleAdd();
                    }
                  }}
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
            icon={<PlusCircleIcon />}
            type="button"
            variant="plain"
            aria-label={t('Add choice')}
            data-cy={'add-choice'}
            data-testid={'add-choice'}
            onClick={handleAdd}
            isDisabled={plainChoices.includes(addChoice) || addChoice?.length === 0}
          />
        </GridItem>
      </Grid>

      <DividerWithSpace />

      {choices.map((choice, index) => (
        <Flex
          columnGap={{ default: 'columnGapNone' }}
          alignContent={{ default: 'alignContentSpaceBetween' }}
          key={choice.id}
          style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
        >
          <FlexItem flex={{ default: 'flex_1' }}>
            <Stack>
              <Controller
                name={`formattedChoices[${index}].name`}
                control={control}
                rules={{
                  validate: {
                    required: (v: string) => {
                      const { isTouched } = getFieldState(`formattedChoices[${index}].name`);

                      if (v.length <= 0) return emptyChoiceMsg;

                      if (isTouched && plainChoices.filter((pc) => pc === v).length > 1)
                        return duplicateChoiceMsg;
                    },
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <TextInput
                      validated={error?.message ? ValidatedOptions.error : undefined}
                      id={`choice-option-${index}`}
                      data-cy={`choice-option-${index}`}
                      data-testid={`choice-option-${index}`}
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
                  icon={<TrashIcon />}
                  type="button"
                  variant="plain"
                  aria-label={t('Remove choice')}
                  data-cy={`remove-choice-${index}`}
                  data-testid={`remove-choice-${index}`}
                  onClick={() => {
                    remove(index);
                  }}
                />
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
                          data-testid={`choice-radio-${index}`}
                          id={`choice-radio-${index}`}
                          label={defaultOptLabel}
                          onChange={() => {
                            replace(
                              updatedChoices.map((choice, i) => ({
                                ...choice,
                                default: index === i ? true : false,
                              }))
                            );
                          }}
                          onClick={() => {
                            if (choice.default === true)
                              update(index, { ...choice, default: false });
                          }}
                          isChecked={choice.default}
                          isDisabled={updatedChoices[index]?.name.length <= 0}
                        />
                      ) : (
                        <Checkbox
                          {...field}
                          data-cy={`choice-checkbox-${index}`}
                          data-testid={`choice-checkbox-${index}`}
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
