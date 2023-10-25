import { ReactNode, CSSProperties } from 'react';
import { Button } from '@patternfly/react-core';
import { useForm, useFormState } from 'react-hook-form';

export function PageFormSubmitButton(props: { children: ReactNode; style?: CSSProperties }) {
  const { isSubmitting, errors } = useFormState();
  const { clearErrors } = useForm();
  // const { t } = useTranslation();
  const hasErrors = errors && Object.keys(errors).length > 0;
  return (
    // Tooltip around buttons does not yet work in PF5
    // <Tooltip content={t('Please fix errors')} trigger={hasErrors ? undefined : 'manual'}>
    <Button
      onClick={() => {
        if (hasErrors) {
          clearErrors();
        }
      }}
      data-cy={'Submit'}
      type="submit"
      isDisabled={isSubmitting}
      isLoading={isSubmitting}
      isDanger={hasErrors}
      variant={hasErrors ? 'secondary' : undefined}
      style={props.style}
    >
      {props.children}
    </Button>
    // </Tooltip>
  );
}

export function PageFormCancelButton(props: { onCancel: () => void; children: ReactNode }) {
  return (
    <Button data-cy={'Cancel'} type="button" variant="link" onClick={props.onCancel}>
      {props.children}
    </Button>
  );
}
