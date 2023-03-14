import { InstanceGroup as SwaggerInstanceGroup } from './generated-from-swagger/api';

export interface InstanceGroup
  extends Omit<SwaggerInstanceGroup, 'id' | 'name' | 'consumed_capacity' | 'capacity'> {
  id: number;
  name: string;
  description?: string;
  consumed_capacity: number;
  is_container_group: boolean;
  capacity: number;
}
