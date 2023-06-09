import { SetRequired } from 'type-fest';
import { JobEvent as SwaggerJobEvent } from './generated-from-swagger/api';

export type JobEvent = SetRequired<SwaggerJobEvent, 'counter'>;
