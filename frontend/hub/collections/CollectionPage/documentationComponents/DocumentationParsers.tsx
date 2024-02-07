import { dom, parse } from 'antsibull-docs';

import React from 'react';

import { IContents, IContentsOption } from '../../Collection';

import { Link } from 'react-router-dom';

import { HubRoute } from '../../../main/HubRoutes';

import { Params } from './CollectionDocumentationTabContent';

export function applyDocFormatters(text: string, params: Params): React.ReactNode {
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

export function formatPart(part: dom.Part, params: Params): React.ReactNode {
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

export function formatPartError(part: dom.ErrorPart): React.ReactNode {
  return <span className="error">{part.message}</span>;
}

export function formatPartBold(part: dom.BoldPart): React.ReactNode {
  return <b>{part.text}</b>;
}

export function formatPartCode(part: dom.CodePart, params: Params): React.ReactNode {
  return formatPartCodeCommon(part.text, params);
}

export function formatPartCodeCommon(text: string, params: Params): React.ReactNode {
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

export function formatPartHorizontalLine(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  part: dom.HorizontalLinePart
): React.ReactNode {
  return <hr />;
}

export function formatPartItalic(part: dom.ItalicPart): React.ReactNode {
  return <i>{part.text}</i>;
}

export function formatPartLink(part: dom.LinkPart, params: Params): React.ReactNode {
  return renderDocLink(part.text, part.url, params);
}

export function formatPartModule(part: dom.ModulePart, params: Params): React.ReactNode {
  const newDocParams = { ...params.docParams };
  const newParams = { ...params };
  newDocParams.content_type = 'module';
  newParams.docParams = newDocParams;

  return renderPluginLink(part.fqcn, newParams);
}

export function formatPartRstRef(part: dom.RSTRefPart): React.ReactNode {
  return part.text;
}

export function formatPartURL(part: dom.URLPart): React.ReactNode {
  return <Link to={part.url}>{part.url}</Link>;
}

export function formatPartText(part: dom.TextPart): React.ReactNode {
  return part.text;
}

export function formatPartEnvVariable(part: dom.EnvVariablePart, params: Params): React.ReactNode {
  return formatPartCodeCommon(part.name, params);
}

export function formatPartOptionNameReturnValue(
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

export function formatPartOptionValue(part: dom.OptionValuePart, params: Params): React.ReactNode {
  return formatPartCodeCommon(part.value, params);
}

export function formatPartPlugin(part: dom.PluginPart, params: Params): React.ReactNode {
  const newDocParams = { ...params.docParams };
  const newParams = { ...params };
  newDocParams.content_type = part.plugin.type;
  newParams.docParams = newDocParams;

  return renderPluginLink(part.plugin.fqcn, newParams);
}

export function renderDocLink(name: string, href: string | undefined, params: Params) {
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

export function renderPluginConfiguration(option: IContentsOption) {
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

export function renderPluginLink(text: string, params: Params) {
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

export function formatDocPath(params: Params) {
  const { repository, namespace, name, content_type, content_name } = params.docParams;
  const path = params.getPageUrl(HubRoute.CollectionDocumentationContent, {
    params: { repository, namespace, name },
    query: { content_type, content_name },
  });
  return path;
}
