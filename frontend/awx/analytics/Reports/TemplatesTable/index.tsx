import React, { FunctionComponent } from 'react';
import { TableComposable, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import Row from './Row';
import { ChartLegendEntry } from 'react-json-chart-builder';

interface Props {
  data: ChartLegendEntry[];
  readOnly: boolean;
  variableRow: { key: string; value: string };
  getSortParams?: {
    sort?: {
      sortBy: {
        index: number;
        direction: 'asc' | 'desc';
      };
      onSort: (_event: unknown, index: number, direction: 'asc' | 'desc') => void;
      columnIndex: number;
    };
  };
}

const TopTemplates: FunctionComponent<Props> = ({
  data = [],
  readOnly = true,
  variableRow,
  getSortParams,
}) => {
  const { t } = useTranslation();

  return (
    <TableComposable data-cy={'table'} aria-label="ROI Table" variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th />
          <Th>{t('Name')}</Th>
          {variableRow && <Th {...getSortParams}>{variableRow.value}</Th>}
          <Th>{t('Manual time')}</Th>
          <Th>{t('Savings')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((template) => (
          <Row
            key={template.id}
            template={template}
            readOnly={readOnly}
            variableRow={variableRow}
          />
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default TopTemplates;
