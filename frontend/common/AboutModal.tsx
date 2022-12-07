import { AboutModal, TextContent, TextList, TextListItem } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../framework';

export interface AnsibleAboutModalProps {
  onClose?: () => void;
}

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
      trademark="Trademark and copyright information here"
      brandImageSrc="Ansible.svg"
      brandImageAlt="Ansible Logo"
      productName="Ansible Automation Platform"
    >
      <TextContent>
        <TextList component="dl">
          <TextListItem component="dt">{t('Version')}</TextListItem>
          <TextListItem component="dd">{process.env.VERSION}</TextListItem>
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
