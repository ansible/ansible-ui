import { Alert } from '@patternfly/react-core';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type ErrorType = string | ReactNode | (string | ReactNode)[] | null;

interface ErrorAlertProps {
  error: ErrorType;
  isMd: boolean;
  onCancel?: () => void;
}

interface ErrorContentProps {
  error: ErrorType;
}

const ErrorContent: React.FC<ErrorContentProps> = ({ error }) => {
  if (typeof error === 'string') {
    return null;
  }

  if (Array.isArray(error) && error.length > 1) {
    return (
      <ul>
        {error.map((err, index) => (
          <li key={index}>{err}</li>
        ))}
      </ul>
    );
  }

  if (React.isValidElement(error)) {
    return <>{error}</>;
  }

  return null;
};

export function ErrorAlert({ error, isMd, onCancel }: ErrorAlertProps) {
  const { t } = useTranslation();

  if (!error) {
    return null;
  }

  const paddingLeft = '24px';
  const isExpandable = Array.isArray(error) && error.length > 1;
  const style = isMd && onCancel ? { paddingLeft } : undefined;

  const getTitle = () => {
    if (typeof error === 'string') {
      return error;
    }

    if (Array.isArray(error) && error.length > 0) {
      return error.length > 1 ? t('Errors') : String(error[0]);
    }

    return t('Error');
  };

  const title = getTitle();

  return (
    <Alert variant="danger" title={title} isInline style={style} isExpandable={isExpandable}>
      <ErrorContent error={error} />
    </Alert>
  );
}
