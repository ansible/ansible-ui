import { TFunction } from 'i18next';

export function getEventPersistenceHelpText(t: TFunction) {
  return (
    <>
      <p>
        {t(
          'Enabling event persistence stores events so they are not lost when a rulebook activation stops or restarts.'
        )}
      </p>
      <br />
      <p>
        {t(
          'If using the platform-provided persistence database, the default System Ansible Rule Engine credential is selected automatically in the credential field below. You can select a different Ansible Rule Engine credential instead if you created one.'
        )}
      </p>
      <br />
      <p>
        {t(
          'If using an external database and no credential exists yet, create an Ansible Rule Engine credential that can reach that database first.'
        )}
      </p>
    </>
  );
}
