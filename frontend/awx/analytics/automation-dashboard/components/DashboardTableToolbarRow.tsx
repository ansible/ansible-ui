import { Flex, FlexItem, Switch } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { DashboardTableInputField } from './DashboardTableInputField';
import { DashboardTableToolbarProps, ISubscriptionCosts } from '../types';
import { usePageAlertToaster } from '../../../../../framework';
import { useRef, useState } from 'react';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { usePutRequest } from '../../../../common/crud/usePutRequest';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { useSerializedSave } from '../views/useSerializedSave';

const SWITCH_ID = 'switch-time-taken-automation';

export function DashboardTableToolbarRow(props: DashboardTableToolbarProps) {
  const { costState, setCostState, refresh } = props;
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const putRequest = usePutRequest<ISubscriptionCosts, ISubscriptionCosts>();
  const { activeAwxUser } = useAwxActiveUser();
  const [errors, setErrors] = useState<Partial<Record<keyof ISubscriptionCosts, string>> | null>(
    null
  );

  const controlsDisabled = !costState || !activeAwxUser?.is_superuser;

  // Local edits not yet confirmed by the server. Every PUT is built on top of
  // them, so a quick edit of another field cannot resend a stale value. The ref
  // is read synchronously by the change handler; the state drives the switch.
  const unsavedCostStateRef = useRef<ISubscriptionCosts | undefined>(undefined);
  const [unsavedCostState, setUnsavedCostState] = useState<ISubscriptionCosts | undefined>(
    undefined
  );
  const updateUnsavedCostState = (value: ISubscriptionCosts | undefined) => {
    unsavedCostStateRef.current = value;
    setUnsavedCostState(value);
  };

  const enqueueSave = useSerializedSave<ISubscriptionCosts, ISubscriptionCosts>({
    save: (updatedCostState) =>
      putRequest(
        metricsAPI`/dashboard_reports/subscription_costs/${updatedCostState.id}/`,
        updatedCostState
      ),
    onSuccess: async (savedState) => {
      updateUnsavedCostState(undefined);
      if (setCostState) {
        setCostState(savedState);
      }

      // PUT succeeded — show success before attempting the refresh.
      alertToaster.addAlert({
        variant: 'success',
        title: t('Subscription costs updated successfully.'),
        timeout: 5000,
      });

      // Refresh: a failure here does not undo the save.
      try {
        await refresh();
      } catch {
        alertToaster.addAlert({
          variant: 'warning',
          title: t('Update saved but failed to refresh view.'),
          timeout: 5000,
        });
      }
    },
    onError: (err) => {
      updateUnsavedCostState(undefined);
      const { genericErrors, fieldErrors } = awxErrorAdapter(err);
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to update subscription costs.'),
        children: (
          <>
            {genericErrors.map((e) => (
              <div key={String(e.message)}>{e.message}</div>
            ))}
          </>
        ),
        timeout: 5000,
      });

      setErrors(
        fieldErrors.reduce<Partial<Record<keyof ISubscriptionCosts, string>>>(
          (acc, e) => ({ ...acc, [e.name]: String(e.message) }),
          {}
        )
      );
    },
  });

  const toolbarChangeHandler = <K extends keyof ISubscriptionCosts>(
    value: ISubscriptionCosts[K],
    key: K
  ): void => {
    const baseCostState = unsavedCostStateRef.current ?? costState;
    if (controlsDisabled || !baseCostState) {
      return;
    }

    const updatedCostState: ISubscriptionCosts = { ...baseCostState, [key]: value };
    updateUnsavedCostState(updatedCostState);
    setErrors(null);
    enqueueSave(updatedCostState.id, updatedCostState);
  };

  return (
    <Flex
      style={{
        paddingBottom: 'var(--pf-t--global--spacer--action--horizontal--default)',
      }}
      direction={{ default: 'row' }}
      rowGap={{ default: 'rowGapMd' }}
      columnGap={{ default: 'columnGapMd' }}
    >
      <FlexItem>
        <DashboardTableInputField
          label={t('Hourly rate for manually running the job ({{currency}})', {
            currency: '$',
          })}
          labelHelp={t(
            'The hourly labor cost used to estimate what it would cost to run these jobs manually. Used to calculate manual cost and savings in the table below.'
          )}
          id="engineer_avg_hourly_rate"
          value={costState?.engineer_avg_hourly_rate}
          min={1}
          max={1000}
          onChange={(value) => {
            toolbarChangeHandler(value, 'engineer_avg_hourly_rate');
          }}
          readOnly={controlsDisabled}
          error={errors?.engineer_avg_hourly_rate}
        />
      </FlexItem>
      <FlexItem>
        <DashboardTableInputField
          label={t('Monthly AAP cost ({{currency}})', { currency: '$' })}
          labelHelp={t(
            'Monthly cost of running the Ansible Automation Platform. This value includes license, labor and infrastructure costs to run AAP. It is used to calculate the automation savings'
          )}
          id="monthly_subscription_cost"
          value={costState?.monthly_subscription_cost}
          min={1}
          max={1000000}
          onChange={(value) => {
            toolbarChangeHandler(value, 'monthly_subscription_cost');
          }}
          readOnly={controlsDisabled}
          error={errors?.monthly_subscription_cost}
        />
      </FlexItem>
      <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
        <Switch
          id={SWITCH_ID + '-toggle'}
          data-testid={SWITCH_ID + '-toggle'}
          label={t('Include time taken to create automation into calculation')}
          isChecked={
            (unsavedCostState ?? costState)?.include_template_creation_time_in_costs === true
          }
          onChange={(_e, value) => {
            toolbarChangeHandler(value, 'include_template_creation_time_in_costs');
          }}
          hasCheckIcon
          isDisabled={controlsDisabled}
        />
      </FlexItem>
    </Flex>
  );
}
