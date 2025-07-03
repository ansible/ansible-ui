import { PageDetail } from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { LabelGroup } from '@patternfly/react-core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { CredentialInputSource } from '../../../interfaces/CredentialInputSource';

export function CredentialTypeDetail(props: {
  inputs: Record<string, string | number>;
  field: { id: string; label: string; type: string; ask_at_runtime?: boolean; help_text: string };
  inputSources?: Record<string, CredentialInputSource>;
}) {
  const { inputs, field, inputSources } = props;
  const { t } = useTranslation();
  const { id, label, type, ask_at_runtime, help_text = '' } = field;
  if (id && inputSources && inputSources[id]) {
    return (
      <React.Fragment key={id}>
        <PageDetail helpText={help_text} label={label + ' *'}>
          <LabelGroup numLabels={1}>
            <CredentialLabel credential={inputSources[id]?.summary_fields?.source_credential} />
          </LabelGroup>
        </PageDetail>
        {inputSources[id] && inputSources[id].metadata && (
          <PageDetailCodeEditor
            label={t('Metadata')}
            value={JSON.stringify(inputSources[id].metadata, null, 2)}
          />
        )}
      </React.Fragment>
    );
  }

  if (type === 'boolean') {
    return (
      <>
        <PageDetail key={id} label={label} helpText={help_text}>
          {inputs[id] ? t('Yes') : t('No')}
        </PageDetail>
      </>
    );
  }

  if (inputs[id] === '$encrypted$') {
    return (
      <PageDetail key={id} label={label} helpText={help_text}>
        {t(`Encrypted`)}
      </PageDetail>
    );
  }

  if (ask_at_runtime && inputs[id] === 'ASK') {
    return (
      <PageDetail helpText={help_text} key={id} label={label}>
        {t(`Prompt on launch`)}{' '}
      </PageDetail>
    );
  }

  return (
    <PageDetail key={id} label={label} helpText={help_text}>
      {inputs[id]}
    </PageDetail>
  );
}
