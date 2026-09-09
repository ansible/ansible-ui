import { Content, TextArea } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

const MarkdownEditorWrapper = styled.div`
  display: flex;

  > div {
    min-width: 500px;
  }
`;

const RawMarkdown = styled.div`
  margin-right: 15px;
  margin-bottom: 15px;
  height: 100%;
  width: 50%;
`;

const ReactMarkdownWrapper = styled.div`
  flex-grow: 1;

  td,
  th {
    padding: 2px 16px 2px 0;
    vertical-align: top;
  }

  code {
    display: inline-block;
    background: var(--pf-t--global--background--color--secondary--default);
    padding: 2px 6px;
    border-radius: 6px;
  }

  /* remark-gfm / github-markdown-css: hide the list bullet so the checkbox is the marker */
  li.task-list-item {
    list-style-type: none;
  }
`;

interface IProps {
  text: string;
  placeholder: string;
  updateText: (text: string) => void;
  helperText: string;
  editing: boolean;
}

export function MarkdownEditor(props: Readonly<IProps>) {
  const { t } = useTranslation();

  const { text, placeholder, updateText, helperText, editing } = props;

  return (
    <MarkdownEditorWrapper>
      {editing && (
        <RawMarkdown>
          <div>{t`Raw Markdown`}</div>
          <TextArea
            aria-label="raw-markdown"
            data-cy="raw-markdown"
            data-testid="raw-markdown"
            value={text}
            onChange={(_, value) => updateText(value)}
            placeholder={placeholder}
            style={{ height: '500px' }}
          />
          {helperText}
        </RawMarkdown>
      )}
      <ReactMarkdownWrapper>
        {editing && t(`Preview`)}
        <Content data-cy="readme" data-testid="readme" className={editing ? 'preview' : undefined}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || placeholder}</ReactMarkdown>
        </Content>
      </ReactMarkdownWrapper>
    </MarkdownEditorWrapper>
  );
}
