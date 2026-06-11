import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectEdaResource } from '../../common/PageFormSingleSelectEdaResource';

import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { edaAPI } from '../../common/eda-utils';
import { useRulebookColumns } from '../hooks/useRulebookColumns';
import { useRulebookFilters } from '../hooks/useRulebookFilters';

/**
 * A form input for selecting an rulebook.
 *
 * @example
 * ```tsx
 * <PageFormSelectRulebook<Credential> name="rulebook" />
 * ```
 */
export function PageFormRulebookSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  isRequired?: boolean;
  isDisabled?: string;
  helperText?: string;
  projectId?: string;
}) {
  const { t } = useTranslation();
  const rulebookColumns = useRulebookColumns();
  const rulebookFilters = useRulebookFilters();
  return (
    <PageFormSingleSelectEdaResource<EdaRulebook, TFieldValues, TFieldName>
      name={props.name}
      id="rulebook_id"
      label={t('Rulebook')}
      placeholder={t('Select project rulebook')}
      queryPlaceholder={t('Loading project rulebooks...')}
      queryErrorText={t('Error loading project rulebooks')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={edaAPI`/rulebooks/`}
      queryParams={{ project_id: props?.projectId || '' }}
      tableColumns={rulebookColumns}
      toolbarFilters={rulebookFilters}
    />
  );
}
