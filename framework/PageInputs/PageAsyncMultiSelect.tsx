import { Button } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageMultiSelect, PageMultiSelectProps } from './PageMultiSelect';
import { IPageSelectOption, PageSelectOption } from './PageSelectOption';

export interface PageAsyncMultiSelectProps<
  /** The type of the selected value for the select component value. */
  ValueT,
  /** The type of the async values loaded from the queryAsyncValues callback. */
  AsyncOptionsT
> extends Omit<PageMultiSelectProps<ValueT>, 'options'> {
  /** The function to query for options. */
  queryOptions: (signal: AbortSignal) => Promise<IPageSelectOption<ValueT>[] | null>;

  /** The placeholder to show while querying. */
  queryPlaceholder?: string;

  /** The placeholder to show if the query fails. */
  queryErrorText?: string | ((error: Error) => string);

  /** The function to open the select dialog. */
  openSelectDialog: (
    onSelect: (values: AsyncOptionsT[]) => void,
    defaults?: AsyncOptionsT[]
  ) => void;
}

/**
 * `PageAsyncMultiSelect` wraps the `PageMultiSelect` component to support asynchronously loading options from and async source such as an API.
 *
 * @example
 * return (
 *   <PageAsyncMultiSelect
 *     placeholder="Select options"
 *     values={values}
 *     onSelect={setValues}
 *     queryOptions={async () => [ { label: 'Option 1', value: 1 } ]}
 *   />
 * )
 */
export function PageAsyncMultiSelect<ValueT, AsyncOptionT>(
  props: PageAsyncMultiSelectProps<ValueT, AsyncOptionT>
) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<Error>();
  const [options, setOptions] = useState<PageSelectOption<ValueT>[] | null>();

  const abortController = useRef(new AbortController()).current;
  useEffect(() => () => abortController.abort(), [abortController]);

  const onSelect = useRef(props.onSelect).current;

  const queryOptions = useRef(props.queryOptions).current;

  const queryHandler = useCallback(() => {
    setLoading((loading) => {
      if (loading) return loading;
      setLoadingError(undefined);
      setOptions(undefined);
      try {
        void queryOptions(abortController.signal)
          .then((options) => {
            if (abortController.signal.aborted) return;
            setOptions(options);
            if (options?.length === 1) {
              onSelect(() => options.map((option) => option.value));
            }
          })
          .catch((err) => {
            if (abortController.signal.aborted) return;
            if (err instanceof Error) {
              setLoadingError(err);
            } else {
              setLoadingError(new Error(t('Unknown error')));
            }
          })
          .finally(() => {
            if (abortController.signal.aborted) return;
            setLoading(false);
          });
      } catch (err) {
        if (err instanceof Error) {
          setLoadingError(err);
        } else {
          setLoadingError(new Error(t('Unknown error')));
        }
        setLoading(false);
      }
      return true;
    });
  }, [abortController.signal, onSelect, queryOptions, t]);

  useEffect(queryHandler, [queryHandler]);

  if (loading) {
    return (
      <Button id={props.id} variant="control" isLoading>
        {props.queryPlaceholder ?? t('Loading options...')}
      </Button>
    );
  }

  if (loadingError) {
    return (
      <Button
        id={props.id}
        variant="secondary"
        isDanger
        icon={<SyncAltIcon />}
        iconPosition="right"
        onClick={queryHandler}
      >
        {typeof props.queryErrorText === 'function'
          ? props.queryErrorText(loadingError)
          : props.queryErrorText ?? t('Error loading options')}
      </Button>
    );
  }

  if (props.openSelectDialog !== undefined && !options) {
    // TODO props.openSelectDialog
  }

  const footer = (
    <>
      {props.footer}
      <Button variant="link" isInline>
        View more
      </Button>
    </>
  );

  return (
    <PageMultiSelect
      id={props.id}
      icon={props.icon}
      placeholder={props.placeholder}
      options={options ?? []}
      values={props.values}
      onSelect={props.onSelect}
      variant={props.variant}
      footer={footer}
    />
  );
}
