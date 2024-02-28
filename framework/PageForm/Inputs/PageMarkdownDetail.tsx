import React from 'react';
import styled from 'styled-components';
import { TextContent } from '@patternfly/react-core';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
export type MarkdownPreviewProps = {
  value: string | undefined;
  label?: string | undefined;
};

export function PageMarkdownDetail(props: MarkdownPreviewProps) {
  const { value, label } = props;
  return (
    <PreviewLabelContainer className="pf-v5-c-form__group">
      {label && <LabelSpan>{label}</LabelSpan>}
      <PreviewContainer>
        <TextContent>
          {<ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>}
        </TextContent>
      </PreviewContainer>
    </PreviewLabelContainer>
  );
}

const LabelSpan = styled.span`
  font-size: 14px;
  font-weight: bold;
`;

const PreviewLabelContainer = styled.div`
  padding: 0px 24px 24px 24px;
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
