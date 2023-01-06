/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FormSection } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageForm, PageFormSelectOption, PageLayout } from '../../../../framework';
import { PageFormCheckbox } from '../../../../framework/PageForm/Inputs/PageFormCheckbox';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageFormHidden } from '../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormWatch } from '../../../../framework/PageForm/Utils/PageFormWatch';

export function RolesForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <PageLayout>
      <PageForm
        onSubmit={() => Promise.resolve()}
        onCancel={() => navigate(-1)}
        submitText={t('Submit')}
      >
        <PageFormSelectOption
          name="type"
          label="Role type"
          placeholderText="Select role type"
          options={[
            {
              label: 'Credentials',
              value: 'credential',
            },
            {
              label: 'Job Template',
              value: 'job-template',
            },
            {
              label: 'Workflow Job Templates',
              value: 'workflow-job-template',
            },
            {
              label: 'Inventory',
              value: 'inventory',
            },
            {
              label: 'Project',
              value: 'project',
            },
            {
              label: 'Organization',
              value: 'organization',
            },
          ]}
        />
        <UserCredentialRole />
        {/* <UserJobTemplateRole /> */}
        {/* <PageFormSection title={t('Workflow Job Templates Roles')}>
          <PageFormCheckbox
            name="admin"
            label={t('Admin')}
            description={t('Can manage all aspects of the job template')}
          />
          <PageFormCheckbox
            name="read"
            label={t('Read')}
            description={t('May view settings for the job template')}
          />
          <PageFormCheckbox name="use" label="Use" description={t('May run the job template')} />
        </PageFormSection> */}
      </PageForm>
    </PageLayout>
  );
}

function PageFormSection(props: { title: string; children: ReactNode }) {
  return <FormSection title={props.title}>{props.children}</FormSection>;
}

function UserCredentialRole() {
  const { t } = useTranslation();
  return (
    <PageFormHidden watch="type" hidden={(type: string) => type !== 'credential'}>
      <PageFormTextInput name="credential" label="Credential" />
      <PageFormHidden watch="credential" hidden={(credential) => !credential}>
        <PageFormSection title={t('Credential Permissions')}>
          <PageFormCheckbox
            name="admin_role"
            label={t('Admin')}
            description={t('Can manage all aspects of the credential.')}
          />
          <PageFormCheckbox
            name="read_role"
            label={t('Read')}
            description={t('May view settings for the credential.')}
          />
          <PageFormCheckbox
            name="use_role"
            label={t('Use')}
            description={t('Can use the credential in a job template.')}
          />
        </PageFormSection>
      </PageFormHidden>
    </PageFormHidden>
  );
}

function UserJobTemplateRole() {
  const { t } = useTranslation();
  return (
    <PageFormWatch watch="type">
      {(type: string) => {
        if (type !== 'credential') return <></>;
        return (
          <PageFormSection title={t('Permissions')}>
            <PageFormTextInput name="credential" label="Credential"></PageFormTextInput>
            <PageFormCheckbox
              name="admin"
              label={t('Admin')}
              description={t('Can manage all aspects of the job template')}
            />
            <PageFormCheckbox
              name="read"
              label={t('Read')}
              description={t('May view settings for the job template')}
            />
          </PageFormSection>
        );
      }}
    </PageFormWatch>
  );
}
