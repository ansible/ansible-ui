import React, { FunctionComponent } from 'react';
import { TableComposable, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import Row from './Row';
import { ChartLegendEntry } from 'react-json-chart-builder';

interface Props {
  data: ChartLegendEntry[];
  readOnly: boolean;
}

const TopTemplates: FunctionComponent<Props> = ({ data = [], readOnly = true }) => {
  const { t } = useTranslation();

  return (
    <TableComposable data-cy={'table'} aria-label="ROI Table" variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th />
          <Th>{t('Name')}</Th>
          <Th>{t('Manual time')}</Th>
          <Th>{t('Savings')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((template) => (
          <Row key={template.id} template={template} readOnly={readOnly} />
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default TopTemplates;
