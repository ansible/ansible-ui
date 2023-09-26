import { DropdownPosition } from '@patternfly/react-core';
import { RedoIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { useGetItem } from '../../../common/crud/useGet';
import { EdaRoute } from '../../EdaRoutes';
import { API_PREFIX } from '../../constants';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { Status0E7Enum } from '../../interfaces/generated/eda-api';
import {
  useDisableRulebookActivations,
  useEnableRulebookActivations,
  useRestartRulebookActivations,
} from '../hooks/useControlRulebookActivations';
import { useDeleteRulebookActivations } from '../hooks/useDeleteRulebookActivations';

export function RulebookActivationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const { data: rulebookActivation, refresh } = useGetItem<EdaRulebookActivation>(
    `${API_PREFIX}/activations/`,
    params.id
  );

  const enableRulebookActivation = useEnableRulebookActivations((enabled) => {
    if (enabled.length > 0) {
      refresh();
    }
  });

  const disableRulebookActivation = useDisableRulebookActivations((disabled) => {
    if (disabled.length > 0) {
      refresh();
    }
  });

  const restartRulebookActivation = useRestartRulebookActivations((restarted) => {
    if (restarted.length > 0) {
      refresh();
    }
  });

  const deleteRulebookActivations = useDeleteRulebookActivations((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.RulebookActivations);
    }
  });
  const itemActions = useMemo<IPageAction<EdaRulebookActivation>[]>(() => {
    const actions: IPageAction<EdaRulebookActivation>[] = [
      {
        type: PageActionType.Switch,
        selection: PageActionSelection.Single,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable instance') : t('Click to enable instance'),
        isPinned: true,
        label: t('Rulebook activation enabled'),
        labelOff: t('Rulebook activation disabled'),
        onToggle: (activation: EdaRulebookActivation, activate: boolean) => {
          if (activate) void enableRulebookActivation([activation]);
          else void disableRulebookActivation([activation]);
        },
        isSwitchOn: (activation: EdaRulebookActivation) => activation.is_enabled ?? false,
        isDisabled: (activation: EdaRulebookActivation) =>
          activation.status === Status0E7Enum.Stopping
            ? t('Cannot change activation status while stopping')
            : undefined,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RedoIcon,
        label: t('Restart rulebook activation'),
        isDanger: false,
        isHidden: (activation: EdaRulebookActivation) => !activation.is_enabled,
        onClick: (activation: EdaRulebookActivation) => restartRulebookActivation([activation]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete rulebook activation'),
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          deleteRulebookActivations([rulebookActivation]),
        isDanger: true,
      },
    ];
    return actions;
  }, [
    enableRulebookActivation,
    disableRulebookActivation,
    restartRulebookActivation,
    deleteRulebookActivations,
    t,
  ]);

  return (
    <PageLayout>
      <PageHeader
        title={rulebookActivation?.name}
        breadcrumbs={[
          { label: t('Rulebook Activations'), to: getPageUrl(EdaRoute.RulebookActivations) },
          { label: rulebookActivation?.name },
        ]}
        headerActions={
          <PageActions<EdaRulebookActivation>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={rulebookActivation}
          />
        }
      />
      <PageRoutedTabs
        tabs={[
          { label: t('Details'), page: EdaRoute.RulebookActivationDetails },
          { label: t('History'), page: EdaRoute.RulebookActivationHistory },
        ]}
        params={{ id: params.id }}
      />
    </PageLayout>
  );
}
