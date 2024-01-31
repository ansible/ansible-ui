/* eslint-disable i18next/no-literal-string */
import { Button, Modal, PageSection } from '@patternfly/react-core';
import { usePageDialogs } from './PageDialog';

function TestComponent() {
  const { pushDialog, popDialog } = usePageDialogs();
  const secondDialog = (
    <Modal title="Second Modal" isOpen key="second" onClose={popDialog}>
      <></>
    </Modal>
  );
  const openSecondDialog = () => pushDialog(secondDialog);
  const firstDialog = (
    <Modal title="First Modal" isOpen key="first" onClose={popDialog}>
      <Button variant="primary" onClick={openSecondDialog}>
        Open second dialog
      </Button>
    </Modal>
  );
  const openFirstDialog = () => pushDialog(firstDialog);
  return (
    <PageSection>
      <Button variant="primary" onClick={openFirstDialog}>
        Open first dialog
      </Button>
    </PageSection>
  );
}

describe('PageDialogs', () => {
  it('should be able to open and close multiple dialogs', () => {
    cy.mount(<TestComponent />);
    cy.get('button').contains('Open first dialog').click();
    cy.contains('First Modal').should('be.visible');

    cy.get('button').contains('Open second dialog').click();
    cy.contains('Second Modal').should('be.visible');

    cy.get('button[aria-label="Close"]').click();
    cy.contains('Second Modal').should('not.exist');
    cy.contains('First Modal').should('be.visible');

    cy.get('button[aria-label="Close"]').click();
    cy.contains('First Modal').should('not.exist');
  });
});
