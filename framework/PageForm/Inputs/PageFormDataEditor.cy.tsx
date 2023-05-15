/* eslint-disable i18next/no-literal-string */
import { PageForm } from '../PageForm';
import { PageFormDataEditor } from './PageFormDataEditor';

describe('PageFormCodeEditor', () => {
  interface CodeEditor {
    extra_vars: string;
  }
  const yaml = 'one: 1\ntwo: two';

  it('should mount properly', () => {
    cy.mount(
      <PageForm<CodeEditor>
        onSubmit={() => Promise.resolve()}
        onCancel={() => null}
        submitText="Submit"
        defaultValue={{ extra_vars: yaml }}
      >
        <PageFormDataEditor
          label="Extra Variables"
          name="extra_vars"
          defaultExpanded={false}
          isExpandable
        />
      </PageForm>
    );
    expect(cy.get('label').contains('Extra Variables'));
    expect(cy.get('div#wrapper').should('not.exist'));
  });

  it('should mount expanded, with copy button and 2 toggle language buttons', () => {
    cy.mount(
      <PageForm<CodeEditor>
        submitText="submit"
        onSubmit={() => Promise.resolve()}
        defaultValue={{ extra_vars: '' }}
        onCancel={() => null}
      >
        <PageFormDataEditor
          label="Extra Variables"
          name="extra_vars"
          defaultExpanded
          toggleLanguages={['json', 'yaml']}
          isExpandable
        />
      </PageForm>
    );
    expect(cy.get('div#copy-button').should('be.visible'));
    expect(cy.get('div#toggle-json').should('be.visible'));
    expect(cy.get('div#toggle-yaml').should('be.visible'));
    expect(cy.get('div#wrapper').should('be.visible'));
  });

  // RANDOM FAILING TEST
  // > Uncaught NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'http://localhost:8080/__cypress/src/vendors-node_modules_yaml_browser_index_js.js' failed to load.
  //
  // it('Invalid syntax should make toggle language buttons disabled', () => {
  //   cy.mount(
  //     <PageForm<CodeEditor>
  //       onSubmit={() => Promise.resolve()}
  //       onCancel={() => null}
  //       submitText="submit"
  //       defaultValue={{
  //         extra_vars:
  //           'playing_song_artist: Playing song, {{ song_name }} by {{ artist }}playing_playlist: {{ action }} playlist {{ playlist_name }}',
  //       }}
  //     >
  //       <PageFormDataEditor
  //         label="Extra Variables"
  //         name="extra_vars"
  //         defaultExpanded
  //         toggleLanguages={['json', 'yaml']}
  //         isExpandable
  //       />
  //     </PageForm>
  //   );
  //   cy.get('div#toggle-json').get('button.pf-c-toggle-group__button').should('be.disabled');
  //   cy.get('div#toggle-yaml').get('button.pf-c-toggle-group__button').should('be.disabled');
  // });
});
