import { PageDashboardCard, PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { DashboardDetailsCardProps } from '../types';
import { EmptyStateError } from '../../../../../framework/components/EmptyStateError';
import { DashboardCardValueDisplay, getDashboardCardValueFontSize } from './DashboardCardValue';

export function DashboardDetailsCard(props: DashboardDetailsCardProps) {
  const { id, title, help, value, valueSuffix, error, errorStateTitle, formatAsCurrency, width } =
    props;

  const fontSize = getDashboardCardValueFontSize(value, width, {
    compact: 'large',
    expanded: 'x-large',
  });

  return (
    <PageDashboardCard id={id} width={width ?? 'md'}>
      <PageDetails disablePadding disableScroll>
        <PageDetail helpText={help} label={title}>
          {error ? (
            <EmptyStateError titleProp={errorStateTitle} message={error.message} />
          ) : (
            <DashboardCardValueDisplay
              value={value}
              valueSuffix={valueSuffix}
              formatAsCurrency={formatAsCurrency}
              fontSize={fontSize}
            />
          )}
        </PageDetail>
      </PageDetails>
    </PageDashboardCard>
  );
}
