import { AboutModal, TextContent, TextList, TextListItem } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialogs } from '../../framework';

export interface AnsibleAboutModalProps {
  onClose?: () => void;
}

function AnsibleAboutModal(props: AnsibleAboutModalProps) {
  const { popDialog } = usePageDialogs();
  const { t } = useTranslation();
  return (
    <AboutModal
      isOpen
      onClose={() => {
        popDialog();
        props.onClose?.();
      }}
      trademark={t(`Copyright {{fullYear}} Red Hat, Inc.`, { fullYear: new Date().getFullYear() })}
      brandImageSrc="/static/media/brand-logo.svg"
      brandImageAlt={t('Brand Logo')}
      productName={process.env.PRODUCT ?? t('AWX')}
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
  const { popDialog, pushDialog } = usePageDialogs();
  const [props, setProps] = useState<AnsibleAboutModalProps>();
  useEffect(() => {
    if (props) {
      const onCloseHandler = () => {
        setProps(undefined);
        props.onClose?.();
      };
      pushDialog(<AnsibleAboutModal {...props} onClose={onCloseHandler} />);
    } else {
      popDialog();
    }
  }, [props, pushDialog, popDialog]);
  return setProps;
}
