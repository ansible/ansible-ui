import { Role as SwaggerRole } from './generated-from-swagger/api';

export interface Role extends Omit<SwaggerRole, 'id' | 'name' | 'summary_fields'> {
  id: number;
  name: string;
  summary_fields: {
    resource_id?: number;
    resource_name?: string;
    resource_type?: string;
    resource_type_display_name?: string;
  };
}
