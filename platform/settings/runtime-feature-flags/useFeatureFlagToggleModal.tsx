import { TextCell, useBulkConfirmation } from '@ansible/ansible-ui-framework';
import { requestPatch } from '@ansible/common-ui/crud/Data';
import { Label } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { IFeatureFlag } from './IFeatureFlag';

export function useFeatureFlagToggleModal() {
  const { t } = useTranslation();
  const bulkConfirmation = useBulkConfirmation<IFeatureFlag>();

  const confirmationColumns = useMemo(
    () => [
      {
        header: t('Name'),
        cell: (flag: IFeatureFlag) => <TextCell text={flag.ui_name} />,
      },
      {
        header: t('Support level'),
        cell: (flag: IFeatureFlag) => {
          const label =
            flag.support_level === 'TECHNOLOGY_PREVIEW'
              ? t('Technology preview')
              : t('Developer preview');
          const color = flag.support_level === 'TECHNOLOGY_PREVIEW' ? 'orange' : 'red';
          return <Label color={color}>{label}</Label>;
        },
      },
    ],
    [t]
  );

  const actionColumns = useMemo(
    () => [
      {
        header: t('Name'),
        cell: (flag: IFeatureFlag) => <TextCell text={flag.ui_name} />,
      },
    ],
    [t]
  );

  return useCallback(
    (options: { flag: IFeatureFlag; enable: boolean; onComplete: () => void }) => {
      const { flag, enable, onComplete } = options;
      const isTechPreview = flag.support_level === 'TECHNOLOGY_PREVIEW';
      const previewType = isTechPreview ? t('technology preview') : t('developer preview');

      const title = enable
        ? t('Enable {{previewType}} feature flag?', { previewType })
        : t('Disable feature flag?');
      const actionButtonText = enable ? t('Enable feature flag') : t('Disable feature flag');

      let prompt: React.ReactNode;
      if (!enable) {
        prompt = (
          <span>
            {t(
              'Are you sure you want to disable the feature flag below? This will disable the feature flag for your platform.'
            )}
          </span>
        );
      } else if (isTechPreview) {
        prompt = (
          <span>
            {t(
              'Are you sure you want to enable this feature flag? This feature flag is a technology preview meaning that it is not fully supported by Red Hat. To learn more, visit'
            )}{' '}
            <a
              href="https://access.redhat.com/support/offerings/techpreview"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("Red Hat's Technology Preview statement")}
            </a>
            {'.'}
          </span>
        );
      } else {
        prompt = (
          <span>
            {t(
              'Are you sure you want to enable this feature flag? This feature flag is a developer preview meaning that it is not fully supported by Red Hat. To learn more, visit'
            )}{' '}
            <a
              href="https://access.redhat.com/support/offerings/devpreview"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("Red Hat's Developer Preview statement")}
            </a>
            {'.'}
          </span>
        );
      }

      bulkConfirmation({
        title,
        prompt,
        confirmText: enable
          ? t('Yes, I confirm that I want to enable this feature flag.')
          : t('Yes, I confirm that I want to disable this feature flag.'),
        actionButtonText,
        items: [flag],
        keyFn: (flag) => flag.id,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (flag: IFeatureFlag) =>
          requestPatch(gatewayAPI`/feature_flags/${flag.id.toString()}/`, {
            value: enable ? 'True' : 'False',
          }),
      });
    },
    [t, bulkConfirmation, confirmationColumns, actionColumns]
  );
}
