import { CodeBlock, CodeBlockCode } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PromptDetail } from './PromptDetail';

export function NodeCodeEditorDetail({
  label,
  nodeExtraVars,
  templateExtraVars,
}: {
  label?: string;
  nodeExtraVars: string;
  templateExtraVars: string;
}) {
  const { id } = useParams();
  const { t } = useTranslation();

  const value = nodeExtraVars ?? templateExtraVars;
  const isMatch = value.trim() === templateExtraVars.trim();

  return (
    <PromptDetail
      label={label ?? t('Variables')}
      isEmpty={!value}
      isOverridden={!isMatch}
      overriddenValue={templateExtraVars}
    >
      <CodeBlock id={id}>
        <CodeBlockCode data-cy={'code-block-value'}>{value}</CodeBlockCode>
      </CodeBlock>
    </PromptDetail>
  );
}
