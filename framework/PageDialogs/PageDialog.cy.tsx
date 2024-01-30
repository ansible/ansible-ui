/* eslint-disable i18next/no-literal-string */
import { Button, Modal, PageSection } from '@patternfly/react-core';
import { usePageDialogs } from './PageDialog';

function TestComponent() {
  const [, setDialogs] = usePageDialogs();
  const popDialog = () => setDialogs((dialogs) => dialogs.slice(0, -1));
  const secondDialog = (
    <Modal title="Second Modal" isOpen key="second" onClose={popDialog}>
      <></>
    </Modal>
  );
  const openSecondDialog = () => setDialogs((dialogs) => [...dialogs, secondDialog]);
  const firstDialog = (
    <Modal title="First Modal" isOpen key="first" onClose={popDialog}>
      <Button variant="primary" onClick={openSecondDialog}>
        Open second dialog
      </Button>
    </Modal>
  );
  const openFirstDialog = () => setDialogs((dialogs) => [...dialogs, firstDialog]);
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
