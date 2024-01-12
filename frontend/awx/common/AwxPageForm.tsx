import { PageForm, PageFormProps } from '../../../framework';
import { awxErrorAdapter } from './adapters/awxErrorAdapter';

export function AwxPageForm<T extends object>(props: PageFormProps<T>) {
  return <PageForm<T> {...props} errorAdapter={awxErrorAdapter} />;
}
