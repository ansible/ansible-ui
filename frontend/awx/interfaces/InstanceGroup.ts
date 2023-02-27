import { InstanceGroup as SwaggerInstanceGroup } from './generated-from-swagger/api';

export interface InstanceGroup
  extends Omit<SwaggerInstanceGroup, 'id' | 'capacity' | 'consumed_capacity' | 'name'> {
  id: number;
  capacity: number;
  consumed_capacity: number;
  name: string;
}
