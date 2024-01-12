/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable  @typescript-eslint/no-unsafe-argument */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const BarContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 100%;
  max-width: 100%;
  height: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const Bar = styled.div`
  height: 100%;
`;

const LabelsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;

const Label = styled.div`
  padding-left: 2rem;
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Square = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  margin-right: 0.5rem;
`;

const whiteSpace = 0.15; // Currently in percent of total bar width

function title(str: string) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

export const Breakdown = ({ categoryCount, categoryColor, showPercent = false }) => {
  const totalCount = Object.values(categoryCount).reduce(
    (accumulated, currentVal) => accumulated + currentVal
  );

  const sortedCategories = Object.keys(categoryCount)
    .filter((category) => categoryCount[category] > 0)
    .sort((a, b) => {
      if (categoryCount[a] < categoryCount[b]) {
        return 1; // Normally should be -1, but we want descending order
      }
      if (categoryCount[a] > categoryCount[b]) {
        return -1;
      }
      return 0;
    })
    .map((category) => {
      return {
        name: category,
        barSpacing: categoryCount[category] / totalCount,
        color: categoryColor[category],
      };
    });

  const remainingSpace = 1 - ((sortedCategories.length - 1) * whiteSpace) / 100;

  return (
    <>
      <BarContainer>
        {sortedCategories.map(({ barSpacing, color }, idx) => {
          if (idx < sortedCategories.length - 1) {
            return (
              <React.Fragment key={idx}>
                <Bar
                  style={{
                    backgroundColor: color,
                    width: `${barSpacing * 100 * remainingSpace}%`,
                  }}
                />
                <Bar
                  style={{
                    backgroundColor: 'transparent',
                    width: `${whiteSpace}%`,
                  }}
                />
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={idx}>
                <Bar
                  style={{
                    backgroundColor: color,
                    width: `${barSpacing * 100 * remainingSpace}%`,
                  }}
                />
              </React.Fragment>
            );
          }
        })}
      </BarContainer>
      <LabelsContainer>
        {sortedCategories.map(({ name, barSpacing, color }) => (
          <Label key={`label-${name}`}>
            <Square style={{ backgroundColor: color }} />
            {showPercent ? (
              <p>
                {title(name)} {Math.round(barSpacing * 100)}%
              </p>
            ) : (
              <p>{title(name)}</p>
            )}
          </Label>
        ))}
      </LabelsContainer>
    </>
  );
};

Breakdown.propTypes = {
  categoryColor: PropTypes.object.isRequired,
  categoryCount: PropTypes.object.isRequired,
  showPercent: PropTypes.bool,
};
