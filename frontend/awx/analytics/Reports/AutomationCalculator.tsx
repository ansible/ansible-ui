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
import Chart from '../components/Chart';
import hydrateSchema from '../components/Chart/hydrateSchema';
import currencyFormatter from '../utilities/currencyFormatter';
const SpinnerDiv = styled.div`
  height: 400px;
  padding-top: 200px;
  padding-left: 400px;
`;

export default function AutomationCalculator({schema}) {
    const [searchParams, setSearchParams] = useSearchParams();
    console.log("schema: ", schema);
    schema[2].props.y = 'elapsed';

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

    if (!isLoading) console.log("data:", data);
    if (isLoading || optionsIsLoading) return <PageSection isFilled>
        <Bullseye>
            <Spinner />
        </Bullseye>
    </PageSection>;

    //TODO render 500 if error || optionsError
    //TODO loading state if loading || optionsIsLoading

    const formattedValue = (key: string, value: number) => {
        let val;
        switch (key) {
            case 'elapsed':
                val = value.toFixed(2) + ' seconds';
                break;
            case 'template_automation_percentage':
                val = value.toFixed(2) + '%';
                break;
            case 'successful_hosts_savings':
            case 'failed_hosts_costs':
            case 'monetary_gain':
                val = currencyFormatter(value);
                break;
            default:
                val = value.toFixed(2);
        }
        return val;
    };

    const customTooltipFormatting = ({ datum }) => {
        const tooltip =
            chartParams.label +
            ' for ' +
            datum.name +
            ': ' +
            formattedValue('successful_hosts_savings', datum.y);
        return tooltip;
    };

    const chartParams = {
        y: 'successful_hosts_savings',
        tooltip: 'Savings for',
        field: 'successful_hosts_savings',
        label:
            options?.sort_options?.find(({ key }) => key === 'successful_hosts_savings')
                ?.value || 'Label Y',
    };

    const renderLeft = () => (
        <Card isPlain>
                <CardHeader>
                    <CardTitle>Automation savings</CardTitle>
                </CardHeader>
            {isLoading && !!data ? (<SpinnerDiv>
                <Spinner data-cy={'spinner'} isSVG />
            </SpinnerDiv>) : (
                <Chart
                    schema={hydrateSchema(schema)({
                        label: chartParams.label,
                        tooltip: chartParams.tooltip,
                        field: chartParams.field,
                    })}
                    data={{
                        items: data?.meta?.legend,
                    }}
                    specificFunctions={{
                        labelFormat: {
                            customTooltipFormatting,
                        },
                    }}
                />
            )}

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
