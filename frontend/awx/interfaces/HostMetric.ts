export interface HostMetric {
  id: number;
  hostname: string;
  url: string;
  first_automation: string;
  last_automation: string;
  last_deleted: string;
  automated_counter: number;
  deleted_counter: number;
  deleted: boolean;
  used_in_inventories: number;
}
