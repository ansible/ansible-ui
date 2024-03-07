import {
  Button,
  Grid,
  GridItem,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { useIsValidUrl } from '../../common/validation/useIsValidUrl';

export function UsefulLinksFields() {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const isValidUrl = useIsValidUrl();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'links',
  });

  return (
    <PageFormSection title={t('Useful links')}>
      <Grid hasGutter>
        {fields.map((field, index) => (
          <GridItem span={12} key={field.id}>
            <div
              style={{
                display: 'flex',
                gap: '8px',
              }}
            >
              <Controller
                name={`links[${index}].name`}
                control={control}
                rules={{
                  maxLength: {
                    value: 32,
                    message: t('Link text must be less than 32 characters'),
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <TextInput
                      data-cy={`link-text-${index}`}
                      {...field}
                      placeholder={t('Link text')}
                    />
                    {error?.message ? (
                      <FormHelperText>
                        <HelperText>
                          <HelperTextItem variant="error">{error.message}</HelperTextItem>
                        </HelperText>
                      </FormHelperText>
                    ) : null}
                  </div>
                )}
              />
              <div style={{ flexGrow: 2, display: 'flex', flexDirection: 'column' }}>
                <Controller
                  name={`links[${index}].url`}
                  rules={{ validate: isValidUrl }}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <TextInput
                        validated={error?.message ? ValidatedOptions.error : undefined}
                        data-cy={`link-url-${index}`}
                        {...field}
                        type="url"
                        placeholder={t('Link URL')}
                      />
                      {error?.message ? (
                        <FormHelperText>
                          <HelperText>
                            <HelperTextItem variant="error">{error.message}</HelperTextItem>
                          </HelperText>
                        </FormHelperText>
                      ) : null}
                    </>
                  )}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '8px',
                  alignSelf: 'center',
                }}
              >
                <Button
                  type="button"
                  variant="plain"
                  aria-label={t('Add link')}
                  onClick={() => append({ name: '', url: '' })}
                >
                  <PlusCircleIcon />
                </Button>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="plain"
                    aria-label={t('Remove link')}
                    onClick={() => remove(index)}
                  >
                    <TrashIcon />
                  </Button>
                )}
              </div>
            </div>
          </GridItem>
        ))}
      </Grid>
    </PageFormSection>
  );
}
