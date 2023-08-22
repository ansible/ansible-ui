/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import shell from 'shell-escape-tag';
import './commands';

// TODO fetch from env variable
const apiPrefix = '/api/automation-hub/';

// GalaxyKit Integration
Cypress.Commands.add('galaxykit', (operation: string, ...args: string[]) => {
  const adminUsername = Cypress.env('HUB_USER') as string;
  const adminPassword = Cypress.env('HUB_PASSWORD') as string;
  // TODO fetch from env variable
  const galaxykitCommand = 'galaxykit --ignore-certs';
  const server = (Cypress.env('HUB_SERVER') as string) + apiPrefix;
  const options: unknown = (args.length >= 1 &&
    typeof args[args.length - 1] == 'object' &&
    args.splice(args.length - 1, 1)[0]) || { failOnNonZeroExit: false };

  cy.log(`${galaxykitCommand} ${operation} ${args.join(',')}`);

  const cmd = shell`${shell.preserve(
    galaxykitCommand
  )} -s ${server} -u ${adminUsername} -p ${adminPassword} ${shell.preserve(
    operation
  )} ${args}` as string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return cy.exec(cmd, options).then(({ code, stderr, stdout }) => {
    cy.log(`RUN ${cmd}`, options, { code, stderr, stdout });

    if (code || stderr) {
      cy.log('galaxykit code: ' + code.toString());
      cy.log('galaxykit stderr: ' + stderr);
      return Promise.reject(new Error(`Galaxykit failed: ${stderr}`));
    }

    return stdout.split('\n').filter((s) => !!s);
  });
});
