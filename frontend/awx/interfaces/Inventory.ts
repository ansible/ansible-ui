import { Inventory as SwaggerInventory } from './generated-from-swagger/api';

export interface Inventory extends Omit<SwaggerInventory, 'id' | 'name' | 'summary_fields'> {
  id: number;
  name: string;
}
