import React, { FunctionComponent } from 'react';
import { ExpandableRowContent, Td } from '@patternfly/react-table';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { Template } from './types';
import currencyFormatter from '../../utilities/currencyFormatter';

interface Props {
  template: Template;
}

const ExpandedRowContents: FunctionComponent<Props> = ({ template }) => (
  <Td colSpan={5}>
    <ExpandableRowContent>
      <DescriptionList columnModifier={{ default: '3Col' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>Elapsed</DescriptionListTerm>
          <DescriptionListDescription>
            {template.elapsed} seconds
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Host count</DescriptionListTerm>
          <DescriptionListDescription>
            {template.host_count}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Total count</DescriptionListTerm>
          <DescriptionListDescription>
            {template.total_count}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Total org count</DescriptionListTerm>
          <DescriptionListDescription>
            {template.total_org_count}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Total cluster count</DescriptionListTerm>
          <DescriptionListDescription>
            {template.total_cluster_count}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Total inventory count</DescriptionListTerm>
          <DescriptionListDescription>
            {template.total_inventory_count}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Template success rate</DescriptionListTerm>
          <DescriptionListDescription>
            {template.template_success_rate.toFixed(2)}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>
            Savings from successful hosts
          </DescriptionListTerm>
          <DescriptionListDescription>
            {currencyFormatter(template.successful_hosts_savings)}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Costs from failed hosts</DescriptionListTerm>
          <DescriptionListDescription>
            {currencyFormatter(template.failed_hosts_costs)}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Monetary gain</DescriptionListTerm>
          <DescriptionListDescription>
            {template?.monetary_gain ? currencyFormatter(template.monetary_gain) : 'TODO'}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </ExpandableRowContent>
  </Td>
);

export default ExpandedRowContents;
