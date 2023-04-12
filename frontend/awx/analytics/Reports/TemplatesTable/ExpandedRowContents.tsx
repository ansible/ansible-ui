import React, { FunctionComponent } from 'react';
import { ExpandableRowContent, Td } from '@patternfly/react-table';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import currencyFormatter from '../../utilities/currencyFormatter';
import { useTranslation } from 'react-i18next';
import { ChartLegendEntry } from 'react-json-chart-builder';

interface Props {
  template: ChartLegendEntry;
}

const ExpandedRowContents: FunctionComponent<Props> = ({ template }) => {
  const { t } = useTranslation();
  return (
    <Td colSpan={5}>
      <ExpandableRowContent>
        <DescriptionList columnModifier={{ default: '3Col' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Elapsed')}</DescriptionListTerm>
            <DescriptionListDescription>
              {t(`${template.elapsed} seconds`)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Host count')}</DescriptionListTerm>
            <DescriptionListDescription>{template.host_count}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Total count')}</DescriptionListTerm>
            <DescriptionListDescription>{template.total_count}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Total org count')}</DescriptionListTerm>
            <DescriptionListDescription>{template.total_org_count}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Total cluster count')}</DescriptionListTerm>
            <DescriptionListDescription>{template.total_cluster_count}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Total inventory count')}</DescriptionListTerm>
            <DescriptionListDescription>
              {template.total_inventory_count}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Template success rate')}</DescriptionListTerm>
            <DescriptionListDescription>
              {parseInt(template.template_success_rate.toString()).toFixed(2)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Savings from successful hosts')}</DescriptionListTerm>
            <DescriptionListDescription>
              {currencyFormatter(parseInt(template.successful_hosts_savings.toString()))}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Costs from failed hosts')}</DescriptionListTerm>
            <DescriptionListDescription>
              {currencyFormatter(parseInt(template.failed_hosts_costs.toString()))}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Monetary gain')}</DescriptionListTerm>
            <DescriptionListDescription>
              {template?.monetary_gain
                ? currencyFormatter(parseInt(template.monetary_gain.toString()))
                : ''}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </ExpandableRowContent>
    </Td>
  );
};

export default ExpandedRowContents;
