import { PageForm, PageFormProps } from '@ansible/ansible-ui-framework';
import { edaErrorAdapter } from './edaErrorAdapter';

export function EdaPageForm<T extends object>(props: PageFormProps<T>) {
  return <PageForm<T> {...props} errorAdapter={edaErrorAdapter} />;
}
