import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ansibleDocUrls } from '../../../main/ansibleDocsUrls';

export function LabelHelp(props: { inventoryKind: string }) {
  const { t } = useTranslation();
  const inventoryKind = props.inventoryKind;
  const jsonExample = `
  {
    "somevar": "somevalue"
    "somepassword": "Magic"
  }
`;
  const yamlExample = `
  ---
  somevar: somevalue
  somepassword: magic
`;

  const yamlExampleConstructed = `
      ---
      plugin: constructed
      strict: true
      use_vars_plugins: true
    `;

  const labelHelpVarsInventory = (
    <>
      <Trans>
        Variables must be in JSON or YAML syntax. Use the radio button to toggle between the two.
      </Trans>
      <br />
      <br />
      <Trans>JSON:</Trans>
      <pre>{jsonExample}</pre>
      <br />
      <Trans>YAML:</Trans>
      <pre>{yamlExample}</pre>
      <br />
      <Trans>
        View JSON examples at{' '}
        <Link to="https://www.json.org" target="_blank" rel="noopener noreferrer">
          www.json.org
        </Link>
      </Trans>
      <br />
      <Trans>
        View YAML examples at{' '}
        <Link
          to="https://docs.ansible.com/YAMLSyntax.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          docs.ansible.com
        </Link>
      </Trans>
    </>
  );

  const labelHelpVarsSmartInventory = (
    <>
      {t(`Enter inventory variables using either JSON or YAML syntax. 
  Use the radio button to toggle between the two. 
  Refer to the Ansible Controller documentation for example syntax.
  `)}
    </>
  );

  const labelHelpVarsConstructedInventory = (
    <>
      <Trans>
        Variables used to configure the constructed inventory plugin. For a detailed description of
        how to configure this plugin, see{' '}
        <a href={ansibleDocUrls.constructed} target="_blank" rel="noopener noreferrer">
          constructed inventory
        </a>{' '}
        plugin configuration guide.
      </Trans>
      <br />
      <br />
      <hr />
      <br />
      <Trans>
        Variables must be in JSON or YAML syntax. Use the radio button to toggle between the two.
      </Trans>
      <br />
      <br />
      <Trans>YAML:</Trans>
      <pre>{yamlExampleConstructed}</pre>
    </>
  );

  return inventoryKind === ''
    ? labelHelpVarsInventory
    : inventoryKind === 'smart'
      ? labelHelpVarsSmartInventory
      : labelHelpVarsConstructedInventory;
}
