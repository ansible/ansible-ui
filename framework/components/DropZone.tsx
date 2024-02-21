import { AlertProps } from '@patternfly/react-core';
import { ReactNode, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { usePageAlertToaster } from '..';

export function DropZone(props: {
  children?: ReactNode;
  onLoad: (contents: string) => void;
  isDisabled?: boolean;
}) {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const { onLoad } = props;
  const onDrop = useCallback(
    (files: File[]) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const contents = reader.result;
        if (typeof contents === 'string') {
          const alert: AlertProps = {
            variant: 'success',
            title: t('File uploaded'),
          };
          alertToaster.addAlert(alert);
          onLoad(contents);
        }
      };
      reader.onerror = () => {
        const alert: AlertProps = {
          variant: 'danger',
          title: t('Failed to upload file'),
          children: t('Unable to upload'),
        };
        alertToaster.addAlert(alert);
      };
      reader.readAsText(file);
    },
    [t, alertToaster, onLoad]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop, noClick: true });

  return (
    <div
      id="code-editor-dropzone"
      {...getRootProps({ disabled: true })}
      style={{ width: '100%', height: '100%' }}
    >
      <input id="code-editor-dropzone-input" {...getInputProps()} />
      {props.children}
    </div>
  );
}
