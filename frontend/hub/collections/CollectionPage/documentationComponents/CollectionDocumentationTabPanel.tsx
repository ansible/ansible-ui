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

export function CollectionDocumentationTabPanel(props: {
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  content: IContents | undefined;
  setContent: Dispatch<SetStateAction<IContents | undefined>>;
  groups: {
    name: string;
    contents: IContents[];
  }[];
}) {
  const { content, setContent, groups, setDrawerOpen } = props;
  const { t } = useTranslation();
  return (
    <DrawerPanelContent>
      <DrawerHead style={{ gap: 16 }}>
        <SearchInput placeholder={t('Find content')} />
        <DrawerActions style={{ alignSelf: 'center' }}>
          <DrawerCloseButton onClick={() => setDrawerOpen(false)} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ borderTop: 'thin solid var(--pf-v5-global--BorderColor--100)' }}>
        <Nav theme="light">
          <NavList>
            <NavExpandable key="documentation" title={t('Documentation')} isExpanded>
              <NavItem key="readme">{t('Readme')}</NavItem>
            </NavExpandable>
            {groups.map((group) => (
              <NavExpandable
                key={group.name}
                title={group.name}
                isExpanded
                isActive={group.contents.find((c) => c === content) !== undefined}
              >
                {group.contents.map((c) => (
                  <NavItem
                    key={c.content_name}
                    onClick={() => setContent(c)}
                    isActive={c === content}
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
