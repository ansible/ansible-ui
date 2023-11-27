import { useContext, ReactNode } from 'react';
import { FormProvider, DefaultValues } from 'react-hook-form';
import { Form } from '@patternfly/react-core';
import { useBreakpoint } from '../components/useBreakPoint';
import { SettingsContext } from '../Settings';
import { ErrorAlert } from './ErrorAlert';
import { ErrorAdapter } from './typesErrorAdapter';
import { genericErrorAdapter } from './genericErrorAdapter';
import { useFormErrors, PageFormSubmitHandler } from './PageForm';

export interface GenericFormProps<T extends object> {
  children?: ReactNode;
  onSubmit: PageFormSubmitHandler<T>;
  onCancel?: () => void;
  defaultValue?: DefaultValues<T>;
  isVertical?: boolean;
  autoComplete?: 'on' | 'off';
  errorAdapter?: ErrorAdapter;
}

export function GenericForm<T extends object>(props: GenericFormProps<T>) {
  const { errorAdapter = genericErrorAdapter } = props;

  const { form, handleSubmit, error, setError, handleSubmitError, setFieldError } =
    useFormErrors<T>(props.defaultValue, errorAdapter);
  const [settings] = useContext(SettingsContext);
  const isMd = useBreakpoint('md');
  const isHorizontal = props.isVertical ? false : settings.formLayout === 'horizontal';

  return (
    <FormProvider {...form}>
      <Form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(async (data) => {
          setError(null);
          try {
            await props.onSubmit(data, (error) => setError(error), setFieldError, undefined);
          } catch (err) {
            handleSubmitError(err);
          }
        })}
        isHorizontal={isHorizontal}
        autoComplete={props.autoComplete}
      >
        {error && <ErrorAlert error={error} isMd={isMd} onCancel={props.onCancel} />}
        {props.children}
      </Form>
    </FormProvider>
  );
}
