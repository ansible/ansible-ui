/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import * as antsibullDocs from 'antsibull-docs';
import { dom, parse } from 'antsibull-docs';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { IContentsOption } from '../../Collection';
import type { Params } from './CollectionDocumentationTabContent';
import {
  applyDocFormatters,
  formatDocPath,
  formatPart,
  formatPartBold,
  formatPartCode,
  formatPartCodeCommon,
  formatPartEnvVariable,
  formatPartError,
  formatPartHorizontalLine,
  formatPartItalic,
  formatPartLink,
  formatPartModule,
  formatPartOptionNameReturnValue,
  formatPartOptionValue,
  formatPartPlugin,
  formatPartRstRef,
  formatPartText,
  formatPartURL,
  renderDocLink,
  renderPluginConfiguration,
  renderPluginLink,
} from './DocumentationParsers';
import { HubRoute } from '../../../main/HubRoutes';

function createParams(overrides?: Partial<Params>): Params {
  return {
    getPageUrl: (route, options) => {
      const namespace = String(options?.params?.namespace ?? '');
      const name = String(options?.params?.name ?? '');
      const contentType = String(options?.query?.content_type ?? '');
      const contentName = String(options?.query?.content_name ?? '');
      return `/doc/${String(route)}/${namespace}/${name}?type=${contentType}&name=${contentName}`;
    },
    groups: [
      {
        name: 'modules',
        contents: [
          {
            content_name: 'hello',
            content_type: 'module',
            doc_strings: null,
            readme_file: null,
            readme_html: null,
          },
        ],
      },
    ],
    url: '',
    settings: {},
    docParams: {
      repository: 'published',
      namespace: 'ns',
      name: 'coll',
      content_name: 'hello',
      content_type: 'module',
    },
    ...overrides,
  };
}

