import { InstanceGroup as SwaggerInstanceGroup } from './generated-from-swagger/api';

export interface InstanceGroup
  extends Omit<
    SwaggerInstanceGroup,
    'id' | 'name' | 'percent_capacity_remaining' | 'consumed_capacity' | 'capacity' | 'results'
  > {
  id: number;
  name: string;
  description?: string;
  consumed_capacity: number;
  percent_capacity_remaining: number;
  is_container_group: boolean;
  capacity: number;
  results: InstanceGroup[];
}
