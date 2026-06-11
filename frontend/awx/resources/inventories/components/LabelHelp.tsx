import { ExternalLink } from '@ansible/hub-ui/common/ExternalLink';
import { Trans, useTranslation } from 'react-i18next';
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
        View JSON examples at <ExternalLink href="https://www.json.org">www.json.org</ExternalLink>
      </Trans>
      <br />
      <Trans>
        View YAML examples at{' '}
        <ExternalLink href="https://docs.ansible.com/YAMLSyntax.html">
          docs.ansible.com
        </ExternalLink>
      </Trans>
    </>
  );

  const labelHelpVarsSmartInventory = (
    <>
      {t(`Enter inventory variables using either JSON or YAML syntax.
  Use the radio button to toggle between the two.
  See the Ansible Controller documentation for example syntax.
  `)}
    </>
  );

  const labelHelpVarsConstructedInventory = (
    <>
      <Trans>
        Variables used to configure the constructed inventory plugin. See{' '}
        <ExternalLink href={ansibleDocUrls.constructed}>constructed inventory</ExternalLink> plugin
        configuration guide for configuration details.
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
