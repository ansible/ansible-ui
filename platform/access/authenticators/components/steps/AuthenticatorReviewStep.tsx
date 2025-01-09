import { PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { Divider, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Authenticator } from '../../../../interfaces/Authenticator';
import { AuthenticatorPlugins } from '../../../../interfaces/AuthenticatorPlugin';
import { getAuthenticatorTypeLabel } from '../../getAuthenticatorTypeLabel';
import { AuthenticatorFormValues } from '../AuthenticatorForm';
import { dataInputTypes, textInputTypes } from './AuthenticatorDetailsStep';
import { MigrateUsersToDetail } from '../MigrateUsersDetail';

type Field = {
  label: string;
  value: string;
};

const Section = styled(TextContent)`
  padding-inline: 24px;
`;

const SubHeading = styled(Text)`
  margin-block: 24px;
`;

export function AuthenticatorReviewStep(props: {
  plugins: AuthenticatorPlugins;
  authenticator?: Authenticator;
}) {
  const { plugins, authenticator } = props;
  const { t } = useTranslation();
  const { wizardData } = usePageWizard<AuthenticatorFormValues>();
  const { name, configuration, mappings, auto_migrate_users_to } = wizardData;
  const type = authenticator ? authenticator.type : wizardData.type;

  const schema =
    plugins.authenticators.find((plugin) => plugin.type === type)?.configuration_schema || [];

  const fields: Field[] = [];
  const objFields: Field[] = [];
  Object.keys(configuration).forEach((key) => {
    const value = configuration[key] as string;
    const definition = schema.find((field) => field.name === key);
    if (!definition) {
      return;
    }
    if (dataInputTypes.includes(definition.type)) {
      objFields.push({
        label: definition?.ui_field_label || definition.name,
        value,
      });
    } else {
      const fieldValue = textInputTypes.includes(definition.type) ? value : value ? 'On' : 'Off';
      fields.push({
        label: definition?.ui_field_label || definition.name,
        value: key === 'BIND_PASSWORD' ? '$encrypted$' : fieldValue,
      });
    }
  });

  const readableType = getAuthenticatorTypeLabel(type, t);
  return (
    <>
      <TextContent style={{ marginBottom: 25 }}>
        <Text component={TextVariants.h2}>{t('Review')}</Text>
      </TextContent>
      <PageDetails numberOfColumns="multiple">
        <PageDetail label={t('Name')}>{name}</PageDetail>
        <PageDetail label={t('Type')}>{readableType}</PageDetail>
        <MigrateUsersToDetail
          autoMigrateUsersTo={auto_migrate_users_to}
          isLegacy={authenticator?.type.includes('legacy') ?? false}
        />
        {fields.map((field) => (
          <PageDetail label={field.label} key={field.label}>
            {field.value}
          </PageDetail>
        ))}
      </PageDetails>
      {objFields.length ? (
        <PageDetails numberOfColumns="single">
          {objFields.map((field) =>
            field.value ? (
              <PageDetailCodeEditor
                isArray={Array.isArray(JSON.parse(field.value))}
                label={field.label}
                key={field.label}
                value={field.value}
              />
            ) : null
          )}
        </PageDetails>
      ) : null}
      {mappings && mappings.length ? (
        <>
          <Section>
            <Divider />
            <SubHeading component={TextVariants.h3}>{t('Mapping')}</SubHeading>
          </Section>
          <PageDetails numberOfColumns="single">
            {mappings.map((map) => (
              <PageDetail label={map.name} key={map.name}>
                {t('{{mapType}} map', { mapType: map.map_type })}
              </PageDetail>
            ))}
          </PageDetails>
        </>
      ) : null}
    </>
  );
}
