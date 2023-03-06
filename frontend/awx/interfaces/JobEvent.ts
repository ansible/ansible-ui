import { JobEvent as SwaggerJobEvent } from './generated-from-swagger/api';

export interface JobEvent extends Omit<SwaggerJobEvent, 'counter'> {
  counter: number;
}
