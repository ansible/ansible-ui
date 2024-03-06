import { AlertProps } from '@patternfly/react-core';
import { ReactNode, useCallback } from 'react';
import { Accept, useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { usePageAlertToaster } from '..';

export function DropZone(props: {
  children?: ReactNode;
  onDrop: (contents: string) => void;
  isDisabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  accept?: Accept;
}) {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const { onDrop: onLoad } = props;
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
            timeout: true,
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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    accept: props.accept ?? {
      'application/json': ['.json'],
      'text/yaml': ['.yaml', '.yml'],
    },
  });

  return (
    <div
      id="code-editor-dropzone"
      {...getRootProps({ disabled: true })}
      style={{ width: '100%', height: '100%' }}
    >
      <input id="code-editor-dropzone-input" {...getInputProps()} ref={props.inputRef} />
      {props.children}
    </div>
  );
}
