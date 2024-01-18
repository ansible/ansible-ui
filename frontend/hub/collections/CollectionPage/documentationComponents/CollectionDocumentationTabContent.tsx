import { useTranslation } from 'react-i18next';
import React from 'react';
import { CodeBlock, PageSection, Stack, StackItem, Title } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { IContents, IContentsOption } from '../../Collection';
import { PFColorE } from '../../../../../framework';
import { useState, useEffect } from 'react';

import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/ExpandableSection/expandable-section';
import { AngleDownIcon, AngleRightIcon } from '@patternfly/react-icons';

export function CollectionDocumentationTabContent(props: { content: IContents | undefined }) {
  const { t } = useTranslation();
  const { content } = props;
  const splitString = '- name';
  const [optionsState, setOptionsState] = useState<OptionRecord[]>([]);

  type OptionRecord = {
    option: IContentsOption;
    level: number;
    path_name: string;
    parent_path: string;
    visible: boolean;
    children: boolean;
    checked: boolean;
  };

  const contentKey = content?.content_type + ' > ' + content?.content_name;
  useEffect(() => {
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
        global_options?.push({
          option,
          level,
          path_name: new_path,
          parent_path: path_name,
          visible: true,
          checked: true,
          children: option.suboptions ? true : false,
        });
        if (option.suboptions) {
          fillOptions(option.suboptions, level + 1, global_options, new_path);
        }
      });
    }

    fillOptions(content?.doc_strings?.doc?.options || [], 0, options, '');
    setOptionsState(options);
  }, [contentKey, content?.doc_strings?.doc?.options]);

  function setVisibility(path: string, value: boolean) {
    const newState = JSON.parse(JSON.stringify(optionsState)) as OptionRecord[];

    const currentOption = newState.find((item) => item.path_name === path);
    if (currentOption) {
      currentOption.checked = value;
    }

    newState.forEach((optionRecord) => {
      // search for all record starting with this path
      if (optionRecord.path_name.startsWith(path)) {
        // except the exact path, this we dont want to hide
        if (optionRecord.path_name !== path) {
          optionRecord.visible = value;
          optionRecord.checked = value;
        }
      }
    });

    setOptionsState(newState);
  }

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
      {optionsState && optionsState.length > 0 && (
        <>
          <PageSection variant="light" style={{ paddingBottom: 0 }}>
            <Title headingLevel="h2">{t('Parameters')}</Title>
          </PageSection>
          <PageSection variant="light" style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
            <Table variant="compact">
              <Thead>
                <Tr>
                  <Th>
                    <Title headingLevel="h3">{t('Parameters')}</Title>
                  </Th>
                  <Th>
                    <Title headingLevel="h3">{t('Choices')}</Title>
                  </Th>
                  <Th>
                    <Title headingLevel="h3">{t('Comments')}</Title>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {optionsState
                  .filter((optionState) => optionState.visible)
                  .map((optionRecord) => (
                    <Tr key={optionRecord.path_name}>
                      <Td>
                        <div style={{ marginLeft: `${optionRecord.level * 30}px` }}>
                          <div>
                            {optionRecord.children && (
                              <button
                                className={css(styles.expandableSectionToggle)}
                                type="button"
                                aria-expanded={optionRecord.checked}
                                aria-controls={optionRecord.path_name + '_aria_controls'}
                                id={optionRecord.path_name + '_id'}
                                onClick={() =>
                                  setVisibility(optionRecord.path_name, !optionRecord.checked)
                                }
                                title={t('Expand / Collapse')}
                              >
                                {optionRecord.checked ? (
                                  <AngleDownIcon aria-hidden />
                                ) : (
                                  <AngleRightIcon aria-hidden />
                                )}
                                <span style={{ fontWeight: 'bold' }}>
                                  &nbsp;&nbsp;{optionRecord.option.name}
                                </span>
                              </button>
                            )}
                          </div>
                          <small style={{ opacity: 0.7 }}>
                            {optionRecord.option.type}
                            {optionRecord.option.elements && ' / '}
                            {optionRecord.option.elements}{' '}
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
