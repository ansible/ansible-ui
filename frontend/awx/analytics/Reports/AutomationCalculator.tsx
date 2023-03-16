import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    CardFooter,
    Grid,
    GridItem,
    Spinner,
    Stack,
    StackItem,
    Toolbar, ToolbarContent, ToolbarItem, Skeleton, ToolbarItemVariant, Pagination, PageSection, PaginationVariant
} from '@patternfly/react-core';
import useSWR from 'swr';
import { requestPost } from '../../../Data';
import styled from 'styled-components';
import TotalSavings from './TotalSavings';
import CalculationCost from './CalculationCost';
import AutomationFormula from './AutomationFormula';
import TemplatesTable from './TemplatesTable';
import {PageLayout} from "../../../../framework";

const SpinnerDiv = styled.div`
  height: 400px;
  padding-top: 200px;
  padding-left: 400px;
`;

export default function AutomationCalculator() {

    const {data, isLoading, error} = useSWR(`/api/v2/analytics/roi_templates/`, requestPost);
    const response = useSWR(`/api/v2/analytics/roi_templates_options/`, requestPost);

    const defaultPerPageOptions = [
        { title: '5', value: 5 },
        { title: '10', value: 10 },
        { title: '15', value: 15 },
        { title: '20', value: 20 },
        { title: '25', value: 25 },
    ];

    if (!isLoading) console.log(data);

    const renderLeft = () => (
        <Card isPlain>
                <CardHeader>
                    <CardTitle>Automation savings</CardTitle>
                </CardHeader>
                <SpinnerDiv>
                    <Spinner data-cy={'spinner'} isSVG />
                </SpinnerDiv>
        </Card>
    );
    const renderRight = () => (
        <Stack>
            <StackItem>
                <TotalSavings
                    totalSavings={
                        data?.monetary_gain_other_pages +
                        data?.monetary_gain_current_page
                    }
                    currentPageSavings={data?.monetary_gain_current_page}
                    isLoading={isLoading}
                />
            </StackItem>
            <StackItem>
                <Stack>
                    <StackItem>
                        <CalculationCost
                            costManual={data?.cost.hourly_manual_labor_cost}
                            setFromCalculation={() => {null}}
                            costAutomation={data?.cost.hourly_automation_cost}
                            readOnly={true}
                        />
                    </StackItem>
                    <StackItem>
                        <AutomationFormula />
                    </StackItem>
                </Stack>
            </StackItem>
        </Stack>
    );
  return (
      <>
      <Toolbar
          className="border-bottom dark-2"
      >
          <ToolbarContent>
              <ToolbarItem>
                  <Skeleton />
              </ToolbarItem>
              <ToolbarItem
                  data-cy={'top_pagination'}
                  variant={ToolbarItemVariant.pagination}
                  visibility={{ default: 'hidden', lg: 'visible' }}
              >
                  <Pagination
                      itemCount={data.meta.count}
                      perPageOptions={defaultPerPageOptions}
                      perPage={10}
                      page={1}
                      onPerPageSelect={(_e, perPage: number, page: number) => {
                          console.log('TODO');
                      }}
                      onSetPage={(_e, page: number) => {
                          console.log('TODO');
                      }}
                      isCompact
                  />
              </ToolbarItem>

          </ToolbarContent>
      </Toolbar>
      <PageSection>
      <Card>
          <CardBody>
              <Grid hasGutter>
                  <GridItem span={9}>{!isLoading && renderLeft()}</GridItem>
                  <GridItem span={3}>{!isLoading && renderRight()}</GridItem>
                  <GridItem span={12}>
                      {
                          isLoading ?
                              ( <>
                                      <p>
                              Enter the time it takes to run the following templates manually.
                          </p>
                          <Spinner data-cy={'spinner'} isSVG /></>
                              ) : (
                                  <TemplatesTable
                                      //navigateToJobExplorer={}
                                      data={data.meta.legend}
                                      //variableRow={(item, item) => {return false}}
                                      readOnly={true}
                                  />
                              )
                      }
                  </GridItem>
              </Grid>
          </CardBody>
          <CardFooter>
          </CardFooter>
      </Card>
    </PageSection>
          <Pagination
              itemCount={data.meta.count}
              perPageOptions={defaultPerPageOptions}
              perPage={10}
              page={1}
              onPerPageSelect={(_e, perPage: number, page: number) => {
                  console.log('TODO');
              }}
              onSetPage={(_e, page: number) => {
                  console.log('TODO');
              }}
              variant={PaginationVariant.bottom}
          />
          </>
  )
}
