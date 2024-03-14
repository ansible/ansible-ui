import { AboutModal, TextContent, TextList, TextListItem } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../framework';

export interface AnsibleAboutModalProps {
  versionInfo?: ProductVersionInfo;
  onClose?: () => void;
}
type ProductVersionInfo = Record<string, string | Record<string, string>>;

export function AnsibleAboutModal(props: AnsibleAboutModalProps) {
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
      brandImageSrc="/static/media/brand-logo.svg"
      brandImageAlt={t('Brand Logo')}
      productName={process.env.PRODUCT ?? t('AWX')}
    >
      <TextContent>
        <TextList component="dl">
          {Object.entries(props.versionInfo ?? {}).map(([product, info]) => {
            return (
              <TextListItem key={product} component="dt">
                {t(product)}
                <TextList component="dd">
                  {typeof info === 'string'
                    ? info
                    : Object.entries(info).map(([key, value]) => (
                        <TextListItem key={key} component="dt">
                          {t(value)}
                        </TextListItem>
                      ))}
                </TextList>
              </TextListItem>
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
