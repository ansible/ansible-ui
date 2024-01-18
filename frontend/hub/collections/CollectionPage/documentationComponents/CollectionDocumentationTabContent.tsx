import { useTranslation } from 'react-i18next';
import React from 'react';
import { CodeBlock, PageSection, Stack, StackItem, Title } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { IContents, IContentsOption } from '../../Collection';
import { PFColorE } from '../../../../../framework';

export function CollectionDocumentationTabContent(props: { content: IContents | undefined }) {
  const { t } = useTranslation();
  const { content } = props;
  const splitString = '- name';

  type OptionRecord = { option: IContentsOption; level: number; path_name: string };
  const options: OptionRecord[] = [];

  function fillOptions(
    local_options: IContentsOption[],
    level: number,
    global_options: OptionRecord[],
    path_name: string
  ) {
    if (level === undefined) {
      return;
    }

    if (!local_options) {
      return;
    }

    local_options.forEach((option) => {
      let new_path = path_name;
      if (new_path.length > 0) {
        new_path += '/';
      }
      new_path += option.name;

      // fill boolean choices if their are missing
      if (option.type === 'bool' && !(option.choices && option.choices.length > 0)) {
        option.choices = [];
        option.choices.push('true');
        option.choices.push('false');
      }
      global_options?.push({ option, level, path_name: new_path });
      if (option.suboptions) {
        fillOptions(option.suboptions, level + 1, global_options, new_path);
      }
    });
  }

  fillOptions(content?.doc_strings?.doc?.options || [], 0, options, '');

  return (
    <>
      <PageSection variant="light">
        <Stack hasGutter>
          <Title headingLevel="h1">{content?.content_type + ' > ' + content?.content_name}</Title>
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
                  <Tr key={optionRecord.path_name}>
                    <Td>
                      <div style={{ marginLeft: `${optionRecord.level * 30}px` }}>
                        <div>
                          {optionRecord.path_name !== optionRecord.option.name &&
                            optionRecord.path_name}
                        </div>
                        <div style={{ fontWeight: 'bold' }}>{optionRecord.option.name}</div>
                        <small style={{ opacity: 0.7 }}>
                          {optionRecord.option.type}{' '}
                          {optionRecord.option.required && (
                            <span style={{ color: PFColorE.Red }}> / {t('Required')}</span>
                          )}{' '}
                        </small>
                      </div>
                    </Td>
                    <Td>
                      {optionRecord.option.choices?.map((choice) => {
                        let style = {};
                        let title = '';
                        if (optionRecord.option.default?.toString() === choice.toString()) {
                          title = t('Default');
                          style = { color: PFColorE.Blue };
                        }

                        return (
                          <p title={title} style={style} key={choice}>
                            {choice}
                          </p>
                        );
                      })}
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
