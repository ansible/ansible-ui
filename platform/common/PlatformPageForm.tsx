import { PageForm, PageFormProps } from '@ansible/ansible-ui-framework';
import { ErrorAdapter } from '@ansible/ansible-ui-framework/PageForm/typesErrorAdapter';
import { awxErrorAdapter } from '@ansible/awx-ui/common/adapters/awxErrorAdapter';

export interface PlatformPageFormProps<T extends object>
  extends Omit<PageFormProps<T>, 'errorAdapter'> {
  errorAdapter?: ErrorAdapter;
}

export function PlatformPageForm<T extends object>(props: Readonly<PlatformPageFormProps<T>>) {
  const { errorAdapter = awxErrorAdapter, ...restProps } = props;
  return <PageForm<T> {...restProps} errorAdapter={errorAdapter} />;
}
