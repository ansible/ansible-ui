import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Divider, TextContent, Text, TextVariants } from '@patternfly/react-core';
import { PageDetail, PageDetails } from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import type { AuthenticatorPlugins } from '../../../../interfaces/AuthenticatorPlugin';
import { Authenticator } from '../../../../interfaces/Authenticator';
import { AuthenticatorMap } from '../../../../interfaces/AuthenticatorMap';
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

export function AuthenticatorReviewStep(props: { plugins: AuthenticatorPlugins }) {
  const { plugins } = props;
  const { t } = useTranslation();
  const { wizardData } = usePageWizard();

  const { name, type, configuration } = wizardData as Authenticator;
  const maps: AuthenticatorMap[] = [];

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

  return (
    <>
      <PageDetails numberOfColumns="multiple">
        <PageDetail label={t('Name')}>{name}</PageDetail>
        <PageDetail label={t('Type')}>{type}</PageDetail>
        {fields.map((field) => (
          <PageDetail label={field.label} key={field.label}>
            {field.value}
          </PageDetail>
        ))}
      </PageDetails>
      {objFields.length ? (
        <PageDetails numberOfColumns="single">
          {objFields.map((field) => (
            <PageDetailCodeEditor label={field.label} key={field.label} value={field.value} />
          ))}
        </PageDetails>
      ) : null}
      {maps && maps.length ? (
        <>
          <Section>
            <Divider />
            <SubHeading component={TextVariants.h3}>{t('Mapping')}</SubHeading>
          </Section>
          <PageDetails numberOfColumns="single">
            {maps.map((map) => (
              <PageDetail label={map.name} key={map.name}>
                {map.ui_summary || t('{{mapType}} map', { mapType: map.map_type })}
              </PageDetail>
            ))}
          </PageDetails>
        </>
      ) : null}
    </>
  );
}