describe('DocumentationParsers', () => {
  describe('applyDocFormatters', () => {
    it('renders plain text in a span for a single text paragraph', () => {
      render(<>{applyDocFormatters('Hello world', createParams())}</>);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders multiple formatted parts', () => {
      const parts = parse('M(ansible.builtin.ping)');
      const textWithModule = parts[0].map((part) => formatPart(part, createParams()));
      render(
        <MemoryRouter>
          <span>
            {textWithModule.map((node, index) => (
              <span key={index}>{node}</span>
            ))}
          </span>
        </MemoryRouter>
      );
      expect(screen.getAllByText('ansible.builtin.ping').length).toBeGreaterThan(0);
    });

    it('returns raw text when parsing throws', () => {
      const parseSpy = vi.spyOn(antsibullDocs, 'parse').mockImplementation(() => {
        throw new Error('parse failed');
      });
      render(<>{applyDocFormatters('fallback text', createParams())}</>);
      expect(screen.getByText('fallback text')).toBeInTheDocument();
      parseSpy.mockRestore();
    });
  });

  describe('formatPart helpers', () => {
    const params = createParams();

    it('formats each part type', () => {
      render(
        <>{formatPartError({ type: dom.PartType.ERROR, message: 'oops' } as dom.ErrorPart)}</>
      );
      expect(screen.getByText('oops')).toHaveClass('error');

      render(<>{formatPartBold({ type: dom.PartType.BOLD, text: 'bold' } as dom.BoldPart)}</>);
      expect(screen.getByText('bold').tagName).toBe('B');

      render(
        <>{formatPartItalic({ type: dom.PartType.ITALIC, text: 'italic' } as dom.ItalicPart)}</>
      );
      expect(screen.getByText('italic').tagName).toBe('I');

      render(<>{formatPartText({ type: dom.PartType.TEXT, text: 'text' } as dom.TextPart)}</>);
      expect(screen.getByText('text')).toBeInTheDocument();

      render(
        <>{formatPartRstRef({ type: dom.PartType.RST_REF, text: 'ref' } as dom.RSTRefPart)}</>
      );
      expect(screen.getByText('ref')).toBeInTheDocument();

      render(
        <>
          {formatPartHorizontalLine({
            type: dom.PartType.HORIZONTAL_LINE,
          } as dom.HorizontalLinePart)}
        </>
      );
      expect(document.querySelector('hr')).toBeInTheDocument();

      render(
        <>{formatPartCode({ type: dom.PartType.CODE, text: 'code' } as dom.CodePart, params)}</>
      );
      expect(screen.getByText('code')).toBeInTheDocument();

      render(<>{formatPartCodeCommon('inline', params)}</>);
      expect(screen.getByText('inline')).toBeInTheDocument();

      render(
        <MemoryRouter>
          {formatPartURL({ type: dom.PartType.URL, url: '/relative' } as dom.URLPart)}
        </MemoryRouter>
      );
      expect(screen.getByRole('link', { name: '/relative' })).toHaveAttribute('href', '/relative');
    });

    it('formats link, module, plugin, and option parts', () => {
      render(
        <MemoryRouter initialEntries={['/collections/published/ns/coll/contents']}>
          {formatPartLink(
            {
              type: dom.PartType.LINK,
              text: 'link',
              url: 'http://example.com',
            } as dom.LinkPart,
            params
          )}
        </MemoryRouter>
      );
      expect(screen.getByRole('link', { name: 'link' })).toBeInTheDocument();

      render(
        <MemoryRouter>
          {formatPartModule(
            { type: dom.PartType.MODULE, fqcn: 'ansible.builtin.ping' } as dom.ModulePart,
            params
          )}
        </MemoryRouter>
      );
      expect(screen.getByText('ansible.builtin.ping')).toBeInTheDocument();

      render(
        <MemoryRouter>
          {formatPartPlugin(
            {
              type: dom.PartType.PLUGIN,
              plugin: { type: 'module', fqcn: 'ansible.builtin.ping' },
            } as dom.PluginPart,
            params
          )}
        </MemoryRouter>
      );
      expect(screen.getAllByText('ansible.builtin.ping').length).toBeGreaterThan(0);

      render(
        <>
          {formatPartEnvVariable(
            { type: dom.PartType.ENV_VARIABLE, name: 'ANSIBLE_FOO' } as dom.EnvVariablePart,
            params
          )}
        </>
      );
      expect(screen.getByText('ANSIBLE_FOO')).toBeInTheDocument();

      render(
        <>
          {formatPartOptionValue(
            { type: dom.PartType.OPTION_VALUE, value: 'yes' } as dom.OptionValuePart,
            params
          )}
        </>
      );
      expect(screen.getByText('yes')).toBeInTheDocument();

      render(
        <>
          {formatPartOptionNameReturnValue(
            { type: dom.PartType.OPTION_NAME, name: 'opt', value: 'val' } as dom.OptionNamePart,
            params
          )}
        </>
      );
      expect(screen.getByText('val')).toBeInTheDocument();

      render(
        <MemoryRouter>
          {formatPartOptionNameReturnValue(
            {
              type: dom.PartType.OPTION_NAME,
              name: 'opt',
              plugin: { type: 'module', fqcn: 'ansible.builtin.ping' },
            } as dom.OptionNamePart,
            params
          )}
        </MemoryRouter>
      );
      expect(screen.getAllByText('ansible.builtin.ping').length).toBeGreaterThan(0);
    });

    it('dispatches formatPart by type', () => {
      const textPart = parse('via switch')[0][0];
      render(<>{formatPart(textPart, params)}</>);
      expect(screen.getByText('via switch')).toBeInTheDocument();
    });
  });

  describe('renderDocLink', () => {
    it('renders external http links', () => {
      render(
        <MemoryRouter>
          {renderDocLink('Example', 'http://example.com', createParams())}
        </MemoryRouter>
      );
      expect(screen.getByRole('link', { name: 'Example' })).toHaveAttribute(
        'href',
        'http://example.com'
      );
    });

    it('renders relative documentation links from current location', () => {
      const originalHref = window.location.href;
      window.history.pushState({}, '', '/collections/published/ns/coll/contents');
      render(<MemoryRouter>{renderDocLink('Doc', 'readme', createParams())}</MemoryRouter>);
      expect(screen.getByRole('link', { name: 'Doc' })).toBeInTheDocument();
      window.history.pushState({}, '', originalHref);
    });

    it('returns null when href is missing', () => {
      const { container } = render(
        <MemoryRouter>{renderDocLink('No link', undefined, createParams())}</MemoryRouter>
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('renderPluginConfiguration', () => {
    it('renders ini, env, and var sections', () => {
      render(
        <>
          {renderPluginConfiguration({
            name: 'cfg',
            ini: [{ section: 'main', key: 'host', default: 'localhost' }],
            env: [{ name: 'ANSIBLE_HOST' }],
            vars: [{ name: 'ansible_host' }],
          } as IContentsOption)}
        </>
      );
      expect(screen.getByText('ini entries:')).toBeInTheDocument();
      expect(screen.getByText(/main/)).toBeInTheDocument();
      expect(screen.getByText(/ANSIBLE_HOST/)).toBeInTheDocument();
      expect(screen.getByText(/ansible_host/)).toBeInTheDocument();
    });
  });

  describe('renderPluginLink and formatDocPath', () => {
    it('links when module exists in groups', () => {
      render(<MemoryRouter>{renderPluginLink('hello module', createParams())}</MemoryRouter>);
      expect(screen.getByRole('link', { name: 'hello module' })).toBeInTheDocument();
    });

    it('returns plain text when module is not in groups', () => {
      const params = createParams({
        docParams: {
          repository: 'published',
          namespace: 'ns',
          name: 'coll',
          content_name: 'missing',
          content_type: 'module',
        },
      });
      render(<>{renderPluginLink('missing module', params)}</>);
      expect(screen.getByText('missing module')).toBeInTheDocument();
    });

    it('builds documentation path via getPageUrl', () => {
      const getPageUrl = vi.fn().mockReturnValue('/built/path');
      const path = formatDocPath(
        createParams({
          getPageUrl,
          docParams: {
            repository: 'published',
            namespace: 'ns',
            name: 'coll',
            content_name: 'hello',
            content_type: 'module',
          },
        })
      );
      expect(getPageUrl).toHaveBeenCalledWith(HubRoute.CollectionDocumentationContent, {
        params: { repository: 'published', namespace: 'ns', name: 'coll' },
        query: { content_type: 'module', content_name: 'hello' },
      });
      expect(path).toBe('/built/path');
    });
  });
});
