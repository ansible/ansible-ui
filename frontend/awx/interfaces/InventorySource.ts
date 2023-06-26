import { InventorySource as SwaggerInventorySource } from './generated-from-swagger/api';
export interface InventorySource
  extends Omit<SwaggerInventorySource, 'id' | 'type' | 'name' | 'source' | 'inventory'> {
  name: string;
  id: number;
  source: string;
  inventory: number;
  type: 'inventory_source';
}
