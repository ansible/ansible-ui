import { Content, TextArea, Title } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown, { type Components } from 'react-markdown';
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
`;

interface IProps {
  text: string;
  placeholder: string;
  updateText: (text: string) => void;
  helperText: string;
  editing: boolean;
}

function MarkdownHeading({
  headingLevel,
  children,
}: Readonly<{ headingLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; children?: ReactNode }>) {
  return <Title headingLevel={headingLevel}>{children}</Title>;
}

function MarkdownContent({
  component,
  children,
}: Readonly<{
  component: 'p' | 'ul' | 'ol' | 'li' | 'blockquote' | 'hr';
  children?: ReactNode;
}>) {
  return <Content component={component}>{children}</Content>;
}

const markdownComponents: Components = {
  h1: ({ children }) => <MarkdownHeading headingLevel="h1">{children}</MarkdownHeading>,
  h2: ({ children }) => <MarkdownHeading headingLevel="h2">{children}</MarkdownHeading>,
  h3: ({ children }) => <MarkdownHeading headingLevel="h3">{children}</MarkdownHeading>,
  h4: ({ children }) => <MarkdownHeading headingLevel="h4">{children}</MarkdownHeading>,
  h5: ({ children }) => <MarkdownHeading headingLevel="h5">{children}</MarkdownHeading>,
  h6: ({ children }) => <MarkdownHeading headingLevel="h6">{children}</MarkdownHeading>,
  p: ({ children }) => <MarkdownContent component="p">{children}</MarkdownContent>,
  ul: ({ children }) => <MarkdownContent component="ul">{children}</MarkdownContent>,
  ol: ({ children }) => <MarkdownContent component="ol">{children}</MarkdownContent>,
  li: ({ children }) => <MarkdownContent component="li">{children}</MarkdownContent>,
  blockquote: ({ children }) => (
    <MarkdownContent component="blockquote">{children}</MarkdownContent>
  ),
  hr: () => <MarkdownContent component="hr" />,
};

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
        <div
          data-cy="readme"
          data-testid="readme"
          className={editing ? 'pf-v6-c-content preview' : 'pf-v6-c-content'}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {text || placeholder}
          </ReactMarkdown>
        </div>
      </ReactMarkdownWrapper>
    </MarkdownEditorWrapper>
  );
}
