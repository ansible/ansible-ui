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
    ToolbarItemVariant,
    Pagination,
    PageSection,
    PaginationVariant,
    Bullseye
} from '@patternfly/react-core';
import useSWR from 'swr';
import { requestPost } from '../../../common/crud/Data';
import styled from 'styled-components';
import TotalSavings from './TotalSavings';
import CalculationCost from './CalculationCost';
import AutomationFormula from './AutomationFormula';
import TemplatesTable from './TemplatesTable';
import { useSearchParams } from 'react-router-dom';
import Chart from '../components/Chart';
import hydrateSchema from '../components/Chart/hydrateSchema';
import FilterableToolbarItem from '../components/Toolbar/Toolbar';
import currencyFormatter from '../utilities/currencyFormatter';
import React from "react";
import {ApiOptionsType} from "../components/Toolbar/types";
const SpinnerDiv = styled.div`
  height: 400px;
  padding-top: 200px;
  padding-left: 400px;
`;

export default function AutomationCalculator({schema}) {
    const [searchParams, setSearchParams] = useSearchParams();

    const defaultParams = {
        status: ['successful'],
        org_id: [],
        cluster_id: [],
        template_id: [],
        inventory_id: [],
        quick_date_range: 'roi_last_year',
        job_type: ['job'],
        sort_options: 'successful_hosts_savings',
        sort_order: 'desc',
        start_date: undefined,
        end_date: undefined,
        limit: '6',
        offset: '0',
        only_root_workflows_and_standalone_jobs: true,
        template_weigh_in: undefined,
        attributes: [
            'elapsed',
            'host_count',
            'total_count',
            'total_org_count',
            'total_cluster_count',
            'successful_hosts_total',
            'successful_elapsed_total',
        ],
        group_by: 'template',
        group_by_time: false,
    };

    const getParams = () => {
        let params = JSON.parse(JSON.stringify(defaultParams));
        Object.keys(defaultParams).forEach((key) => {
            const value = ['job_type', 'inventory_id', 'template_id', 'cluster_id', 'org_id', 'status'].includes(key) ? searchParams.getAll(key) : searchParams.get(key);
            if (!!value) {
                params[key] = value;
            }
        });
        return params;
    };

    const updateSearchParams = (key: string | undefined, value: string | Array<string | number> | undefined) => {
        let updatedSearchParams;
        if (!key) {
            updatedSearchParams = new URLSearchParams('');
            setSearchParams(updatedSearchParams.toString());
            return;
        }
        updatedSearchParams = new URLSearchParams(searchParams.toString());
        if (!value) {
            updatedSearchParams.delete(key);
        } else {
            if (Array.isArray(value)) {
                //TODO remove it from params
                if (value.length === 0) {
                    updatedSearchParams.delete(key);
                } else {
                    updatedSearchParams.delete(key);
                    value.forEach(v => updatedSearchParams.append(key, v));
                }
            } else {
                updatedSearchParams.set(key, value);

            }
        }
        setSearchParams(updatedSearchParams.toString());
    };

    const getOffset = (page:string, perPage:string) => {
        return page === '0' ? 0 : ((parseInt(page) - 1 )*parseInt(perPage));
    };

    const {data, isLoading, error} =
        useSWR(`/api/v2/analytics/roi_templates/?limit=${searchParams.get('limit') || '6'}&offset=${getOffset(getParams().offset, getParams().limit)}&sort_by=${getParams().sort_options}${encodeURIComponent(':'+ getParams().sort_order)}`,
            (url, json, signal) => requestPost(url, getParams(), signal));
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
    // TODO error state
    if (error || optionsError) return <PageSection isFilled>
        <Bullseye>
            <Spinner />
        </Bullseye>
    </PageSection>;


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
        y: getParams().sort_options,
        tooltip: 'Savings for',
        field: getParams().sort_options,
        label:
            options?.sort_options?.find(({ key }) => key === getParams().sort_options)
                ?.value || 'Label Y',
    };

    const renderLeft = () => (
        <Card isPlain>
                <CardHeader>
                    <CardTitle>Automation savings</CardTitle>
                </CardHeader>
            {isLoading && !!data ? (<SpinnerDiv>
                <Spinner data-cy={'spinner'} isSVG />
            </SpinnerDiv>) : data?.meta?.legend.length === 0 ? (<SpinnerDiv>
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
          className="border-bottom dark-2 pf-m-toggle-group-container"
          collapseListedFiltersBreakpoint="xl"
          clearAllFilters={() => updateSearchParams(undefined, undefined)}
          data-cy={'filter-toolbar'}
      >
          <ToolbarContent>
              {
                  !optionsIsLoading && !optionsError && <FilterableToolbarItem categories={options as ApiOptionsType} filters={getParams()} setFilters={(key, value) => updateSearchParams(key, value)}
                  />
              }
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
