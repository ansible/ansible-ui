import { useParams } from 'react-router-dom';
import { CodeBlock, CodeBlockCode } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageDetail } from './PageDetail';

export function PageDetailCodeEditor(props: { label?: string; value: string; helpText?: string }) {
  const { value, label } = props;
  const { id } = useParams();
  const { t } = useTranslation();
  return (
    <PageDetail label={label ?? t('Variables')}>
      <CodeBlock id={id}>
        <CodeBlockCode>{value}</CodeBlockCode>
      </CodeBlock>
    </PageDetail>
  );
}
