import { ActivityStream as SwaggerActivityStream } from './generated-from-swagger/api';
interface IActor {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}
export interface ActivityStream
  extends Omit<
    SwaggerActivityStream,
    'related' | 'summary_fields' | 'changes' | 'id' | 'operation' | 'object1' | 'object2'
  > {
  operation: string;
  object1: keyof Omit<ActivityStream['summary_fields'], 'actor'>;
  object2: keyof Omit<ActivityStream['summary_fields'], 'actor'>;
  id: number;
  summary_fields: {
    [key: string]: Record<string, string>[] | undefined;
  } & {
    actor?: IActor;
  };
  changes?: {
    inventory: string;
    id: number;
    object1_pk: number;
    name: string;
  };
}
