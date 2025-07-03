import { PageFormDataEditor } from '@ansible/ansible-ui-framework';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { useFormContext } from 'react-hook-form';
import { Button, HelperTextItem } from '@patternfly/react-core';
import { Trans, useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ExternalLink } from '../../../common/ExternalLink';
import { RemoteFormProps } from '../RemoteForm';

interface IRequirementsFile {
  isRequired: boolean | undefined;
}

const yamlRequirementsTemplate = `
# Sample requirements.yaml
---

collections:
  - name: namespace.collection_1
  - name: namespace.collection_2

# End of sample requirements.yaml
`;

const Help = () => {
  const [done, setDone] = useState(false);
  const { setValue } = useFormContext();

  return (
    <>
      <Trans>
        This uses the same{' '}
        <ExternalLink href="https://docs.ansible.com/ansible/latest/user_guide/collections_using.html#installing-collections-with-ansible-galaxy">
          requirements.yml
        </ExternalLink>{' '}
        format as the Ansible Galaxy CLI with the caveat that roles are not supported and the source
        parameter is not supported.
      </Trans>
      <br />
      <br />
      <Trans>Example file:</Trans>
      <pre>{yamlRequirementsTemplate}</pre>
      <br />
      {!done ? (
        <Button
          variant="link"
          isInline
          onClick={() => {
            setDone(true);
            setValue('requirements_file', yamlRequirementsTemplate);
          }}
        >
          <Trans>Prefill</Trans>
        </Button>
      ) : (
        <Trans>Done</Trans>
      )}
    </>
  );
};

const warning = (isRequired: boolean) =>
  (
    <HelperTextItem variant={isRequired ? 'default' : 'warning'} key="warning">
      {isRequired ? (
        <Trans>This remote will only sync collections in this file and their dependencies.</Trans>
      ) : (
        <Trans>
          If you populate this requirements file, this remote will only sync collections in this
          file and their dependencies. Otherwise, all collections will be synchronized.
        </Trans>
      )}
    </HelperTextItem>
  ) as unknown as string;

export function RequirementsFile({ isRequired }: Readonly<IRequirementsFile>) {
  const { t } = useTranslation();

  return (
    <PageFormSection singleColumn>
      <PageFormDataEditor<RemoteFormProps>
        name="requirements_file"
        label={t('Requirements file')}
        format="yaml"
        labelHelp={<Help />}
        labelHelpTitle={t('Requirements file')}
        isRequired={isRequired}
        helperText={warning(!!isRequired)}
      />
    </PageFormSection>
  );
}
