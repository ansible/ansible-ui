import { useTranslation } from 'react-i18next';
import { withTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { dom, parse } from 'antsibull-docs';
import { Component } from 'react';

import React from 'react';
import { CodeBlock, PageSection, Stack, StackItem, TextInput, Title } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { IContents, IContentsOption } from '../../Collection';
import { PFColorE } from '../../../../../framework';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/ExpandableSection/expandable-section';
import { AngleDownIcon, AngleRightIcon } from '@patternfly/react-icons';
import { useSearchParams } from 'react-router-dom';
import { ISample } from '../../Collection';
import { queryStringFromObject } from '../../../../common/utils/queryStringFromObject';
import { useGetPageUrl } from '../../../../../framework';
import { HubRoute } from '../../../main/HubRoutes';
import { CollectionVersionSearch } from '../../Collection';
import { useSettings } from '../../../../../framework';

type GroupType = {
  name: string;
  contents: IContents[];
};

export function CollectionDocumentationTabContent(props: {
  content: IContents | undefined;
  collection: CollectionVersionSearch;
  groups: GroupType[];
}) {
  const { t } = useTranslation();
  const { content } = props;
  const splitString = '- name';
  const [optionsState, setOptionsState] = useState<OptionRecord[]>([]);
  const [searchParams] = useSearchParams();
  const queryString = queryStringFromObject(searchParams);
  const getPageUrl = useGetPageUrl();
  const settings = useSettings();
  const [paramsFilter, setParamsFilter] = useState('');

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

  const backtoMenuLink = <a href={`?${queryString}#Menu_part`}>{t('Back to overview')}</a>;

  const params: Params = {
    getPageUrl,
    groups: props.groups,
    url: '',
    settings,
    docParams: {
      repository: props.collection.repository?.name || '',
      namespace: props.collection.collection_version?.namespace || '',
      name: props.collection.collection_version?.name || '',
      content_name: '',
      content_type: '',
    },
  };

  return (
    <>
      <PageSection variant="light" id="Menu_part">
        <Stack hasGutter>
          <Title headingLevel="h1">{content?.content_type + ' > ' + content?.content_name}</Title>
          {content?.doc_strings?.doc?.short_description && (
            <StackItem>
              {applyDocFormatters(content?.doc_strings?.doc.short_description, params)}
            </StackItem>
          )}
          {content?.doc_strings?.doc?.deprecated && (
            <>
            <ErrorBoundary>
                <Title headingLevel="h2">{t('DEPRECATED')}</Title>
                <StackItem>
                  {' '}
                  <span style={{ fontWeight: 'bold' }}>{t('Why')}</span> :{' '}
                  {applyDocFormatters(content?.doc_strings?.doc?.deprecated?.why, params)}
                </StackItem>
                <StackItem>
                  {' '}
                  <span style={{ fontWeight: 'bold' }}>{t('Alternative')}</span> :{' '}
                  {applyDocFormatters(content?.doc_strings?.doc?.deprecated?.alternative, params)}
                </StackItem>
              </ErrorBoundary>
            </>
          )}

          <Title headingLevel="h2">{t('Overview')}</Title>
          {
            <ul>
              {content?.doc_strings?.doc?.description && (
                <li>
                  <a href={`?${queryString}#Synopsis_part`}>{t('Synopsis')}</a>
                </li>
              )}
              {optionsState && optionsState.length > 0 && (
                <li>
                  <a href={`?${queryString}#Parameters_part`}>{t('Parameters')}</a>
                </li>
              )}
              {content?.doc_strings?.doc?.notes && (
                <li>
                  <a href={`?${queryString}#Notes_part`}>{t('Notes')}</a>
                </li>
              )}
              {content?.doc_strings?.examples && (
                <li>
                  <a href={`?${queryString}#Examples_part`}>{t('Examples')}</a>
                </li>
              )}
              {content?.doc_strings?.return && (
                <li>
                  <a href={`?${queryString}#Returns_part`}>{t('Returns')}</a>
                </li>
              )}
            </ul>
          }
        </Stack>
      </PageSection>
      {content?.doc_strings?.doc?.description &&
        Array.isArray(content?.doc_strings?.doc?.description) && (
          <PageSection variant="light">
            <Title headingLevel="h2" id="Synopsis_part">
              {t('Synopsis')}
            </Title>
            {backtoMenuLink}
            <Stack hasGutter>
              <ul>
                {content?.doc_strings?.doc?.description.map((item, index) => (
                  <li key={item + index.toString()}>{applyDocFormatters(item, params)}</li>
                ))}
              </ul>
            </Stack>
          </PageSection>
        )}
      {optionsState && optionsState.length > 0 && (
        <>
          <PageSection variant="light" style={{ paddingBottom: 0 }}>
            <Title headingLevel="h2" id="Parameters_part">
              {t('Parameters')}
            </Title>
            {backtoMenuLink}
          </PageSection>
          <PageSection variant="light" style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
            <TextInput
              onChange={(event, text) => setParamsFilter(text)}
              value={paramsFilter}
              isExpanded={false}
              placeholder={t('Search for parameter name')}
            />
            <Table variant="compact">
              <Thead>
                <Tr>
                  <Th>
                    <Title headingLevel="h3">{t('Parameters')}</Title>
                  </Th>
                  <Th>
                    <Title headingLevel="h3">{t('Choices')}</Title>
                  </Th>
                  {content?.content_type !== 'module' && (
                    <Th>
                      <Title headingLevel="h3">{t('Coonfiguration')}</Title>
                    </Th>
                  )}
                  <Th>
                    <Title headingLevel="h3">{t('Comments')}</Title>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {optionsState
                  .filter(
                    (optionState) =>
                      optionState.visible && optionState.option.name.startsWith(paramsFilter)
                  )
                  .map((optionRecord) => {
                    const descriptions = Array.isArray(optionRecord.option.description)
                      ? optionRecord.option.description
                      : [optionRecord.option.description];

                    // if its string, transform it to array
                    if (typeof optionRecord.option.default === 'string') {
                      optionRecord.option.default = [optionRecord.option.default];
                    }
                    // special cases where choices are empty, fill are with defaults
                    if (
                      !optionRecord.option.choices ||
                      Array.isArray(optionRecord.option.choices)
                    ) {
                      if (Array.isArray(optionRecord.option.default)) {
                        optionRecord.option.choices = optionRecord.option.default;
                      }
                    }

                    const params: Params = {
                      getPageUrl,
                      groups: props.groups,
                      docParams: {
                        repository: props.collection.repository?.name || '',
                        namespace: props.collection.collection_version?.namespace || '',
                        name: props.collection.collection_version?.name || '',
                        content_type: content?.content_type || '',
                        content_name: content?.content_name || '',
                      },
                      url: '',
                      settings,
                    };

                    return (
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
                            {!optionRecord.children && (
                              <span style={{ fontWeight: 'bold' }}>
                                {optionRecord.option.name}
                                <br />
                              </span>
                            )}
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
                          {optionRecord.option.choices?.map((choice, index) => {
                            let style = {};
                            let title = '';

                            if (
                              Array.isArray(optionRecord.option.default) &&
                              optionRecord.option.default.includes(choice)
                            ) {
                              title = t('Default');
                              style = { color: PFColorE.Blue };
                            }

                            if (typeof choice === 'string') {
                              return (
                                <p title={title} style={style} key={choice + index}>
                                  {choice}
                                </p>
                              );
                            }

                            return <></>;
                          })}
                        </Td>
                        {content?.content_type !== 'module' && (
                          <Td>{renderPluginConfiguration(optionRecord.option)}</Td>
                        )}
                        <Td>
                          {descriptions.map((description, index) => (
                            <>
                              {index > 0 && (
                                <>
                                  <br />
                                  <br />
                                </>
                              )}
                              {applyDocFormatters(description, params)}
                            </>
                          ))}
                        </Td>
                      </Tr>
                    );
                  })}
              </Tbody>
            </Table>
          </PageSection>
        </>
      )}
      {content?.doc_strings?.doc?.notes && (
        <PageSection variant="light">
          <Title headingLevel="h2" id="Notes_part">
            {t('Notes')}
          </Title>
          {backtoMenuLink}
          <Stack hasGutter>
            {content?.doc_strings?.doc.notes?.map((note, index) => (
              <p key={index}>{applyDocFormatters(note, params)}</p>
            ))}
          </Stack>
        </PageSection>
      )}
      {content?.doc_strings?.examples && (
        <PageSection variant="light">
          <Title headingLevel="h2" id="Examples_part">
            {t('Examples')}
          </Title>
          {backtoMenuLink}
          <Stack hasGutter>
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
            <Title headingLevel="h2" id="Returns_part">
              {t('Returns')}
            </Title>
            {backtoMenuLink}
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
                    <Td>
                      <div>{applyDocFormatters(parameter.description, params)}</div>
                      {parameter.sample && (
                        <>
                          <div>{t('Sample')}:</div>
                          <br />
                          <Sample sample={parameter.sample} />
                        </>
                      )}
                    </Td>
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

function Sample(props: { sample: ISample }) {
  const { sample } = props;

  return <SampleNode sample={sample} level={0} draw_comma={false} />;
}

function SampleNode(props: { sample: ISample; level: number; draw_comma: boolean }) {
  const { sample, level, draw_comma } = props;

  let comma = '';
  if (draw_comma) {
    comma += ',';
  }

  if (Array.isArray(sample)) {
    return (
      <>
        <SampleLine text="[" level={level} />
        {sample.map((item: ISample, index: number) => {
          return (
            <SampleNode
              key={index}
              sample={item}
              level={level + 1}
              draw_comma={index !== sample.length - 1}
            />
          );
        })}
        <SampleLine text={']' + comma} level={level} />
      </>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return <SampleLine text={`"` + sample.toString() + `"${comma}`} level={level} />;
}

function SampleLine(props: { text: string; level: number }) {
  const { text, level } = props;

  return (
    <span style={{ marginLeft: `${level * 10}px` }}>
      {text}
      <br />
    </span>
  );
}

function applyDocFormatters(text: string, params: Params): React.ReactNode {
  // TODO: pass current plugin's type and name, and (if role) the current entrypoint as well

  try {
    const parsed = parse(text);

    // Special case: result is a single paragraph consisting of a single text part
    if (parsed.length === 1 && parsed[0].length === 1 && parsed[0][0].type === dom.PartType.TEXT) {
      return <span>{parsed[0][0].text}</span>;
    }

    const fragments: React.ReactNode[] = [];
    for (const paragraph of parsed) {
      for (const part of paragraph) {
        fragments.push(formatPart(part, params));
      }
    }
    return (
      <span>
        {fragments.map((x, i) => (
          <React.Fragment key={i}>{x}</React.Fragment>
        ))}
      </span>
    );
  } catch (error) {
    return <>{text}</>;
  }
}

function formatPart(part: dom.Part, params: Params): React.ReactNode {
  switch (part.type) {
    case dom.PartType.ERROR:
      return formatPartError(part as dom.ErrorPart);
    case dom.PartType.BOLD:
      return formatPartBold(part as dom.BoldPart);
    case dom.PartType.CODE:
      return formatPartCode(part as dom.CodePart, params);
    case dom.PartType.HORIZONTAL_LINE:
      return formatPartHorizontalLine(part as dom.HorizontalLinePart);
    case dom.PartType.ITALIC:
      return formatPartItalic(part as dom.ItalicPart);
    case dom.PartType.LINK:
      return formatPartLink(part as dom.LinkPart, params);
    case dom.PartType.MODULE:
      return formatPartModule(part as dom.ModulePart, params);
    case dom.PartType.RST_REF:
      return formatPartRstRef(part as dom.RSTRefPart);
    case dom.PartType.URL:
      return formatPartURL(part as dom.URLPart);
    case dom.PartType.TEXT:
      return formatPartText(part as dom.TextPart);
    case dom.PartType.ENV_VARIABLE:
      return formatPartEnvVariable(part as dom.EnvVariablePart, params);
    case dom.PartType.OPTION_NAME:
      return formatPartOptionNameReturnValue(part as dom.OptionNamePart, params);
    case dom.PartType.OPTION_VALUE:
      return formatPartOptionValue(part as dom.OptionValuePart, params);
    case dom.PartType.PLUGIN:
      return formatPartPlugin(part as dom.PluginPart, params);
    case dom.PartType.RETURN_VALUE:
      return formatPartOptionNameReturnValue(part as dom.ReturnValuePart, params);
  }
}

function formatPartError(part: dom.ErrorPart): React.ReactNode {
  return <span className="error">{part.message}</span>;
}

function formatPartBold(part: dom.BoldPart): React.ReactNode {
  return <b>{part.text}</b>;
}

function formatPartCode(part: dom.CodePart, params: Params): React.ReactNode {
  return formatPartCodeCommon(part.text, params);
}

function formatPartCodeCommon(text: string, params: Params): React.ReactNode {
  let color = '#e6e9e9';
  if (params.settings.theme === 'dark') {
    color = '#6e9e9e';
  }
  return (
    <span
      style={{
        backgroundColor: color,
        fontFamily: 'var(--pf-global--FontFamily--monospace)',
        display: 'inline-block',
        borderRadius: '2px',
        padding: '0 2px',
      }}
    >
      {text}
    </span>
  );
}

function formatPartHorizontalLine(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  part: dom.HorizontalLinePart
): React.ReactNode {
  return <hr />;
}

function formatPartItalic(part: dom.ItalicPart): React.ReactNode {
  return <i>{part.text}</i>;
}

function formatPartLink(part: dom.LinkPart, params: Params): React.ReactNode {
  return renderDocLink(part.text, part.url, params);
}

function formatPartModule(part: dom.ModulePart, params: Params): React.ReactNode {
  const newDocParams = { ...params.docParams };
  const newParams = { ...params };
  newDocParams.content_type = 'module';
  newParams.docParams = newDocParams;

  return renderPluginLink(part.fqcn, newParams);
}

function formatPartRstRef(part: dom.RSTRefPart): React.ReactNode {
  return part.text;
}

function formatPartURL(part: dom.URLPart): React.ReactNode {
  return <Link to={part.url}>{part.url}</Link>;
}

function formatPartText(part: dom.TextPart): React.ReactNode {
  return part.text;
}

function formatPartEnvVariable(part: dom.EnvVariablePart, params: Params): React.ReactNode {
  return formatPartCodeCommon(part.name, params);
}

function formatPartOptionNameReturnValue(
  part: dom.OptionNamePart | dom.ReturnValuePart,
  params: Params
): React.ReactNode {
  const newDocParams = { ...params.docParams };
  const newParams = { ...params };
  newDocParams.content_type = part.plugin?.type || '';
  newParams.docParams = newDocParams;

  const content =
    part.value === undefined
      ? formatPartCodeCommon(part.name, params)
      : formatPartCodeCommon(part.value, params);
  if (!part.plugin) {
    return content;
  }
  return renderPluginLink(part.plugin.fqcn, newParams);
}

function formatPartOptionValue(part: dom.OptionValuePart, params: Params): React.ReactNode {
  return formatPartCodeCommon(part.value, params);
}

function formatPartPlugin(part: dom.PluginPart, params: Params): React.ReactNode {
  const newDocParams = { ...params.docParams };
  const newParams = { ...params };
  newDocParams.content_type = part.plugin.type;
  newParams.docParams = newDocParams;

  return renderPluginLink(part.plugin.fqcn, newParams);
}

function renderDocLink(name: string, href: string | undefined, params: Params) {
  const docParams = params.docParams;

  // TODO - dont work and links are broken in old app too... dont know what to do with this

  if (!!href && href.startsWith('http')) {
    return <Link to={href}>{name}</Link>;
  } else if (href) {
    // TODO: right now this will break if people put
    // ../ at the front of their urls. Need to find a
    // way to document this

    let path = window.location.href;
    path = path.replace(
      '/contents',
      `/documentation/${docParams.content_type}/${docParams.content_name}`
    );

    return <Link to={path}>{name}</Link>;
  } else {
    return null;
  }
}

function renderPluginConfiguration(option: IContentsOption) {
  const iniEntries = 'ini entries:';
  const env = 'env:';
  const varT = 'var:';

  return (
    <React.Fragment>
      {option.ini ? (
        <div className="plugin-config">
          {iniEntries}
          {option.ini.map((v, i) => (
            <p key={i}>
              [{v.section}]<br />
              {v.key} = {v.default ? v.default : 'VALUE'}
            </p>
          ))}
        </div>
      ) : null}

      {option.env ? (
        <div className="plugin-config">
          {option.env.map((v, i) => (
            <div key={i}>
              {env} {v.name}
            </div>
          ))}
        </div>
      ) : null}

      {option.vars ? (
        <div className="plugin-config">
          {option['vars'].map((v, i) => (
            <div key={i}>
              {varT} {v.name}
            </div>
          ))}
        </div>
      ) : null}
    </React.Fragment>
  );
}

function renderPluginLink(text: string, params: Params) {
  let module: IContents | undefined = undefined;
  const docParams = params.docParams;

  params.groups.forEach((group) => {
    group.contents.forEach((content) => {
      if (
        content.content_name === docParams.content_name &&
        content.content_type === docParams.content_type
      ) {
        module = content;
      }
    });
  });

  if (module) {
    return <Link to={formatDocPath(params)}>{text}</Link>;
  } else {
    return text;
  }
}

function formatDocPath(params: Params) {
  const { repository, namespace, name, content_type, content_name } = params.docParams;
  const path = params.getPageUrl(HubRoute.CollectionDocumentationContent, {
    params: { repository, namespace, name },
    query: { content_type, content_name },
  });
  return path;
}

type Params = {
  getPageUrl: ReturnType<typeof useGetPageUrl>;
  groups: GroupType[];
  docParams: DocParams;
  url: string;
  settings: ReturnType<typeof useSettings>;
};

type DocParams = {
  repository: string;
  namespace: string;
  name: string;
  content_type: string;
  content_name: string;
};

interface IState {
  hasError: boolean;
}

interface IProps {
  children: React.ReactNode;
  t: TFunction<'translation', undefined>;
}

// this cant be implemented in functional component, there is no hook for catching errors
class ErrorBoundaryBase extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>{t('Something went wrong while rendering.')}</h1>;
    }

    return this.props.children;
  }
}

const ErrorBoundary = withTranslation()(ErrorBoundaryBase);
