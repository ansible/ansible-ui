import { SystemJobTemplate as SwaggerSystemJobTemplate } from './generated-from-swagger/api';

export interface SystemJobTemplate
  extends Omit<SwaggerSystemJobTemplate, 'id' | 'name' | 'type'> {
  id: number;
  name: string;
  type: string;
}
