export interface InventoryGroup {
  id: number;
  type: string;
  url: string;
  summary_fields: {
    created_by: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    modified_by: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    user_capabilities: {
      edit: true;
      delete: true;
      copy: true;
    };
  };
  created: string;
  modified: string;
  name: string;
  description: string;
  inventory: number;
  variables: string;
}
