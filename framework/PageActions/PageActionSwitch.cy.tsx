import { t } from 'i18next';
import { IPageActionSwitchSingle, PageActionSelection, PageActionType } from './PageAction';
import { PageActionSwitch } from './PageActionSwitch';

describe('PageActionSwitch', () => {
  const pageActionSwitchFlag = true;

  it('shows switch with the correct initial state', () => {
    const resource: { enabled: boolean } = { enabled: true };
    const action: IPageActionSwitchSingle<{ enabled: boolean }> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: (resource) => resource?.enabled,
      isDisabled: () => undefined,
      ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
      selection: PageActionSelection.Single,
      label: '',
    };
    cy.mount(<PageActionSwitch action={action} selectedItem={resource} />);
    cy.getByDataCy('toggle-switch').click();
    cy.get('[data-cy="toggle-switch"]').within(() => {
      cy.get('input[type="checkbox"]').should('have.prop', 'checked', resource.enabled);
    });
  });

  it('displays enabled tooltip content', () => {
    const resource: { enabled: boolean } = { enabled: true };
    const action: IPageActionSwitchSingle<{ enabled: boolean }> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: (resource) => resource?.enabled,
      isDisabled: () => undefined,
      ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
      selection: PageActionSelection.Single,
      label: 'instance enabled',
    };
    cy.mount(<PageActionSwitch action={action} iconOnly={true} selectedItem={resource} />);
    cy.get('div.pf-v5-c-switch__toggle-icon').trigger('mouseenter');
    cy.hasTooltip('instance enabled');
  });

  it('switch is disabled when isDisabled is not undefined', () => {
    const resource: { enabled: boolean } = { enabled: true };
    const action: IPageActionSwitchSingle<{ enabled: boolean }> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: (resource) => resource?.enabled,
      isDisabled: () => 'instance disabled',
      ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
      selection: PageActionSelection.Single,
      label: 'switch disabled',
    };
    cy.mount(<PageActionSwitch action={{ ...action }} selectedItem={resource} />);
    cy.get('input[type="checkbox"]').should('be.disabled');
  });

  it('toggles switch state when clicked', () => {
    const resource: { enabled: boolean } = { enabled: true };
    const action: IPageActionSwitchSingle<{ enabled: boolean }> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: (resource) => resource?.enabled,
      isDisabled: () => undefined,
      ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
      selection: PageActionSelection.Single,
      labelOff: 'instance disabled',
      label: 'instance enabled',
    };
    cy.mount(<PageActionSwitch action={action} selectedItem={resource} />);
    cy.get('span.pf-v5-c-switch__toggle').click();
    cy.contains('instance enabled');
    cy.get('span.pf-v5-c-switch__toggle').click();
    cy.contains('instance disabled');
  });

  it('displays tooltip when isDisabled is undefined', () => {
    const resource: { enabled: boolean } = { enabled: true };
    const action: IPageActionSwitchSingle<{ enabled: boolean }> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: (resource) => resource?.enabled,
      isDisabled: () => undefined,
      ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
      selection: PageActionSelection.Single,
      tooltip: 'Tooltip message',
      label: '',
    };
    cy.mount(<PageActionSwitch action={action} selectedItem={resource} />);
    cy.get('span.pf-v5-c-switch__toggle').trigger('mouseenter');
    cy.hasTooltip('Tooltip message');
  });

  it('displays isDisabled text instead of tooltip prop text', () => {
    const resource: { enabled: boolean } = { enabled: true };
    const action: IPageActionSwitchSingle<{ enabled: boolean }> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: (resource) => resource?.enabled,
      isDisabled: () => 'This toggle is disabled',
      ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
      selection: PageActionSelection.Single,
      tooltip: 'Tooltip message',
      label: '',
    };
    cy.mount(<PageActionSwitch action={action} selectedItem={resource} />);
    cy.get('span.pf-v5-c-switch__toggle').trigger('mouseenter');
    cy.hasTooltip('This toggle is disabled');
  });
});
