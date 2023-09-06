import { Link } from 'react-router-dom';
import styled from 'styled-components';

export function PageChartLegend(props: {
  id: string;
  legend: { label: string; count?: number; color: string; link?: string }[];
  horizontal?: boolean;
}) {
  if (props.horizontal) {
    return (
      <PageChartLegendHorizontalStyle>
        {props.legend.map((item, index) => {
          if (item.count === 0) return <></>;
          return (
            <PageChartLegendHorizontalItemStyle key={index}>
              <PageChartLegendColor
                id={`${props.id}-${item.label.toLowerCase().replace(/ /g, '-')}-count`}
                color={item.color}
              />
              <PageChartLegendCount count={item.count} />
              <PageChartLegendLabel label={item.label} link={item.link} />
            </PageChartLegendHorizontalItemStyle>
          );
        })}
      </PageChartLegendHorizontalStyle>
    );
  }
  return (
    <PageChartLegendVerticalStyle>
      {props.legend.map((item, index) => {
        if (item.count === 0) return <></>;
        return (
          <>
            <PageChartLegendColor key={index * 3 + 0} color={item.color} />
            <PageChartLegendCount
              id={`${props.id}-${item.label.toLowerCase().replace(/ /g, '-')}-count`}
              key={index * 3 + 1}
              count={item.count}
            />
            <PageChartLegendLabel key={index * 3 + 2} label={item.label} link={item.link} />
          </>
        );
      })}
    </PageChartLegendVerticalStyle>
  );
}

function PageChartLegendColor(props: { id?: string; color: string }) {
  return <PageChartLegendColorStyle id={props.id} style={{ backgroundColor: props.color }} />;
}

function PageChartLegendCount(props: { id?: string; count?: number }) {
  return <PageChartLegendCountStyle id={props.id}>{props.count}</PageChartLegendCountStyle>;
}

function PageChartLegendLabel(props: { label: string; link?: string }) {
  return (
    <PageChartLegendLabelStyle>
      {props.link ? (
        <Link to={props.link} style={{ textDecoration: 'none' }}>
          {props.label}
        </Link>
      ) : (
        props.label
      )}
    </PageChartLegendLabelStyle>
  );
}

const PageChartLegendHorizontalStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const PageChartLegendHorizontalItemStyle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const PageChartLegendVerticalStyle = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  row-gap: 6px;
  column-gap: 6px;
  align-items: center;
`;

const PageChartLegendColorStyle = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 4px;
`;

const PageChartLegendCountStyle = styled.div`
  font-size: small;
  line-height: 1em;
  text-align: center;
`;

const PageChartLegendLabelStyle = styled.div`
  font-size: small;
  line-height: 1em;
`;
