import {
  ActionGroup,
  Button,
  Form,
  Grid,
  gridItemSpanValueShape,
  PageSection,
} from '@patternfly/react-core';
import { BaseSyntheticEvent, ReactNode, useContext, useState } from 'react';
import {
  DefaultValues,
  ErrorOption,
  FieldPath,
  FieldValues,
  FormProvider,
  Path,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import styled from 'styled-components';
import { Scrollable } from '../components/Scrollable';
import { useBreakpoint } from '../components/useBreakPoint';
import { PageSettingsContext } from '../PageSettings/PageSettingsProvider';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { ErrorAlert } from './ErrorAlert';
import { genericErrorAdapter } from './genericErrorAdapter';
import { PageFormCancelButton, PageFormSubmitButton } from './PageFormButtons';
import { ErrorAdapter } from './typesErrorAdapter';

const FormContainer = styled(PageSection)`
  margin-block-end: var(--pf-v5-global--spacer--xl);
`;

const FormActionGroup = styled(ActionGroup)`
  && {
    margin-block-start: unset;
  }
`;

export interface PageFormProps<T extends object> {
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
  disablePadding?: boolean;
  disableGrid?: boolean;
  autoComplete?: 'on' | 'off';
  footer?: ReactNode;
  errorAdapter?: ErrorAdapter;
  disableSubmitOnEnter?: boolean;
  isWizard?: boolean;
}

export function useFormErrors<T extends object>(
  defaultValue: DefaultValues<T> | undefined,
  errorAdapter: ErrorAdapter,
  isWizard = false
) {
  const form = useForm<T>({
    defaultValues: defaultValue ?? ({} as DefaultValues<T>),
  });
  const { handleSubmit, setError: setFieldError } = form;
  const [error, setError] = useState<(string | ReactNode)[] | string | null>(null);

  const handleSubmitError = (err: unknown) => {
    const { genericErrors, fieldErrors } = errorAdapter(err);

    // Handle generic errors
    if (genericErrors.length > 0) {
      const parsedGenericErrorMessages = genericErrors.map((genericError) => genericError.message);
      setError(parsedGenericErrorMessages);
      // This is necessary to handle the wizard case where the error is not associated with a field
      // then the step itself should be marked as invalid
      if (isWizard) {
        setFieldError('root', { message: parsedGenericErrorMessages.join(' ') });
      }
    } else {
      setError(null);
    }

    // Handle field errors
    if (fieldErrors.length > 0) {
      fieldErrors.forEach((fieldError) => {
        setFieldError(fieldError.name as unknown as Path<T>, {
          message: typeof fieldError.message === 'string' ? fieldError.message : undefined,
        });
      });
    }
  };

  return { form, handleSubmit, error, setError, handleSubmitError, setFieldError };
}

export function PageForm<T extends object>(props: PageFormProps<T>) {
  const { errorAdapter = genericErrorAdapter, isWizard = false } = props;

  const { form, handleSubmit, error, setError, handleSubmitError, setFieldError } =
    useFormErrors<T>(props.defaultValue, errorAdapter, isWizard);
  const [settings] = useContext(PageSettingsContext);
  const [frameworkTranslations] = useFrameworkTranslations();
  const isMd = useBreakpoint('md');
  const isHorizontal = props.isVertical ? false : settings.formLayout === 'horizontal';
  const multipleColumns = props.singleColumn ? false : settings.formColumns === 'multiple';

  let children = props.children;
  if (props.disableGrid !== true) {
    children = (
      <PageFormGrid isVertical={props.isVertical} singleColumn={props.singleColumn}>
        {props.children}
      </PageFormGrid>
    );
  }

  return (
    <FormProvider {...form}>
      <Form
        onKeyDown={(event) => {
          if (event.key === 'Enter' && props.disableSubmitOnEnter) {
            event.preventDefault();
          }
        }}
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
                (error) => setError(error),
                setFieldError,
                isSecondaryButton ? form : undefined
              );
            } catch (err) {
              handleSubmitError(err);
            }
          }
        )}
        isHorizontal={isHorizontal}
        autoComplete={props.autoComplete}
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
        {error && <ErrorAlert error={error} isMd={isMd} onCancel={props.onCancel} />}
        <Scrollable>
          <FormContainer
            variant="light"
            isFilled
            isWidthLimited
            padding={{ default: props.disablePadding ? 'noPadding' : 'padding' }}
            style={{ maxWidth: multipleColumns ? undefined : 880 }} // This is the PF limitMaxWidth for forms
          >
            {children}
          </FormContainer>
        </Scrollable>
        {props.footer ? (
          props.footer
        ) : (
          <PageSection variant="light" isFilled={false} className="bg-lighten border-top">
            <FormActionGroup>
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
            </FormActionGroup>
          </PageSection>
        )}
      </Form>
    </FormProvider>
  );
}

export type PageFormSubmitHandler<T extends FieldValues> = (
  data: T,
  setError: (error: string) => void,
  setFieldError: (fieldName: FieldPath<T>, error: ErrorOption) => void,
  form: UseFormReturn<T> | undefined
) => Promise<unknown>;

export function PageFormGrid(props: {
  children?: ReactNode;
  isVertical?: boolean;
  singleColumn?: boolean;
  className?: string;
}) {
  const [settings] = useContext(PageSettingsContext);
  const isHorizontal = props.isVertical ? false : settings.formLayout === 'horizontal';
  const multipleColumns = props.singleColumn ? false : settings.formColumns === 'multiple';

  const sm: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 12 : 12) : 12;
  const md: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 12 : 6) : 12;
  const lg: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 6 : 6) : 12;
  const xl: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 6 : 6) : 12;
  const xl2: gridItemSpanValueShape | undefined = multipleColumns ? (isHorizontal ? 4 : 4) : 12;

  const Component = (
    <Grid hasGutter span={12} sm={sm} md={md} lg={lg} xl={xl} xl2={xl2} className={props.className}>
      {props.children}
    </Grid>
  );

  return Component;
}
