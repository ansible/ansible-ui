import {
  AboutModal,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { TFunction } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { usePageDialog } from '../../framework';

export interface AnsibleAboutModalProps {
  brandImageSrc: string;
  versionInfo?: ProductVersionInfo;
  userInfo?: string;
  onClose?: () => void;
}

type ProductVersionInfo = Record<string, string | Record<string, string>>;

const StyledDescriptionListDescription = styled(DescriptionListDescription)`
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
      brandImageSrc={props.brandImageSrc}
      brandImageAlt={t('Brand Logo')}
      productName={upstreamServices(process.env.PRODUCT, t) ?? t('AWX')}
    >
      <DescriptionList isHorizontal>
        {Object.entries(props.versionInfo ?? {})
          .filter(
            ([product]) =>
              product !== 'galaxy_ng_commit' &&
              product !== 'ha' &&
              product !== 'instances' &&
              product !== 'instance_groups' &&
              product !== 'time_zone' &&
              product !== 'deployment_type'
          )
          .map(([product, info]) => (
            <DescriptionListGroup key={product}>
              <DescriptionListTerm>{translateVersion(product, t)}</DescriptionListTerm>
              {typeof info === 'string' ? (
                <DescriptionListDescription>{info}</DescriptionListDescription>
              ) : (
                Object.entries(info).map(([key, value]) => (
                  <React.Fragment key={key}>
                    {
                      <StyledDescriptionListDescription>
                        {t(value)}
                      </StyledDescriptionListDescription>
                    }
                  </React.Fragment>
                ))
              )}
            </DescriptionListGroup>
          ))}
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Username')}</DescriptionListTerm>
          <DescriptionListDescription>{props.userInfo}</DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
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
    node: t`Node`,
    node_type: t`Node type`,
    uuid: t`UUID`,
    heartbeat: t`Heartbeat`,
    capacity: t`Capacity`,
    name: t`Name`,
  };

  return VERSION_NAMES[name as string] || name;
}

export function upstreamServices(name: string | undefined, t: TFunction) {
  const SERVICE_NAMES: Record<string, string> = {
    'Automation Hub': t`Ansible Galaxy`,
    AWX: t`AWX`,
    'Event Driven Automation': t`EDA Server`,
  };

  return SERVICE_NAMES[name as string] || name;
}
