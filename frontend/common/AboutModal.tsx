import { usePageDialog } from '@ansible/ansible-ui-framework';
import { AboutModal, Content } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface AnsibleAboutModalProps {
  brandImageSrc: string;
  onClose?: () => void;
}

// this is the about modal for the ansible ui
function AnsibleAboutModal(props: AnsibleAboutModalProps) {
  const [_dialog, setDialog] = usePageDialog();
  const { t } = useTranslation();
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
      productName={process.env.PRODUCT ?? t('AWX')}
    >
      <Content>
        <Content component="dl">
          <Content component="dt">{t('Version')}</Content>
          <Content component="dd">{process.env.VERSION}</Content>
        </Content>
      </Content>
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
