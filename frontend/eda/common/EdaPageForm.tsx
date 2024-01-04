import { PageForm, PageFormProps } from '../../../framework';
import { edaErrorAdapter } from './edaErrorAdapter';

export function EdaPageForm<T extends object>(props: PageFormProps<T>) {
  return <PageForm<T> {...props} errorAdapter={edaErrorAdapter} />;
}
