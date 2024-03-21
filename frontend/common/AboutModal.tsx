import { AboutModal, TextContent, TextList, TextListItem } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../framework';
import { TFunction } from 'i18next';
import styled from 'styled-components';

export interface AnsibleAboutModalProps {
  versionInfo?: ProductVersionInfo;
  onClose?: () => void;
}

type ProductVersionInfo = Record<string, string | Record<string, string>>;

const ListItemDiv = styled.div`
  font-weight: normal;
`;

export function AnsibleAboutModal(props: AnsibleAboutModalProps) {
  const { t } = useTranslation();
  const [_dialog, setDialog] = usePageDialog();
  return (
    <AboutModal
      isOpen
      onClose={() => {
        setDialog(undefined);
        props.onClose?.();
      }}
      trademark={t(`Copyright {{fullYear}} Red Hat, Inc.`, { fullYear: new Date().getFullYear() })}
      brandImageSrc={
        process.env.PRODUCT === 'Automation Hub'
          ? '/static/media/galaxy-logo-ansibull.png'
          : process.env.PRODUCT === 'EDA Server'
            ? '/static/media/eda-icon.svg'
            : '/static/media/awx-logo.svg'
      }
      brandImageAlt={t('Brand Logo')}
      backgroundImageSrc="/static/media/ansible-brand.svg"
      productName={process.env.PRODUCT ?? t('AWX')}
    >
      <TextContent>
        <TextList component="dl">
          {Object.entries(props.versionInfo ?? {})
            .filter(([product]) => product !== 'galaxy_ng_commit' && product !== 'ha')
            .map(([product, info]) => {
              return (
                <>
                  <TextListItem key={t(product)} component="dt">
                    {translateVersion(product, t)}
                  </TextListItem>
                  <TextList component="dl">
                    {typeof info === 'string'
                      ? info
                      : Object.entries(info).map(([key, value]) => {
                          return typeof value === 'object' ? (
                            <TextListItem key={key} component="dt">
                              {Object.entries(value).map(([foo, bar]) => (
                                <TextList component="dl" key={foo}>
                                  <TextListItem component="dt">{foo}</TextListItem>
                                  <TextListItem component="dd">{bar as string}</TextListItem>
                                </TextList>
                              ))}
                            </TextListItem>
                          ) : (
                            <TextListItem key={key} component="dt">
                              <ListItemDiv>{t(value)}</ListItemDiv>
                            </TextListItem>
                          );
                        })}
                  </TextList>
                </>
              );
            })}
        </TextList>
      </TextContent>
    </AboutModal>
  );
}

export function useAnsibleAboutModal() {
  const [_, setDialog] = usePageDialog();
  const [props, setProps] = useState<AnsibleAboutModalProps>();
  useEffect(() => {
    if (props) {
      const onCloseHandler = () => {
        setProps(undefined);
        props.onClose?.();
      };
      setDialog(<AnsibleAboutModal {...props} onClose={onCloseHandler} />);
    } else {
      setDialog(undefined);
    }
  }, [props, setDialog]);
  return setProps;
}

export function translateVersion(name: string | undefined, t: TFunction) {
  const VERSION_NAMES: Record<string, string> = {
    server_version: t`Server Version`,
    galaxy_ng_version: t`Galaxy NG version`,
    galaxy_importer_version: t`Galaxy Importer Version`,
    pulp_core_version: t`Pulp Core version`,
    pulp_ansible_version: t`Pulp Ansible Version`,
    pulp_container_version: t`Pulp Container Version`,
    version: t`Version`,
    active_node: t`Active Node`,
    install_uuid: t`Install UUID`,
    instances: t`Instances`,
    instance_groups: t`Instance Groups`,
    available_versions: t`Available Versions`,
  };

  return VERSION_NAMES[name as string] || name;
}
