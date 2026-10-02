import { PageForm, PageFormProps } from '@ansible/ansible-ui-framework';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';
import { awxErrorAdapter } from './adapters/awxErrorAdapter';

export type AwxPageFormProps<T extends object> = PageFormProps<T> & {
  /**
   * AWX OPTIONS endpoint whose field patterns should drive text input validation.
   * Ignored when `optionsData` is already provided.
   */
  optionsUrl?: string;
};

export function AwxPageForm<T extends object>(props: Readonly<AwxPageFormProps<T>>) {
  const { optionsUrl, optionsData, ...rest } = props;
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    optionsData ? undefined : optionsUrl
  );
  return <PageForm<T> {...rest} errorAdapter={awxErrorAdapter} optionsData={optionsData ?? data} />;
}
