import {
  ActionGroup,
  Alert,
  Button,
  Form,
  Grid,
  gridItemSpanValueShape,
  PageSection,
  Tooltip,
} from '@patternfly/react-core';
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
import { useTranslation } from 'react-i18next';
import { RequestError } from '../../frontend/common/crud/RequestError';
import { Scrollable } from '../components/Scrollable';
import { useBreakpoint } from '../components/useBreakPoint';
import { PageBody } from '../PageBody';
import { SettingsContext } from '../Settings';
import { useFrameworkTranslations } from '../useFrameworkTranslations';

export function PageForm<T extends object>(props: {
  children?: ReactNode;
  submitText?: string;
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
  disableGrid?: boolean;
  autoComplete?: string;
  footer?: ReactNode;
}) {
  const form = useForm<T>({
    defaultValues: props.defaultValue ?? ({} as DefaultValues<T>),
  });

  const [frameworkTranslations] = useFrameworkTranslations();

  const { handleSubmit, setError: setFieldError } = form;
  const [error, setError] = useState<Error | null>(null);
  const isMd = useBreakpoint('md');
  const [settings] = useContext(SettingsContext);
  const isHorizontal = props.isVertical ? false : settings.formLayout === 'horizontal';

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

  let children = props.children;
  if (props.disableGrid !== true) {
    children = (
      <PageFormGrid isVertical={props.isVertical} singleColumn={props.singleColumn}>
        {props.children}
      </PageFormGrid>
    );
  }

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
        autoComplete="off"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
          gap: 0,
        }}
      >
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
        <Scrollable>
          <PageSection
            variant="light"
            isFilled
            isWidthLimited
            padding={{ default: props.disablePadding ? 'noPadding' : 'padding' }}
            // hasOverflowScroll
          >
            {children}
          </PageSection>
        </Scrollable>
        {props.footer ? (
          props.footer
        ) : (
          <PageSection variant="light" isFilled={false}>
            <ActionGroup>
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
          </PageSection>
        )}
      </Form>
    </FormProvider>
  );

  if (!props.disableBody) {
    Component = <PageBody>{Component}</PageBody>;
  }

  return Component;
}

export type PageFormSubmitHandler<T extends FieldValues> = (
  data: T,
  setError: (error: string) => void,
  setFieldError: (fieldName: FieldPath<T>, error: ErrorOption) => void,
  from: UseFormReturn<T> | undefined
) => Promise<unknown>;

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
