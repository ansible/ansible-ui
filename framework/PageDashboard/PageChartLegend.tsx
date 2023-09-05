import { Link } from 'react-router-dom';

export function PageChartLegend(props: {
  id: string;
  legend: { label: string; count?: number; color: string; link?: string }[];
  horizontal?: boolean;
}) {
  if (props.horizontal) {
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        {props.legend.map((item, index) => {
          if (item.count === 0) return <></>;
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <PageChartLegendColor
                id={`${props.id}-${item.label.toLowerCase().replace(/ /g, '-')}-count`}
                color={item.color}
              />
              <PageChartLegendCount count={item.count} />
              <PageChartLegendLabel label={item.label} link={item.link} />
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        rowGap: 6,
        columnGap: 6,
        alignItems: 'center',
      }}
    >
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
    </div>
  );
}

function PageChartLegendColor(props: { id?: string; color: string }) {
  return (
    <div
      id={props.id}
      style={{
        width: 10,
        height: 10,
        backgroundColor: props.color,
        borderRadius: 2,
        marginRight: 4,
      }}
    />
  );
}

function PageChartLegendCount(props: { id?: string; count?: number }) {
  return (
    <div id={props.id} style={{ fontSize: 'small', lineHeight: '1em', textAlign: 'center' }}>
      {props.count}
    </div>
  );
}

function PageChartLegendLabel(props: { label: string; link?: string }) {
  return (
    <div style={{ fontSize: 'small', lineHeight: '1em' }}>
      {props.link ? (
        <Link to={props.link} style={{ textDecoration: 'none' }}>
          {props.label}
        </Link>
      ) : (
        props.label
      )}
    </div>
  );
}
