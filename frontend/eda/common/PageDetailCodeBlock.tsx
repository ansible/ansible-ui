import { PageDetail } from '@ansible/ansible-ui-framework';
import { useClipboard } from '@ansible/ansible-ui-framework/hooks/useClipboard';
import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
} from '@patternfly/react-core';
import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function PageDetailCodeBlock(props: {
  label?: string;
  value: string;
  helpText?: string | ReactNode;
  showCopyToClipboard?: boolean;
  fullWidth?: boolean;
  isEmpty?: boolean;
}) {
  const { value, label, helpText, fullWidth = true, showCopyToClipboard = true } = props;

  const { id } = useParams();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const { copySuccess, writeToClipboard } = useClipboard();

  const onClick = (event: React.MouseEvent<Element, MouseEvent>, text: string) => {
    writeToClipboard(text);
    setCopied(copySuccess);
  };

  const actions = showCopyToClipboard ? (
    <React.Fragment>
      {showCopyToClipboard && (
        <CodeBlockAction>
          <ClipboardCopyButton
            id="basic-copy-button"
            textId="code-content"
            aria-label="Copy to clipboard"
            onClick={(e) => onClick(e, value)}
            exitDelay={copied ? 1500 : 600}
            maxWidth="110px"
            variant="plain"
            onTooltipHidden={() => setCopied(false)}
          >
            {copied ? t('Successfully copied to clipboard!') : t('Copy to clipboard')}
          </ClipboardCopyButton>
        </CodeBlockAction>
      )}
    </React.Fragment>
  ) : null;
  return (
    <PageDetail
      label={label ?? t('Variables')}
      helpText={helpText}
      isEmpty={props?.isEmpty}
      fullWidth={fullWidth}
    >
      <CodeBlock id={id} actions={actions}>
        <CodeBlockCode data-cy={'code-block-value'} data-testid={'code-block-value'}>
          {value}
        </CodeBlockCode>
      </CodeBlock>
    </PageDetail>
  );
}
