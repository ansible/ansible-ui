import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Divider, TextContent, Text, TextVariants } from '@patternfly/react-core';
import { PageDetail, PageDetails } from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { Authenticator } from '../../../../interfaces/Authenticator';
import { AuthenticatorPlugins } from '../../../../interfaces/AuthenticatorPlugin';
import { AuthenticatorFormValues } from '../AuthenticatorForm';
import { textInputTypes, dataInputTypes } from './AuthenticatorDetailsStep';

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
  const { wizardData } = usePageWizard();

  const { name, configuration, mappings } = wizardData as AuthenticatorFormValues;
  const type = authenticator ? authenticator.type : (wizardData as AuthenticatorFormValues).type;

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
      fields.push({
        label: definition?.ui_field_label || definition.name,
        value: textInputTypes.includes(definition.type) ? value : value ? 'On' : 'Off',
      });
    }
  });

  const typeLabels: { [k: string]: string } = {
    local: t('Local'),
    ldap: t('LDAP'),
    saml: t('SAML'),
    keycloak: t('Keycloak'),
  };
  const typeKey = type.split('.').pop();
  const readableType = typeKey ? typeLabels[typeKey] ?? typeKey : type;

  return (
    <>
      <PageDetails numberOfColumns="multiple">
        <PageDetail label={t('Name')}>{name}</PageDetail>
        <PageDetail label={t('Type')}>{readableType}</PageDetail>
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
              <PageDetailCodeEditor label={field.label} key={field.label} value={field.value} />
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
