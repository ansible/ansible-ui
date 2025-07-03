/* eslint-disable i18next/no-literal-string */
import { Button, PageSection, Modal, ModalHeader, ModalBody } from '@patternfly/react-core';
import { usePageDialogs } from './PageDialog';

function TestComponent() {
  const { pushDialog, popDialog } = usePageDialogs();
  const secondDialog = (
    <Modal isOpen key="second" onClose={popDialog}>
      <ModalHeader title="Second Modal" />
      <ModalBody>
        <></>
      </ModalBody>
    </Modal>
  );
  const openSecondDialog = () => pushDialog(secondDialog);
  const firstDialog = (
    <Modal isOpen key="first" onClose={popDialog}>
      <ModalHeader title="First Modal" />
      <ModalBody>
        <Button variant="primary" onClick={openSecondDialog}>
          Open second dialog
        </Button>
      </ModalBody>
    </Modal>
  );
  const openFirstDialog = () => pushDialog(firstDialog);
  return (
    <PageSection hasBodyWrapper={false}>
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
