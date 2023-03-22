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
    Toolbar,
    ToolbarContent,
    ToolbarItem,
    Skeleton,
    ToolbarItemVariant,
    Pagination,
    PageSection,
    PaginationVariant,
    Bullseye
} from '@patternfly/react-core';
import useSWR from 'swr';
import { requestPost } from '../../../Data';
import styled from 'styled-components';
import TotalSavings from './TotalSavings';
import CalculationCost from './CalculationCost';
import AutomationFormula from './AutomationFormula';
import TemplatesTable from './TemplatesTable';
import { useSearchParams } from 'react-router-dom';

const SpinnerDiv = styled.div`
  height: 400px;
  padding-top: 200px;
  padding-left: 400px;
`;

export default function AutomationCalculator() {
    const [searchParams, setSearchParams] = useSearchParams();

    const updateSearchParams = (key: string, value: string) => {
        let updatedSearchParams = new URLSearchParams(searchParams.toString());
        updatedSearchParams.set(key, value);
        setSearchParams(updatedSearchParams.toString());
    };

    let {data, isLoading, error} =
        useSWR(`/api/v2/analytics/roi_templates/?limit=${searchParams.get('limit') || '6'}&offset=${searchParams.get('offset') || 1}&sort_by=${searchParams.get('sort_by') || 'successful_hosts_savings'}`,
            requestPost);
    const { data: options, isLoading: optionsIsLoading, error: optionsError }  = useSWR(`/api/v2/analytics/roi_templates_options/`, requestPost);


    // only interval <0,25> is supported by API
    const defaultPerPageOptions = [
        { title: '4', value: 4 },
        { title: '6', value: 6 },
        { title: '8', value: 8 },
        { title: '10', value: 10 },
        { title: '15', value: 15 },
        { title: '20', value: 20 },
        { title: '25', value: 25 },
    ];

    if (!isLoading) console.log(data);
    if (isLoading || optionsIsLoading) return <PageSection isFilled>
        <Bullseye>
            <Spinner />
        </Bullseye>
    </PageSection>;

    //TODO render 500 if error || optionsError
    //TODO loading state if loading || optionsIsLoading

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
                      perPage={parseInt(searchParams.get('limit') || '20')}
                      page={parseInt(searchParams.get('offset') || '1')}
                      onPerPageSelect={(_e, perPage: number, page: number) => {
                          updateSearchParams('limit', perPage.toString());
                      }}
                      onSetPage={(_e, page: number) => {
                          updateSearchParams('offset', page.toString());
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
              perPage={parseInt(searchParams.get('limit') || '20')}
              page={parseInt(searchParams.get('offset') || '1' )}
              onPerPageSelect={(_e, perPage: number, page: number) => {
                  updateSearchParams('limit', perPage.toString());
              }}
              onSetPage={(_e, page: number) => {
                  updateSearchParams('offset', page.toString());
              }}
              variant={PaginationVariant.bottom}
          />
          </>
  )
}
