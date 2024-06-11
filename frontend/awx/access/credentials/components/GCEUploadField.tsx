import { useTranslation } from 'react-i18next';
import { PageFormFileUpload } from '../../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormHelperText, HelperTextItem } from '@patternfly/react-core';

interface GCEFileContents {
  project_id?: string;
  client_email?: string;
  private_key?: string;
}

export function GCEUploadField() {
  const { t } = useTranslation();
  const { setValue, clearErrors } = useFormContext();
  const [GCEFileContents, setGCEFileContents] = useState<GCEFileContents>({});
  const [uploadError, setUploadError] = useState<Error | undefined>(undefined);
  const [isRejected, setIsRejected] = useState(false);
  const onClear = () => {
    setGCEFileContents({});
    setUploadError(undefined);
    setValue('project', '');
    setValue('username', '');
    setValue('ssh_key_data', '');
  };
  const handleFileRejected = () => {
    setIsRejected(true);
  };

  useEffect(() => {
    // Loop through JSON object and set the relevant fields
    if (GCEFileContents.project_id) {
      setValue('project', GCEFileContents.project_id);
      clearErrors('project');
    }
    if (GCEFileContents.client_email) {
      setValue('username', GCEFileContents.client_email);
      clearErrors('username');
    }
    if (GCEFileContents.private_key) {
      setValue('ssh_key_data', GCEFileContents.private_key);
      clearErrors('ssh_key_data');
    }
  }, [GCEFileContents, setValue, clearErrors]);

  return (
    <>
      <PageFormFileUpload
        onClearClick={onClear}
        key="credential-gce-file"
        name="credential-gce-file"
        fieldId="credential-gce-file"
        label={t('Service account JSON file')}
        helperText={t(
          'Select a JSON formatted service account key to autopopulate the following fields.'
        )}
        validated={uploadError ? 'error' : 'default'}
        onInputChange={async (file) => {
          try {
            const fileText = await file.text();
            const fileJSON = JSON.parse(fileText) as GCEFileContents;
            setGCEFileContents(fileJSON);
          } catch (error) {
            setUploadError(error as Error);
          }
        }}
        dropzoneProps={{
          accept: { 'text/json': ['.json'] },
          onDropRejected: handleFileRejected,
        }}
        additionalHelperText={
          <FormHelperText>
            <HelperTextItem variant={isRejected ? 'error' : 'default'}>
              {isRejected ? t('File upload rejected. Please select a single .json file.') : null}
            </HelperTextItem>
          </FormHelperText>
        }
      />
    </>
  );
}
