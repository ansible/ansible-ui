import { IPageActionSwitchSingle, PageActionSelection, PageActionType } from './PageAction';
import { useState } from 'react';
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
      ariaLabel: (isEnabled: boolean) => (isEnabled ? 'Enabled' : 'Disabled'),
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
      ariaLabel: (isEnabled: boolean) => (isEnabled ? 'Enabled' : 'Disabled'),
      selection: PageActionSelection.Single,
      label: 'instance enabled',
    };
    cy.mount(<PageActionSwitch action={action} iconOnly={true} selectedItem={resource} />);
    cy.get('.pf-v6-c-switch__toggle').trigger('mouseenter');
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
      ariaLabel: (isEnabled: boolean) => (isEnabled ? 'Enabled' : 'Disabled'),
      selection: PageActionSelection.Single,
      label: 'switch disabled',
    };
    cy.mount(<PageActionSwitch action={{ ...action }} selectedItem={resource} />);
    cy.get('input[type="checkbox"]').should('be.disabled');
  });

  it('toggles switch state when clicked', () => {
    const StatefulSwitchWrapper: React.FC = () => {
      const [enabled, setEnabled] = useState(true);
      const resource = { enabled };

      const action: IPageActionSwitchSingle<{ enabled: boolean }> = {
        type: PageActionType.Switch,
        onToggle: (_selectedItem, newValue) => {
          setEnabled(newValue);
        },
        isSwitchOn: (res) => res.enabled,
        ariaLabel: () => 'instance enabled',
        selection: PageActionSelection.Single,
        label: 'instance enabled',
      };

      return <PageActionSwitch action={action} selectedItem={resource} />;
    };

    cy.mount(<StatefulSwitchWrapper />);

    cy.get('input[type="checkbox"]')
      .should('be.checked')
      .and('have.attr', 'aria-label', 'instance enabled');

    cy.get('span.pf-v6-c-switch__toggle').click();

    cy.get('input[type="checkbox"]')
      .should('not.be.checked')
      .and('have.attr', 'aria-label', 'instance enabled');

    cy.get('span.pf-v6-c-switch__toggle').click();
    cy.get('input[type="checkbox"]')
      .should('be.checked')
      .and('have.attr', 'aria-label', 'instance enabled');
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
      ariaLabel: (isEnabled: boolean) => (isEnabled ? 'Enabled' : 'Disabled'),
      selection: PageActionSelection.Single,
      tooltip: 'Tooltip message',
      label: '',
    };
    cy.mount(<PageActionSwitch action={action} selectedItem={resource} />);
    cy.get('span.pf-v6-c-switch__toggle').trigger('mouseenter');
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
      ariaLabel: (isEnabled: boolean) => (isEnabled ? 'Enabled' : 'Disabled'),
      selection: PageActionSelection.Single,
      tooltip: 'Tooltip message',
      label: '',
    };
    cy.mount(<PageActionSwitch action={action} selectedItem={resource} />);
    cy.get('span.pf-v6-c-switch__toggle').trigger('mouseenter');
    cy.hasTooltip('This toggle is disabled');
  });
});
