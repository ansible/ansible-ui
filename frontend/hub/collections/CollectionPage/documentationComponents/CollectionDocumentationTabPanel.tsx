import { useTranslation } from 'react-i18next';
import React, { Dispatch, SetStateAction } from 'react';
import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  SearchInput,
} from '@patternfly/react-core';
import { IContents } from '../../Collection';
import { useParams, useSearchParams } from 'react-router-dom';
import { HubRoute } from '../../../main/HubRoutes';
import { usePageNavigate } from '../../../../../framework';

export function CollectionDocumentationTabPanel(props: {
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setSearchText: Dispatch<SetStateAction<string>>;
  searchText: string;
  groups: {
    name: string;
    contents: IContents[];
  }[];
  docs: { name: string; label: string }[];
}) {
  const { groups, setDrawerOpen, setSearchText, docs } = props;
  const [searchParams] = useSearchParams();
  const navigate = usePageNavigate();
  const params = useParams();

  const query = Object.fromEntries(searchParams.entries());
  const { repository, namespace, name, content_name, content_type } = params;

  const { t } = useTranslation();
  return (
    <DrawerPanelContent>
      <DrawerHead style={{ gap: 16 }}>
        <SearchInput
          placeholder={t('Find content')}
          onChange={(event, value) => setSearchText(value)}
        />
        <DrawerActions style={{ alignSelf: 'center' }}>
          <DrawerCloseButton onClick={() => setDrawerOpen(false)} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ borderTop: 'thin solid var(--pf-v5-global--BorderColor--100)' }}>
        <Nav theme="light">
          <NavList>
            <NavExpandable
              key="documentation"
              title={t('Documentation ({{docs}})', { docs: docs.length })}
              isExpanded
            >
              {docs.length > 0 &&
                docs.map(({ name: docName, label }) => (
                  <NavItem
                    key={docName}
                    onClick={() =>
                      navigate(HubRoute.CollectionDocumentation, {
                        query,
                        params: {
                          repository,
                          namespace,
                          content_name: docName === 'readme' ? '' : docName,
                          name,
                        },
                      })
                    }
                  >
                    {label}
                  </NavItem>
                ))}
            </NavExpandable>
            {groups.map((group) => (
              <NavExpandable
                key={group.name}
                title={group.name + '(' + group.contents.length + ')'}
                isExpanded
                isActive={
                  group.contents.find(
                    (c) => c.content_name === content_name && c.content_type === content_type
                  ) !== undefined
                }
              >
                {group.contents.map((c) => (
                  <NavItem
                    key={c.content_name}
                    onClick={() => {
                      navigate(HubRoute.CollectionDocumentationContent, {
                        query,
                        params: {
                          repository,
                          namespace,
                          name,
                          content_type: c.content_type,
                          content_name: c.content_name,
                        },
                      });
                    }}
                    isActive={c.content_name === content_name && c.content_type === 'content_type'}
                  >
                    {c.content_name}
                  </NavItem>
                ))}
                <br />
              </NavExpandable>
            ))}
          </NavList>
        </Nav>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
}
