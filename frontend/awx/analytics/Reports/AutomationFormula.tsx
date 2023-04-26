import React, { FunctionComponent, useState } from 'react';
import {
  Button,
  ButtonVariant,
  CodeBlock,
  CodeBlockCode,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useTranslation, Trans } from 'react-i18next';

const SavingsPerTemplateText: FunctionComponent<Record<string, never>> = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        <strong>{t('Savings per template')}</strong>
      </p>
      <p>
        <Trans>
          Savings per template is the difference between the manual cost and automation cost of
          successfully running templates across hosts. Manual cost is calculated by multiplying the
          number of hours spent manually running templates across hosts by the average hourly wages
          per engineer. Automation cost is the total amount of time, in seconds, spent running
          templates automatically multiplied by the average monthly cost for automated processes.
        </Trans>
      </p>
      <br />
      <p>{t('The formula used to calculate manual cost:')}</p>
      <CodeBlock>
        <CodeBlockCode>
          {t(
            'manual time  = configurable time (in minutes) to manually complete the task on one host * number of host runs manual cost = manual time * configurable manual cost of automation (e.g. average salary of mid-level Software Engineer)'
          )}
        </CodeBlockCode>
      </CodeBlock>
      <br />

      <p>{t('The formula used to calculate automation cost:')}</p>
      <CodeBlock>
        <CodeBlockCode>
          {t(
            'automation time = successful elapsed total / 3600 automation cost = automation time * configurable automated process cost'
          )}
        </CodeBlockCode>
      </CodeBlock>
      <br />

      <p>{t('The formula used to calculate automation cost:')}</p>
      <CodeBlock>
        <CodeBlockCode>{t(`savings per template = manual cost - automation cost`)}</CodeBlockCode>
      </CodeBlock>
      <br />
    </>
  );
};

const FailedHostPerTemplateText: FunctionComponent<Record<string, never>> = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        <strong>{t('Failed hosts cost per template')}</strong>
      </p>
      <p>
        <Trans>
          Failed hosts cost per template is the total amount of time spent on failed automated job
          runs multiplied by the configured automated process cost.
        </Trans>
      </p>
      <br />
      <p>{t('The formula used to calculate failed host cost per template:')}</p>
      <CodeBlock>
        <CodeBlockCode>
          {t(
            'failed cost per template = (failed elapsed total / 3600) * configurable automated process cost'
          )}
        </CodeBlockCode>
      </CodeBlock>
      <br />
    </>
  );
};

const MonetaryGainPerTemplateText: FunctionComponent<Record<string, never>> = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        <strong>{t('Monetary gain per template')}</strong>
      </p>
      <p>
        <Trans>
          Monetary gain per template is the difference between total savings per template and failed
          hosts cost per template.
        </Trans>
      </p>
      <br />
      <p>{t('The formula for monetary gain per template:')}</p>
      <CodeBlock>
        <CodeBlockCode>
          {t(`monetary gain per template = savings per template - failed host cost per template`)}
        </CodeBlockCode>
      </CodeBlock>
      <br />
    </>
  );
};

const AutomationFormula: FunctionComponent<Record<string, never>> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Button
        variant={ButtonVariant.link}
        onClick={() => setIsOpen(true)}
        icon={<InfoCircleIcon />}
        data-cy={'automation_formula_button'}
      >
        {t('Automation formula')}
      </Button>
      <Modal
        title={t('Automation formula')}
        data-cy={'automation_formula_modal'}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={ModalVariant.medium}
        actions={[
          <Button
            key="cancel"
            variant={ButtonVariant.primary}
            onClick={() => setIsOpen(false)}
            data-cy={'automation_formula_cancel_button'}
          >
            {t('Close')}
          </Button>,
        ]}
      >
        <p>
          <Trans>
            We use manual effort versus time spent on automation as factors to create formulas for
            cost and savings related to automation. While we aim to provide as accurate an account
            of the cost and savings as possible, actual values may differ in practice. The following
            information breaks down where we get the data, the factors we use, the assumptions we
            make, and the formula used to compute the values as displayed in the chart.
          </Trans>
        </p>
        <br />

        <SavingsPerTemplateText />
        <br />

        <FailedHostPerTemplateText />
        <br />

        <MonetaryGainPerTemplateText />
      </Modal>
    </>
  );
};

export default AutomationFormula;
