import { ChartDonut, ChartDonutProps } from '@patternfly/react-charts';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Skeleton,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { Fragment } from 'react';
import { usePageNavigate } from '../components/usePageNavigate';
import { PageChartContainer } from './PageChartContainer';

export function PageDonutChart(props: Omit<ChartDonutProps, 'width' | 'height'>) {
  return (
    <PageChartContainer>
      {(size) => (
        <ChartDonut
          //   ariaDesc="Average number of pets"
          //   ariaTitle="Donut chart example"
          //   constrainToVisibleArea
          //   data={items.map((item) => ({ x: item.label, y: item.count }))}
          //   title={total.toString()}
          //   colorScale={items.map((item) => item.color)}
          //   padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
          {...props}
          width={size.width}
          height={size.height}
        />
      )}
    </PageChartContainer>
  );
}

export function PageDashboardDonutCard(props: {
  title: string;
  to: string;
  items: { count: number; label: string; color: string }[];
  loading?: boolean;
}) {
  const { title, items, loading } = props;
  const total = items.reduce((total, item) => total + item.count, 0);
  const history = usePageNavigate();
  return (
    <Card
      isFlat
      isSelectable
      isRounded
      style={{ transition: 'box-shadow 0.25s' }}
      onClick={() => history(props.to)}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardBody>
        {loading === true ? (
          <Split hasGutter>
            <SplitItem>
              <Skeleton shape="circle" width="100px" />
            </SplitItem>
            <SplitItem style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                {items.map((item) => (
                  <FlexItem key={item.label}>
                    <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                        <div style={{ width: 12, height: 12 }}>
                          <Skeleton shape="square" width="12" height="12" />
                        </div>
                      </FlexItem>
                      <FlexItem grow={{ default: 'grow' }}>
                        <Skeleton shape="square" width="70px" height="14px" />
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                ))}
              </Flex>
            </SplitItem>
          </Split>
        ) : (
          <Split hasGutter>
            <SplitItem>
              <div style={{ width: '100px', height: '100px' }}>
                <PageDonutChart
                  ariaDesc="Average number of pets"
                  ariaTitle="Donut chart example"
                  constrainToVisibleArea
                  data={items.map((item) => ({ x: item.label, y: item.count }))}
                  title={total.toString()}
                  colorScale={items.map((item) => item.color)}
                  padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
                />
              </div>
            </SplitItem>
            <SplitItem style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                {items.map((item) => {
                  if (item.count === 0) return <Fragment key={item.label}></Fragment>;
                  return (
                    <FlexItem key={item.label}>
                      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: item.color,
                              borderRadius: 2,
                            }}
                          />
                        </FlexItem>
                        <FlexItem
                          style={{
                            paddingLeft: 4,
                            paddingRight: 2,
                            textAlign: 'right',
                            minWidth: 16,
                          }}
                        >
                          {item.count}
                        </FlexItem>
                        <FlexItem>{item.label}</FlexItem>
                      </Flex>
                    </FlexItem>
                  );
                })}
              </Flex>
            </SplitItem>
          </Split>
        )}
      </CardBody>
    </Card>
  );
}

// export function SkeletonDonutCard(props: { title: string; count: number; to: string }) {
//   const { title, count, to } = props;
//   return (
//     <Card
//       isFlat
//       isSelectable
//       isRounded
//       style={{ transition: 'box-shadow 0.25s' }}
//       onClick={() => history(to)}
//     >
//       <CardHeader>
//         <CardTitle>{title}</CardTitle>
//       </CardHeader>
//       <CardBody>
//         <Split hasGutter>
//           <SplitItem>
//             <Skeleton shape="circle" width="100px" />
//           </SplitItem>
//           <SplitItem style={{ marginTop: 'auto', marginBottom: 'auto' }}>
//             <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
//               {new Array(count).fill(0).map((_, index) => (
//                 <FlexItem key={index}>
//                   <Flex spaceItems={{ default: 'spaceItemsSm' }}>
//                     <FlexItem>
//                       <div style={{ width: 12, height: 12 }}>
//                         <Skeleton shape="square" width="12" height="12" />
//                       </div>
//                     </FlexItem>
//                     <FlexItem grow={{ default: 'grow' }}>
//                       <Skeleton shape="square" width="70px" height="14px" />
//                     </FlexItem>
//                   </Flex>
//                 </FlexItem>
//               ))}
//             </Flex>
//           </SplitItem>
//         </Split>
//       </CardBody>
//     </Card>
//   );
// }
