import { useTranslation } from 'react-i18next';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { ReorderItems } from '../../../../../framework/components/ReorderItems';
import type { AuthenticatorFormValues, AuthenticatorMapValues } from '../AuthenticatorForm';

export function AuthenticatorMappingOrderStep() {
  const { wizardData, setWizardData, setStepData } = usePageWizard();
  const { mappings = [] } = wizardData as AuthenticatorFormValues;
  const { t } = useTranslation();

  return (
    <div>
      <p>
        {t(
          'Mappings are ordered from top to bottom on the list. Use the draggable icon on the left to re-order your authentication.'
        )}
      </p>
      <ReorderItems<AuthenticatorMapValues>
        items={mappings}
        setItems={(items) => {
          setWizardData({
            ...wizardData,
            mappings: items,
          });
          // set the step data, so mappings are in the rearranged order
          // if the user navigates back to the previous step
          setStepData((prev) => ({ ...prev, mapping: { mappings: items } }));
        }}
        columns={[{ header: t('Name'), cell: (item) => item.name }]}
        keyFn={(item) => item.name}
        isSelected={() => false}
        selectItem={() => null}
        unselectItem={() => null}
        allSelected={false}
        selectAll={() => null}
        unselectAll={() => null}
      />
    </div>
  );
}
