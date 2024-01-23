import { Card, CardBody, CardTitle, Spinner, Title } from '@patternfly/react-core';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { currencyFormatter } from '../utilities/currencyFormatter';

interface Props {
  totalSavings: number;
  currentPageSavings: number;
  isLoading: boolean;
}
const SpinnerDiv = styled.div`
  height: 46.8px;
  padding-left: 100px;
`;

export const TotalSavings: FunctionComponent<Props> = ({
  totalSavings = 0,
  currentPageSavings = 0,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  return (
    <>
      {[t('Total savings'), t('Current page savings')].map((title, index) => (
        <Card
          data-cy={title.toLowerCase().replace(' ', '_').replace(' ', '_')}
          isPlain
          isCompact
          key={title}
        >
          <CardTitle>{title}</CardTitle>
          <CardBody>
            <Title
              headingLevel="h3"
              size={index === 0 ? '4xl' : 'xl'}
              style={{ color: 'var(--pf-v5-global--success-color--100)' }}
            >
              {isLoading ? (
                <SpinnerDiv>
                  <Spinner data-cy={'spinner'} size="lg" />
                </SpinnerDiv>
              ) : (
                currencyFormatter(index === 0 ? totalSavings : currentPageSavings)
              )}
            </Title>
          </CardBody>
        </Card>
      ))}
    </>
  );
};
