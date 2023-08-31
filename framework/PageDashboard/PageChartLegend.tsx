import { Link } from 'react-router-dom';

export function PageChartLegend(props: {
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
                marginTop: 16,
                gap: 6,
              }}
            >
              <div
                style={{ width: 10, height: 10, backgroundColor: item.color, borderRadius: 2 }}
              />
              <div style={{ fontSize: 'small', textAlign: 'center' }}>{item.count}</div>
              <div style={{ fontSize: 'small' }}>
                {item.link ? (
                  <Link to={item.link} style={{ textDecoration: 'none' }}>
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </div>
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
        columnGap: 6,
        alignItems: 'center',
      }}
    >
      {props.legend.map((item, index) => {
        if (item.count === 0) return <></>;
        return (
          <>
            <div
              key={index * 3 + 0}
              style={{ width: 10, height: 10, backgroundColor: item.color, borderRadius: 2 }}
            />
            <div key={index * 3 + 1} style={{ fontSize: 'small', textAlign: 'center' }}>
              {item.count}
            </div>
            <div key={index * 3 + 2} style={{ fontSize: 'small' }}>
              {item.link ? (
                <Link to={item.link} style={{ textDecoration: 'none' }}>
                  {item.label}
                </Link>
              ) : (
                item.label
              )}
            </div>
          </>
        );
      })}
    </div>
  );
}
