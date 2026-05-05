import { Button, Flex, FlexItem, Switch } from '@patternfly/react-core';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { useTranslation } from 'react-i18next';
import { DashboardTableInputField } from './DashboardTableInputField';
import { DashboardTableToolbarProps, ISubscriptionCosts } from '../types';
import { usePageAlertToaster } from '../../../../../framework';
import { useState } from 'react';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { usePutRequest } from '../../../../common/crud/usePutRequest';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';

const SWITCH_ID = 'switch-time-taken-automation';

export function DashboardTableToolbarRow(props: DashboardTableToolbarProps) {
  const { costState, isLoading, itemCount, setCostState, refresh, onExportCsv } = props;
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const putRequest = usePutRequest<ISubscriptionCosts, ISubscriptionCosts>();
  const { activeAwxUser } = useAwxActiveUser();
  const [errors, setErrors] = useState<Partial<Record<keyof ISubscriptionCosts, string>> | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const controlsDisabled = isLoading || isSubmitting || !costState || !activeAwxUser?.is_superuser;

  const toolbarChangeHandler = async <K extends keyof ISubscriptionCosts>(
    value: ISubscriptionCosts[K],
    key: K
  ): Promise<void> => {
    if (controlsDisabled) {
      return;
    }

    const updatedCostState = {
      ...costState,
      [key]: value,
    } as ISubscriptionCosts;
    setIsSubmitting(true);
    setErrors(null);
    try {
      // Save: report failure only when the PUT itself rejects.
      const id = costState.id;
      try {
        const savedState = await putRequest(
          metricsAPI`/dashboard_reports/subscription_costs/${id}/`,
          updatedCostState
        );
        if (setCostState) {
          setCostState(savedState);
        }
      } catch (err) {
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
        return;
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex
      style={{ paddingTop: '1rem', paddingBottom: '1rem' }}
      direction={{ default: 'row' }}
      alignItems={{ default: 'alignItemsCenter' }}
    >
      <FlexItem>
        <DashboardTableInputField
          label={t('Hourly rate for manually running the job ({{currency}})', { currency: '$' })}
          labelHelp={t(
            'The hourly labor cost used to estimate what it would cost to run these jobs manually. Used to calculate manual cost and savings in the table below.'
          )}
          id="engineer_avg_hourly_rate"
          value={costState?.engineer_avg_hourly_rate}
          min={1}
          max={1000000}
          onChange={(value) => {
            void toolbarChangeHandler(value, 'engineer_avg_hourly_rate');
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
            void toolbarChangeHandler(value, 'monthly_subscription_cost');
          }}
          readOnly={controlsDisabled}
          error={errors?.monthly_subscription_cost}
        />
      </FlexItem>
      <FlexItem>
        <PageFormGroup
          fieldId={SWITCH_ID}
          data-testid={SWITCH_ID + '-form-group'}
          label={t('Include time taken to create automation into calculation')}
        >
          <Switch
            id={SWITCH_ID + '-toggle'}
            data-testid={SWITCH_ID + '-toggle'}
            aria-label={t('Include time taken to create automation into calculation')}
            isChecked={costState?.include_template_creation_time_in_costs === true}
            onChange={(_e, value) => {
              void toolbarChangeHandler(value, 'include_template_creation_time_in_costs');
            }}
            isDisabled={controlsDisabled}
          />
        </PageFormGroup>
      </FlexItem>
      <FlexItem style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}>
        <Button
          id="btn-export-csv"
          data-testid="btn-export-csv"
          variant="secondary"
          onClick={onExportCsv}
          // TODO: Remove `|| true` once CSV export is implemented on the BE.
          isDisabled={controlsDisabled || (itemCount ?? 0) === 0 || !onExportCsv || true}
        >
          {t('Export as CSV')}
        </Button>
      </FlexItem>
    </Flex>
  );
}
