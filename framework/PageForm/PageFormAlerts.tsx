import { Alert } from '@patternfly/react-core';
import { Fragment } from 'react';
import { useFormState } from 'react-hook-form';
import { useBreakpoint } from '../components/useBreakPoint';
import { useTranslation } from 'react-i18next';
export function PageFormAlerts() {
  const { errors } = useFormState();
  const isMd = useBreakpoint('md');
  const { t } = useTranslation();
  return (
    <Fragment>
      {errors && Object.keys(errors).length > 0 && (
        <Alert
          title={t('Please fix validation errors.')}
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
