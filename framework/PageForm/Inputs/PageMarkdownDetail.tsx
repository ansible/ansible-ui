import { TextContent } from '@patternfly/react-core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';
export type MarkdownPreviewProps = {
  value: string | undefined;
  label?: string | undefined;
};

export function PageMarkdownDetail(props: MarkdownPreviewProps) {
  const { value, label } = props;
  return (
    <PreviewLabelContainer className="pf-v5-c-form__group">
      {label && <LabelDiv>{label}</LabelDiv>}
      <PreviewContainer>
        <TextContent>
          {<ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>}
        </TextContent>
      </PreviewContainer>
    </PreviewLabelContainer>
  );
}

const LabelDiv = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const PreviewLabelContainer = styled.div`
  grid-column: span 3;
`;

const PreviewContainer = styled.div`
  padding: 24px;
  border: thin solid var(--pf-v5-global--BorderColor--100);
  td,
  th {
    padding: 2px 16px 2px 0;
    vertical-align: top;
  }
  code {
    display: inline-block;
    background: var(--pf-v5-global--BackgroundColor--200);
    padding: 2px 6px;
    border-radius: 6px;
  }
`;
