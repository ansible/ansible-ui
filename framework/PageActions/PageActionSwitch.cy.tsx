import { t } from 'i18next';
import instance from '../../cypress/fixtures/instance.json';
import { Instance } from '../../frontend/awx/interfaces/Instance';
import { IPageActionSwitchSingle, PageActionSelection, PageActionType } from './PageAction';
import { PageActionSwitch } from './PageActionSwitch';

describe('PageActionSwitch', () => {
  const pageActionSwitchFlag = true;

  it('shows switch with the correct initial state', () => {
    const action: IPageActionSwitchSingle<Instance> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: () => instance?.enabled,
      isDisabled: () => undefined,
      ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
      selection: PageActionSelection.Single,
      label: '',
    };
    cy.mount(<PageActionSwitch action={action} selectedItem={instance as unknown as Instance} />);
    cy.getByDataCy('toggle-switch').click();
    cy.get('[data-cy="toggle-switch"]').within(() => {
      cy.get('input[type="checkbox"]').should('have.prop', 'checked', instance.enabled);
    });
  });

  it('displays enabled tooltip content', () => {
    const action: IPageActionSwitchSingle<Instance> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: () => instance?.enabled,
      isDisabled: () => undefined,
      ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
      selection: PageActionSelection.Single,
      label: 'instance enabled',
    };
    cy.mount(
      <PageActionSwitch
        action={action}
        iconOnly={true}
        selectedItem={instance as unknown as Instance}
      />
    );
    cy.get('div.pf-v5-c-switch__toggle-icon').trigger('mouseenter');
    cy.hasTooltip('instance enabled');
  });

  it('switch is disabled when isDisabled is not undefined', () => {
    const action: IPageActionSwitchSingle<Instance> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: () => instance?.enabled,
      isDisabled: () => 'instance disabled',
      ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
      selection: PageActionSelection.Single,
      label: 'switch disabled',
    };
    cy.mount(
      <PageActionSwitch action={{ ...action }} selectedItem={instance as unknown as Instance} />
    );
    cy.get('input[type="checkbox"]').should('be.disabled');
  });

  it('toggles switch state when clicked', () => {
    const action: IPageActionSwitchSingle<Instance> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: () => instance?.enabled,
      isDisabled: () => undefined,
      ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
      selection: PageActionSelection.Single,
      labelOff: 'instance disabled',
      label: 'instance enabled',
    };
    cy.mount(<PageActionSwitch action={action} selectedItem={instance as unknown as Instance} />);
    cy.get('span.pf-v5-c-switch__toggle').click();
    cy.contains('instance enabled');
    cy.get('span.pf-v5-c-switch__toggle').click();
    cy.contains('instance disabled');
  });

  it('displays tooltip when isDisabled is undefined', () => {
    const action: IPageActionSwitchSingle<Instance> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: () => instance?.enabled,
      isDisabled: () => undefined,
      ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
      selection: PageActionSelection.Single,
      tooltip: 'Tooltip message',
      label: '',
    };
    cy.mount(<PageActionSwitch action={action} selectedItem={instance as unknown as Instance} />);
    cy.get('span.pf-v5-c-switch__toggle').trigger('mouseenter');
    cy.hasTooltip('Tooltip message');
  });

  it('displays isDisabled text instead of tooltip prop text', () => {
    const action: IPageActionSwitchSingle<Instance> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: () => instance?.enabled,
      isDisabled: () => 'This toggle is disabled',
      ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
      selection: PageActionSelection.Single,
      tooltip: 'Tooltip message',
      label: '',
    };
    cy.mount(<PageActionSwitch action={action} selectedItem={instance as unknown as Instance} />);
    cy.get('span.pf-v5-c-switch__toggle').trigger('mouseenter');
    cy.hasTooltip('This toggle is disabled');
  });
});
