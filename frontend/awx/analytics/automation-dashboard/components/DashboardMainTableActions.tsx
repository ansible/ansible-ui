import { IAutomationDashboardMainTableActions, ReportType } from '../types';
import {
  IPageAction,
  PageActions,
  PageActionSelection,
  PageActionType,
  useBreakpoint,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant, Spinner } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Component, useState } from 'react';

// PageActions only accepts ComponentClass icons, so the export spinner is a class component
class ExportSpinnerIcon extends Component {
  render() {
    return <Spinner isInline />;
  }
}

export function DashboardMainTableActions(props: Readonly<IAutomationDashboardMainTableActions>) {
  const { t } = useTranslation();
  const {
    title,
    icon: Icon,
    onExport,
    exportDisabledReason,
    canSetTemplateValues,
    setTemplateValuesDisabledReason,
    onSetTemplateValues,
  } = props;
  const [inProgress, setInProgress] = useState<boolean>(false);
  // Same breakpoint at which the actions collapse into the kebab
  const isWide = useBreakpoint('md');

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

  // Disable the export via the action instead of swapping components, so the
  // "Set template values" action stays in place while loading or exporting
  const getExportDisabledReason = () =>
    inProgress ? t('Export in progress') : exportDisabledReason;

  const setTemplateValuesAction: IPageAction<object> = {
    type: PageActionType.Button,
    variant: ButtonVariant.secondary,
    label: t('Set template values'),
    selection: PageActionSelection.None,
    onClick: () => onSetTemplateValues?.(),
    isPinned: true,
    isHidden: () => !canSetTemplateValues,
    isDisabled: setTemplateValuesDisabledReason,
  };

  const exportItem = (
    label: string,
    reportType: ReportType,
    isDisabled?: () => string | undefined
  ): IPageAction<object> => ({
    type: PageActionType.Button,
    selection: PageActionSelection.None,
    label,
    isDisabled,
    onClick: () => {
      void handleExport(reportType);
    },
  });

  const exportItems = [
    exportItem(t('Summary'), 'summary'),
    exportItem(t('ROI'), 'roi'),
    exportItem(t('Trends'), 'trends'),
  ];

  // In the kebab a nested dropdown would lose its icon (spinner) and disabled tooltip,
  // so the reports are listed directly there instead
  const actions: IPageAction<object>[] = isWide
    ? [
        setTemplateValuesAction,
        {
          type: PageActionType.Dropdown,
          icon: inProgress ? ExportSpinnerIcon : Icon,
          variant: ButtonVariant.primary,
          isPinned: true,
          selection: PageActionSelection.None,
          label: title,
          isDisabled: getExportDisabledReason,
          actions: exportItems,
        },
      ]
    : [
        setTemplateValuesAction,
        { type: PageActionType.Seperator },
        // Without the parent dropdown, each report carries the export's disabled reason
        exportItem(t('{{title}}: Summary', { title }), 'summary', getExportDisabledReason),
        exportItem(t('{{title}}: ROI', { title }), 'roi', getExportDisabledReason),
        exportItem(t('{{title}}: Trends', { title }), 'trends', getExportDisabledReason),
      ];

  return <PageActions actions={actions} collapse={isWide ? 'never' : 'always'} />;
}
