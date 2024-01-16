import { useTranslation } from 'react-i18next';
import React, { Dispatch, SetStateAction } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  CodeBlock,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { IContents, IContentsOption } from '../../Collection';

export function CollectionDocumentationTabContent(props: {
  content: IContents | undefined;
  isDrawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  const { content, isDrawerOpen, setDrawerOpen } = props;
  const splitString = '- name';

  type OptionRecord = { option: IContentsOption; level: number };
  const options: OptionRecord[] = [];

  function fillOptions(local_options?: IContentsOption[], level?: number) {
    if (level === undefined) {
      return;
    }

    if (!local_options) {
      return;
    }

    local_options.forEach((option) => {
      options.push({ option, level });
      if (option.suboptions) {
        fillOptions(option.suboptions, level + 1);
      }
    });
  }

  fillOptions(content?.doc_strings?.doc?.options, 0);

  return (
    <>
      <PageSection variant="light">
        <Stack hasGutter>
          <Breadcrumb>
            {!isDrawerOpen && (
              <BreadcrumbItem>
                <Button onClick={() => setDrawerOpen(true)} variant="plain" isInline>
                  <BarsIcon />
                </Button>
              </BreadcrumbItem>
            )}
            {content?.content_type && <BreadcrumbItem>{content.content_type}</BreadcrumbItem>}
            {content?.content_name && <BreadcrumbItem>{content.content_name}</BreadcrumbItem>}
          </Breadcrumb>
          <Title headingLevel="h1">{content?.content_name}</Title>
          {content?.doc_strings?.doc?.short_description && (
            <StackItem>{content?.doc_strings?.doc.short_description}</StackItem>
          )}
        </Stack>
      </PageSection>
      {content?.doc_strings?.doc?.description && (
        <PageSection variant="light">
          <Stack hasGutter>
            <Title headingLevel="h2">{t('Synopsis')}</Title>
            <p>{content?.doc_strings?.doc.description}</p>
          </Stack>
        </PageSection>
      )}
      {options && options.length > 0 && (
        <>
          <PageSection variant="light" style={{ paddingBottom: 0 }}>
            <Title headingLevel="h2">{t('Parameters')}</Title>
          </PageSection>
          <PageSection variant="light" style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
            <Table variant="compact">
              <Thead>
                <Tr>
                  <Th>{t('Parameter')}</Th>
                  <Th>{t('Choices')}</Th>
                  <Th>{t('Comments')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {options.map((optionRecord) => (
                  <Tr key={optionRecord.option.name}>
                    <Td>
                      <div style={{ marginLeft: `${optionRecord.level * 30}px` }}>
                        <div>{optionRecord.option.name}</div>
                        <small style={{ opacity: 0.7 }}>{optionRecord.option.type}</small>
                      </div>
                    </Td>

                    <Td>
                      {optionRecord.option.choices?.map((choice) => <p key={choice}>{choice}</p>)}
                    </Td>
                    <Td>{optionRecord.option.description}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </PageSection>
        </>
      )}
      {content?.doc_strings?.doc?.notes && (
        <PageSection variant="light">
          <Stack hasGutter>
            <Title headingLevel="h2">{t('Notes')}</Title>
            {content?.doc_strings?.doc.notes?.map((note, index) => <p key={index}>{note}</p>)}
          </Stack>
        </PageSection>
      )}
      {content?.doc_strings?.examples && (
        <PageSection variant="light">
          <Stack hasGutter>
            <Title headingLevel="h2">{t('Examples')}</Title>
            {content.doc_strings.examples
              .split(splitString)
              .filter((example) => !!example.trim())
              .map((example, index) => (
                <CodeBlock key={index} style={{ overflowY: 'auto' }}>
                  <pre>
                    {splitString}
                    {example
                      .split('\n')
                      .filter((example) => !!example.trim())
                      .join('\n')}
                  </pre>
                </CodeBlock>
              ))}
          </Stack>
        </PageSection>
      )}
      {content?.doc_strings?.return && (
        <>
          <PageSection variant="light" style={{ paddingBottom: 0 }}>
            <Title headingLevel="h2">{t('Returns')}</Title>
          </PageSection>
          <PageSection variant="light" style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
            <Table variant="compact">
              <Thead>
                <Tr>
                  <Th>{t('Key')}</Th>
                  <Th>{t('Returned')}</Th>
                  <Th>{t('Description')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {content?.doc_strings?.return?.map((parameter) => (
                  <Tr key={parameter.name}>
                    <Td>
                      <div>{parameter.name}</div>
                      <small style={{ opacity: 0.7 }}>{parameter.type}</small>
                    </Td>
                    <Td>{parameter.returned}</Td>
                    <Td>{parameter.description}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </PageSection>
        </>
      )}
    </>
  );
}
