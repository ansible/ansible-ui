import { ExpandableSection } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageFormSection } from './Utils/PageFormSection';

interface IPageFormExpandableSectionProps {
  children: React.ReactNode;
  singleColumn?: boolean;
}
export function PageFormExpandableSection(props: IPageFormExpandableSectionProps) {
  const { children, singleColumn = false } = props;
  const { t } = useTranslation();

  return (
    <PageFormSection singleColumn={singleColumn}>
      <ExpandableSection
        data-cy={'expandable-section'}
        toggleTextExpanded={t`Hide advanced options`}
        toggleTextCollapsed={t`Show advanced options`}
      >
        <PageFormSection>{children}</PageFormSection>
      </ExpandableSection>
    </PageFormSection>
  );
}
