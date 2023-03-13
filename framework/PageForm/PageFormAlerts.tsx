import { Alert } from '@patternfly/react-core';
import { Fragment } from 'react';
import { useFormState } from 'react-hook-form';
import { useBreakpoint } from '../components/useBreakPoint';
import { useFrameworkTranslations } from '../useFrameworkTranslations';

export function PageFormAlerts() {
  const { errors } = useFormState();
  const isMd = useBreakpoint('md');
  const [translations] = useFrameworkTranslations();
  return (
    <Fragment>
      {errors && Object.keys(errors).length > 0 && (
        <Alert
          title={translations.pleaseFixValidationErrors}
          isInline
          style={{ width: '100%', paddingLeft: isMd ? 190 : undefined }}
          variant="danger"
        >
          {/* {process.env.NODE_ENV === 'development' && errors[Object.keys(errors)[0]].message} */}
        </Alert>
      )}
    </Fragment>
  );
}
