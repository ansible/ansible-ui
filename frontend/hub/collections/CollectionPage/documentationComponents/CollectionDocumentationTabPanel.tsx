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
import { useSearchParams } from 'react-router-dom';

export function CollectionDocumentationTabPanel(props: {
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setSearchText: Dispatch<SetStateAction<string>>;
  groups: {
    name: string;
    contents: IContents[];
  }[];
}) {
  const { groups, setDrawerOpen, setSearchText } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  const content_name = searchParams.get('content_name');
  const content_type = searchParams.get('content_type');

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
            <NavExpandable key="documentation" title={t('Documentation')} isExpanded>
              <NavItem
                key="readme"
                onClick={() => {
                  setSearchParams((params) => {
                    params.set('content_type', 'docs');
                    params.set('content_name', '');
                    return params;
                  });
                }}
              >
                {t('Readme')}
              </NavItem>
            </NavExpandable>
            {groups.map((group) => (
              <NavExpandable
                key={group.name}
                title={group.name}
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
                      setSearchParams((params) => {
                        params.set('content_type', c.content_type);
                        params.set('content_name', c.content_name);
                        return params;
                      });
                    }}
                    isActive={c.content_name === content_name && c.content_type === 'content_type'}
                  >
                    {c.content_name}
                  </NavItem>
                ))}
              </NavExpandable>
            ))}
          </NavList>
        </Nav>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
}
