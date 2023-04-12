export interface OptionsForCategories {
  [key: string]: {
    type: string;
    name: string;
    hasChips: boolean;
    placeholder?: string;
  };
}

export const optionsForCategories: OptionsForCategories = {
  status: {
    type: 'select',
    name: 'Status',
    placeholder: 'Filter by job status',
    hasChips: true,
  },
  quick_date_range: {
    type: 'select',
    name: 'Date',
    placeholder: 'Filter by date',
    hasChips: false,
  },
  start_date: {
    type: 'date',
    name: 'Start date',
    hasChips: false,
  },
  end_date: {
    type: 'date',
    name: 'End date',
    hasChips: false,
  },
  job_type: {
    type: 'select',
    name: 'Job',
    placeholder: 'Filter by job type',
    hasChips: true,
  },
  org_id: {
    type: 'select',
    name: 'Organization',
    placeholder: 'Filter by organization',
    hasChips: true,
  },
  cluster_id: {
    type: 'select',
    name: 'Cluster',
    placeholder: 'Filter by cluster',
    hasChips: true,
  },
  task_action_id: {
    type: 'select',
    name: 'Module',
    placeholder: 'Filter by module',
    hasChips: true,
  },
  template_id: {
    type: 'select',
    name: 'Template',
    placeholder: 'Filter by template',
    hasChips: true,
  },
  sort_options: {
    type: 'select',
    name: 'Sort by',
    placeholder: 'Sort by attribute',
    hasChips: false,
  },
  automation_status: {
    type: 'select',
    name: 'Automation status',
    placeholder: 'Filter by automation status',
    hasChips: true,
  },
  host_status: {
    type: 'select',
    name: 'Host status',
    placeholder: 'Filter by host status',
    hasChips: true,
  },
  frequency_period: {
    type: 'select',
    name: 'Frequency',
    placeholder: 'Filter by frequency',
    hasChips: true,
  },
  category: {
    type: 'select',
    name: 'Category',
    placeholder: 'Filter by category',
    hasChips: true,
  },
  inventory_id: {
    type: 'select',
    name: 'Inventory',
    placeholder: 'Filter by inventory',
    hasChips: true,
  },
  percentile: {
    type: 'select',
    name: 'Percentile',
    placeholder: 'Filter by percentile',
    hasChips: true,
  },
  adoption_rate_type: {
    type: 'select',
    name: 'Adoption rate type',
    placeholder: 'Filter by adoption rate type',
    hasChips: false,
  },
  granularity: {
    type: 'select',
    name: 'Granularity',
    hasChips: false,
  },
  tags: {
    type: 'select',
    name: 'Tag',
    placeholder: 'Filter by tag',
    hasChips: true,
  },
  name: {
    type: 'text',
    name: 'Name',
    placeholder: 'Filter by name',
    hasChips: true,
  },
  description: {
    type: 'text',
    name: 'Description',
    hasChips: true,
  },
};
