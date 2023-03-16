import React, { FunctionComponent, useState } from 'react';

import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import {
  TableComposable,
  TableVariant,
  Tbody,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
//import { Template } from './types';
import Row from './Row';

interface Props {
  data: any; //Template[];
 // variableRow: { key: string; value: string };
  readOnly: boolean;
}

const TopTemplates: FunctionComponent<Props> = ({
  data = [],
  //variableRow,
  readOnly = true,
}) => {
  const [isKebabOpen, setIsKebabOpen] = useState(false);
  //const defaultParams = reportDefaultParams('automation_calculator');
  //const { setFromToolbar } = useQueryParams(defaultParams); setFromToolbar -> console.log

  const kebabDropdownItems = [
    <DropdownItem
      key="showAll"
      component="button"
      onClick={() => console.log('template_weigh_in', undefined)}
    >
      Display all template rows
    </DropdownItem>,
    <DropdownItem
      key="hideHiddenTemplates"
      component="button"
      onClick={() => console.log('template_weigh_in', true)}
    >
      Display only shown template rows
    </DropdownItem>,
    <DropdownItem
      key="showHiddenTemplates"
      component="button"
      onClick={() => console.log('template_weigh_in', false)}
    >
      Display only hidden template rows
    </DropdownItem>,
  ];

  return (
    <TableComposable
      data-cy={'table'}
      aria-label="ROI Table"
      variant={TableVariant.compact}
    >
      <Thead>
        <Tr>
          <Th />
          <Th>Name</Th>
          <Th>Manual time</Th>
          <Th>Savings</Th>
          <Th
            style={{
              float: 'right',
              overflow: 'visible',
              zIndex: 1,
            }}
          >
            <Dropdown
              onSelect={() => {
                setIsKebabOpen(true);
              }}
              toggle={
                <KebabToggle
                  style={{ paddingBottom: '0px' }}
                  id="table-kebab"
                  onToggle={() => setIsKebabOpen(!isKebabOpen)}
                />
              }
              isOpen={isKebabOpen}
              isPlain
              dropdownItems={kebabDropdownItems}
              position={'right'}
            />
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((template) => (
          <Row
            key={template.id}
            template={template}
            readOnly={readOnly}
          />
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default TopTemplates;
