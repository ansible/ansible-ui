import { AboutModal, TextContent, TextList, TextListItem } from '@patternfly/react-core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../framework';
import { useEdaProductVersionInfo } from '../eda/main/useEdaProductVersionInfo';
import { useAwxProductVersionInfo } from '../awx/main/useAwxProductVersionInfo';
import { useHubProductVersionInfo } from '../hub/main/useHubProductVersionInfo';

export interface AnsibleAboutModalProps {
  versionInfo?: ProductVersionInfo;
  onClose?: () => void;
}
type ProductVersionInfo = Record<string, string | Record<string, string>>;

export function usePlatformProductVersionInfo() {
  const [productVersionInfo, setProductVersionInfo] = useState<ProductVersionInfo>();
  const awx = useAwxProductVersionInfo();
  const eda = useEdaProductVersionInfo();
  const hub = useHubProductVersionInfo();
  const platform = useMemo(() => {
    return {
      awx,
      eda,
      hub,
    };
  }, [awx, eda, hub]);

  return productVersionInfo;
}

export function PlatformAboutModal(props: { onClose?: () => void }) {
  const [_dialog, setDialog] = usePageDialog();
  const platform = usePlatformProductVersionInfo();
  return (
    <AnsibleAboutModal
      versionInfo={platform}
      onClose={() => {
        setDialog(undefined);
        props.onClose?.();
      }}
    />
  );
}

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
          {Object.entries(versionInfo ?? {}).map(([product, info]) => {
            return (
              <TextListItem key={product} component="dt">
                {t(product)}
                <TextList component="dd">
                  {typeof info === 'string'
                    ? info
                    : Object.entries(info).map(([key, value]) => (
                        <TextListItem key={key} component="dt">
                          {t(key)}
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
