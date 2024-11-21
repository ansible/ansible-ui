import { PageForm } from '../PageForm';
import { PageFormFileUpload } from './PageFormFileUpload';

interface Form {
  file: string;
}
describe('PageFormFileUpload', () => {
  it('Should mount, with disabled clear button', () => {
    const onSubmit = cy.stub().as('onSubmit');
    cy.mount(
      <PageForm<Form>
        onSubmit={onSubmit}
        onCancel={() => null}
        submitText="Submit"
        defaultValue={{
          file: '',
        }}
      >
        <PageFormFileUpload
          name="file"
          isClearButtonDisabled
          // eslint-disable-next-line i18next/no-literal-string
          label="File upload"
          labelHelpTitle="Help text label"
          labelHelp="Help text"
          isRequired={false}
          validate={() => 'valid'}
        />
      </PageForm>
    );
    cy.getByDataCy('file-form-group').should('be.visible');
    cy.get('button#file-browse-button').should('be.visible').should('not.have.attr', 'disabled');
    cy.get('button[aria-disabled="true"]').should('contain', 'Clear');
  });
  it('Should have enabled clear button', () => {
    const onSubmit = cy.stub().as('onSubmit');
    cy.mount(
      <PageForm<Form>
        onSubmit={onSubmit}
        onCancel={() => null}
        submitText="Submit"
        defaultValue={{
          file: '- name: Create an AWS VPC \n gather_facts: false \n hosts: localhost \n\ntasks:- name: Create a VPC \n\nsteampunk.aws.ec2_vpc: \nname: my-vpc \ncidr: 10.0.0.0/16 \nprofile: default',
        }}
      >
        <PageFormFileUpload
          name="file"
          isClearButtonDisabled={false}
          // eslint-disable-next-line i18next/no-literal-string
          label="File upload"
          labelHelpTitle="Help text label"
          labelHelp="Help text"
          isRequired={false}
          validate={() => 'valid'}
        />
      </PageForm>
    );
    cy.getByDataCy('file-form-group').should('be.visible');
    cy.get('button#file-browse-button').should('be.visible').should('not.have.attr', 'disabled');
    cy.containsBy('button', 'Clear').should('be.visible').should('not.have.attr', 'disabled');
  });
  it('Can update the input', () => {
    const onSubmit = cy.stub().as('onSubmit');

    cy.mount(
      <PageForm<Form>
        onSubmit={onSubmit}
        onCancel={() => null}
        submitText="Submit"
        defaultValue={{
          file: '',
        }}
      >
        <PageFormFileUpload
          name="file"
          type="text"
          isClearButtonDisabled={false}
          // eslint-disable-next-line i18next/no-literal-string
          label="File upload"
          labelHelpTitle="Help text label"
          labelHelp="Help text"
          isRequired={false}
          validate={() => 'valid'}
        />
      </PageForm>
    );

    cy.get('textarea[aria-label="File upload"]').type('Alex');
    cy.get('textarea[aria-label="File upload"]').should('contain.text', 'Alex');
    cy.clickButton('Clear');
    cy.get('textarea[aria-label="File upload"]').should('not.contain.text', 'Alex');
  });
});
