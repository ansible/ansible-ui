import { PageFormDataEditor } from '@ansible/ansible-ui-framework';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RemoteFormProps } from '../RemoteForm';

interface IRequirementsFile {
  isCommunityRemote: boolean | undefined;
}
export function RequirementsFile({ isCommunityRemote }: IRequirementsFile) {
  const { t } = useTranslation();
  const isRequired = isCommunityRemote;

  if (isCommunityRemote === undefined) return null;
  return (
    <PageFormSection singleColumn>
      <PageFormDataEditor<RemoteFormProps>
        name="requirements_file"
        label={t('Requirements file')}
        format="yaml"
        labelHelp={TranslationLabelHelp()}
        labelHelpTitle={t('Requirements file')}
        isRequired={isRequired}
      />
    </PageFormSection>
  );
}

function TranslationLabelHelp() {
  return (
    <Trans>
      This uses the same{' '}
      <Link to="https://docs.ansible.com/ansible/latest/user_guide/collections_using.html#installing-collections-with-ansible-galaxy">
        requirements.yml{' '}
      </Link>
      format as the ansible - galaxy CLI with the caveat that roles are not supported and the source
      parameter is not supported.
    </Trans>
  );
}
