import React, { FunctionComponent } from 'react';

import {
  Card,
  CardBody,
  InputGroup as PFInputGroup,
  InputGroupText,
  TextInput,
} from '@patternfly/react-core';
import { DollarSignIcon } from '@patternfly/react-icons';
import styled from 'styled-components';

const InputGroup = styled(PFInputGroup)`
  width: 170px;
`;

const validFloat = (value: number): number =>
  +value && +value < 0 ? NaN : value;

interface Props {
  costManual: number;
  setFromCalculation: (varName: string, value: number) => void;
  costAutomation: number;
  readOnly: boolean;
}

const CalculationCost: FunctionComponent<Props> = ({
  costManual = 0,
  setFromCalculation = () => ({}),
  costAutomation = 0,
  readOnly = true,
}) => (
  <Card isPlain isCompact>
    <CardBody>
      <p>
        Manual cost of automation
        <span
          style={{
            color: 'var(--pf-global--Color--dark-200)',
            fontSize: '0.8em',
            display: 'block',
          }}
        >
          (e.g. average salary of mid-level Software Engineer)
        </span>
      </p>
      <InputGroup>
        <InputGroupText>
          <DollarSignIcon />
        </InputGroupText>
        <TextInput
          id="manual-cost"
          key="manual-cost"
          type="number"
          aria-label="manual-cost"
          value={isNaN(costManual) ? '' : costManual.toString()}
          onChange={(e) => setFromCalculation('manual_cost', validFloat(+e))}
          isDisabled={readOnly}
        />
        <InputGroupText>/hr</InputGroupText>
      </InputGroup>
      <p style={{ paddingTop: '10px' }}>Automated process cost</p>
      <InputGroup>
        <InputGroupText>
          <DollarSignIcon />
        </InputGroupText>
        <TextInput
          id="automation-cost"
          key="automation-cost"
          type="number"
          aria-label="automation-cost"
          value={isNaN(costAutomation) ? '' : costAutomation.toString()}
          onChange={(e) =>
            setFromCalculation('automation_cost', validFloat(+e))
          }
          isDisabled={readOnly}
        />
        <InputGroupText>/hr</InputGroupText>
      </InputGroup>
    </CardBody>
  </Card>
);

export default CalculationCost;
