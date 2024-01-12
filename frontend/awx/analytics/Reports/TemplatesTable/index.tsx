import { ChartLegendEntry } from '@ansible/react-json-chart-builder';
import {
  Table /* data-codemods */,
  TableVariant,
  Tbody,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Row } from './Row';

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

export const TopTemplates: FunctionComponent<Props> = ({
  data = [],
  readOnly = true,
  variableRow,
  getSortParams,
}) => {
  const { t } = useTranslation();

  return (
    <Table data-cy={'table'} aria-label="ROI Table" variant={TableVariant.compact}>
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
    </Table>
  );
};
