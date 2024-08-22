import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import React, { ReactNode, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { usePageSettings } from '..';
import { objectToString, valueToObject } from '../PageForm/Inputs/PageFormDataEditor';
import { DataEditorLanguages } from '../components/DataEditor';
import { useClipboard } from '../hooks/useClipboard';
import { PageDetail } from './PageDetail';

export function PageDetailCodeEditor(props: {
  label?: string;
  value: string;
  helpText?: string | ReactNode;
  toggleLanguage?: boolean;
  showCopyToClipboard?: boolean;
  isEmpty?: boolean;
  fullWidth?: boolean;
  isArray?: boolean;
}) {
  const {
    value,
    label,
    helpText,
    fullWidth = true,
    showCopyToClipboard = true,
    toggleLanguage = true,
    isArray = false,
  } = props;

  const { id } = useParams();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const settings = usePageSettings();
  const defaultLanguage = settings.dataEditorFormat ?? 'yaml';
  const [language, setLanguage] = useState<DataEditorLanguages>(defaultLanguage);
  const [codeEditorValue, setCodeEditorValue] = useState<string>(value);
  const { copySuccess, writeToClipboard } = useClipboard();

  const onClick = (event: React.MouseEvent<Element, MouseEvent>, text: string) => {
    writeToClipboard(text);
    setCopied(copySuccess);
  };

  useLayoutEffect(() => {
    if (toggleLanguage) {
      const translatedVal = objectToString(valueToObject(value, isArray), language);
      setCodeEditorValue(translatedVal);
    }
  }, [language, toggleLanguage, value, isArray]);

  const actions =
    showCopyToClipboard || toggleLanguage ? (
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
        {toggleLanguage && (
          <CodeBlockAction>
            <ToggleGroup isCompact>
              <ToggleGroupItem
                id="toggle-yaml"
                data-cy="toggle-yaml"
                aria-label={t('Toggle to YAML')}
                isSelected={language === 'yaml'}
                text="YAML"
                type="button"
                onChange={() => setLanguage('yaml')}
              />
              <ToggleGroupItem
                id="toggle-json"
                data-cy="toggle-json"
                aria-label={t('Toggle to JSON')}
                isSelected={language === 'json'}
                text="JSON"
                type="button"
                onChange={() => setLanguage('json')}
              />
            </ToggleGroup>
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
        <CodeBlockCode data-cy={'code-block-value'}>{codeEditorValue}</CodeBlockCode>
      </CodeBlock>
    </PageDetail>
  );
}
