// another function for chart
export const formattedValue = (key: string, value: number) => {
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
  
  // another function for chart
  const currencyFormatter = (n: number): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  
    return formatter.format(n); /* $2,500.00 */
  };
  
  // another function for chart
  export const getDateFormatByGranularity = (granularity: string): string => {
    if (granularity === 'yearly') return 'formatAsYear';
    if (granularity === 'monthly') return 'formatAsMonth';
    if (granularity === 'daily') return 'formatDateAsDayMonth';
    return '';
  };
  