import { IAutomationDashboardExportButton, ReportType } from '../types';
import {
  IPageAction,
  PageActions,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export function DashboardExportButton(props: Readonly<IAutomationDashboardExportButton>) {
  const { t } = useTranslation();
  const { exportType, title, icon: Icon, onExport, isDisabled } = props;
  const [inProgress, setInProgress] = useState<boolean>(false);

  const handleExport = async (reportType: ReportType) => {
    setInProgress(true);
    try {
      await onExport(reportType);
    } catch {
      // onExport handles its own error display
    } finally {
      setInProgress(false);
    }
  };

  const actions: IPageAction<object>[] = [
    {
      type: PageActionType.Dropdown,
      icon: Icon,
      variant: ButtonVariant.primary,
      isPinned: true,
      selection: PageActionSelection.None,
      label: title,
      actions: [
        {
          type: PageActionType.Button,
          selection: PageActionSelection.None,
          label: t('Summary'),
          onClick: () => {
            void handleExport('summary');
          },
        },
        {
          type: PageActionType.Button,
          selection: PageActionSelection.None,
          label: t('ROI'),
          onClick: () => {
            void handleExport('roi');
          },
        },
        {
          type: PageActionType.Button,
          selection: PageActionSelection.None,
          label: t('Trends'),
          onClick: () => {
            void handleExport('trends');
          },
        },
      ],
    },
  ];

  if (isDisabled || inProgress) {
    return (
      <Button
        id={`dashboard-export-button-${exportType}`}
        data-testid={`dashboard-export-button-${exportType}`}
        icon={<Icon />}
        isDisabled={true}
        variant="primary"
        onClick={undefined}
        isLoading={inProgress}
      >
        {title}
      </Button>
    );
  }
  return <PageActions actions={actions} />;
}
