import { PageForm, PageFormProps } from '../../../framework';
import { hubErrorAdapter } from './adapters/hubErrorAdapter';

export function HubPageForm<T extends object>(props: PageFormProps<T>) {
  return <PageForm<T> {...props} errorAdapter={props.errorAdapter ?? hubErrorAdapter} />;
}
