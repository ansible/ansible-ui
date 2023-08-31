import {
  ActionGroup,
  Alert,
  Button,
  Form,
  Grid,
  gridItemSpanValueShape,
  Tooltip,
} from '@patternfly/react-core';
import { JSONSchema6 } from 'json-schema';
import { BaseSyntheticEvent, CSSProperties, ReactNode, useContext, useState } from 'react';
import {
  DefaultValues,
  ErrorOption,
  FieldPath,
  FieldValues,
  FormProvider,
  Path,
  useForm,
  UseFormReturn,
  useFormState,
} from 'react-hook-form';
import { RequestError } from '../../frontend/common/crud/RequestError';
import { useBreakpoint } from '../components/useBreakPoint';
import { PageBody } from '../PageBody';
import { SettingsContext } from '../Settings';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { useTranslation } from 'react-i18next';

export function PageForm<T extends object>(props: {
  schema?: JSONSchema6;
  children?: ReactNode;
  submitText: string;
  additionalActionText?: string;
  onClickAdditionalAction?: PageFormSubmitHandler<T>;
  onSubmit: PageFormSubmitHandler<T>;
  cancelText?: string;
  onCancel?: () => void;
  defaultValue?: DefaultValues<T>;
  isVertical?: boolean;
  singleColumn?: boolean;
  disableScrolling?: boolean;
  disableBody?: boolean;
  disablePadding?: boolean;
  autoComplete?: string;
}) {
  const { defaultValue, disableBody, disablePadding } = props;
  const form = useForm<T>({
    defaultValues: defaultValue ?? ({} as DefaultValues<T>),
  });

  const [frameworkTranslations] = useFrameworkTranslations();

  const { handleSubmit, setError: setFieldError } = form;
  const [error, setError] = useState<Error | null>(null);
  const isMd = useBreakpoint('md');
  const [settings] = useContext(SettingsContext);
  const isHorizontal = props.isVertical ? false : settings.formLayout === 'horizontal';
  const multipleColumns = props.singleColumn ? false : settings.formColumns === 'multiple';

  const maxWidth: number | undefined = multipleColumns ? 1600 : isHorizontal ? 960 : 800;
  const handleSubmitError = (err: unknown) => {
    err instanceof Error ? setError(err) : setError(new Error('Unknown error'));
    if (
      typeof err === 'object' &&
      err !== null &&
      'json' in err &&
      typeof err.json === 'object' &&
      err.json !== null
    ) {
      for (const key in err.json) {
        let value = (err.json as Record<string, string>)[key];
        if (typeof value === 'string') {
          setFieldError(key as unknown as Path<T>, { message: value });
        } else if (Array.isArray(value)) {
          value = value[0];
          if (typeof value === 'string') {
            setFieldError(key as unknown as Path<T>, { message: value });
          }
        }
      }
    }
  };

  let Component = (
    <FormProvider {...form}>
      <Form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(
          async (
            data,
            event?: BaseSyntheticEvent & { nativeEvent: { submitter?: { innerHTML: string } } }
          ) => {
            setError(null);
            let isSecondaryButton = false;

            if (event !== undefined && event?.nativeEvent?.submitter) {
              isSecondaryButton =
                event.nativeEvent.submitter?.innerHTML === props.additionalActionText;
            }
            try {
              await props.onSubmit(
                data,
                (error: string) => setError(new Error(error)),
                setFieldError,
                isSecondaryButton ? form : undefined
              );
            } catch (err) {
              handleSubmitError(err);
            }
          }
        )}
        isHorizontal={isHorizontal}
        autoComplete={props?.autoComplete || 'on'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: props.disableScrolling ? undefined : 'hidden',
          gap: 0,
        }}
      >
        {props.disableScrolling ? (
          <div style={{ maxWidth, padding: disablePadding ? undefined : 24 }}>
            <PageFormGrid isVertical={props.isVertical} singleColumn={props.singleColumn}>
              {props.children}
            </PageFormGrid>
          </div>
        ) : (
          <div
            style={{
              height: '100%',
              flexGrow: 1,
              overflow: 'auto',
            }}
          >
            <div style={{ maxWidth, padding: disablePadding ? undefined : 24 }}>
              <PageFormGrid isVertical={props.isVertical} singleColumn={props.singleColumn}>
                {props.children}
              </PageFormGrid>
            </div>
          </div>
        )}
        {error && (
          <Alert
            variant="danger"
            title={error.message ?? ''}
            isInline
            style={{ paddingLeft: isMd && props.onCancel ? 190 : undefined }}
            isExpandable={error instanceof RequestError ? !!error.details : false}
          >
            {error instanceof RequestError ? error.details : undefined}
          </Alert>
        )}
        {props.onCancel ? (
          <div className="dark-2 border-top" style={{ padding: disablePadding ? undefined : 24 }}>
            <ActionGroup style={{ marginTop: 0 }}>
              <PageFormSubmitButton>{props.submitText}</PageFormSubmitButton>
              {props.additionalActionText ? (
                <Button aria-label={props.additionalActionText} type="submit" variant="secondary">
                  {props.additionalActionText}
                </Button>
              ) : null}
              {props.onCancel && (
                <PageFormCancelButton onCancel={props.onCancel}>
                  {props.cancelText ?? frameworkTranslations.cancelText}
                </PageFormCancelButton>
              )}
            </ActionGroup>
          </div>
        ) : (
          <PageFormSubmitButton style={{ marginTop: 48 }}>{props.submitText}</PageFormSubmitButton>
        )}
      </Form>
    </FormProvider>
  );

  if (!disableBody) {
    Component = <PageBody>{Component}</PageBody>;
  }

  return Component;
}

export function PageFormGrid(props: {
  children?: ReactNode;
  isVertical?: boolean;
  singleColumn?: boolean;
}) {
  const [settings] = useContext(SettingsContext);
  const isHorizontal = props.isVertical ? false : settings.formLayout === 'horizontal';
  const multipleColumns = props.singleColumn ? false : settings.formColumns === 'multiple';

  const sm: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 12 : 12) : 12;
  const md: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 12 : 6) : 12;
  const lg: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 6 : 6) : 12;
  const xl: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 6 : 6) : 12;
  const xl2: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 4 : 4) : 12;

  const Component = (
    <Grid hasGutter span={12} sm={sm} md={md} lg={lg} xl={xl} xl2={xl2}>
      {props.children}
    </Grid>
  );

  return Component;
}

export type PageFormSubmitHandler<T extends FieldValues> = (
  data: T,
  setError: (error: string) => void,
  setFieldError: (fieldName: FieldPath<T>, error: ErrorOption) => void,
  from: UseFormReturn<T> | undefined
) => Promise<unknown>;

export function PageFormSubmitButton(props: { children: ReactNode; style?: CSSProperties }) {
  const { isSubmitting, errors } = useFormState();
  const { t } = useTranslation();
  const hasErrors = errors && Object.keys(errors).length > 0;
  return (
    <Tooltip content={t('Please fix errors')} trigger={hasErrors ? undefined : 'manual'}>
      <Button
        type="submit"
        isDisabled={isSubmitting}
        isLoading={isSubmitting}
        isDanger={hasErrors}
        variant={hasErrors ? 'secondary' : undefined}
        style={props.style}
      >
        {props.children}
      </Button>
    </Tooltip>
  );
}

export function PageFormCancelButton(props: { onCancel: () => void; children: ReactNode }) {
  return (
    <Button type="button" variant="link" onClick={props.onCancel}>
      {props.children}
    </Button>
  );
}
