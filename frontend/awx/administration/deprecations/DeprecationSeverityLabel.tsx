import { Severity, SeverityType } from '@patternfly/react-component-groups/dist/dynamic/Severity';
import { useTranslation } from 'react-i18next';

export type DeprecationSeverity = 'hot' | 'warm' | 'moderate' | 'cool';

export function SeverityLabel({ severity }: { severity: DeprecationSeverity }) {
  const { t } = useTranslation();

  const severityMap: Record<DeprecationSeverity, { type: SeverityType; label: string }> = {
    hot: { type: SeverityType.critical, label: t('Critical') },
    warm: { type: SeverityType.important, label: t('Important') },
    moderate: { type: SeverityType.moderate, label: t('Moderate') },
    cool: { type: SeverityType.minor, label: t('Minor') },
  };

  const { type, label } = severityMap[severity];
  return <Severity severity={type} label={label} />;
}
