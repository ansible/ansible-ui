import { PageForm, PageFormProps } from '@ansible/ansible-ui-framework';
import { awxErrorAdapter } from './adapters/awxErrorAdapter';

export function AwxPageForm<T extends object>(props: Readonly<PageFormProps<T>>) {
  return <PageForm<T> {...props} errorAdapter={awxErrorAdapter} />;
}
