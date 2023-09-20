import { InventorySource as SwaggerInventorySource } from './generated-from-swagger/api';
export interface InventorySource
  extends Omit<
    SwaggerInventorySource,
    'id' | 'type' | 'name' | 'source' | 'inventory' | 'related' | 'summary_fields'
  > {
  name: string;
  id: number;
  source: string;
  inventory: number;
  type: 'inventory_source';
  summary_fields: { organization: { id: number; name: string; description: string } };
  related: { schedules: string };
}
