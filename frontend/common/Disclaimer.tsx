/* eslint-disable i18next/no-literal-string */
/* istanbul ignore file */

import {
  Alert,
  AlertActionLink,
  Page,
  PageSection,
  Stack,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { Fragment, ReactNode, useCallback, useState } from 'react';

export function Disclaimer(props: { children: ReactNode }) {
  const [acceptedDisclaimer, setAcceptedDisclaimerState] = useState(
    () => process.env.DISCLAIMER === 'true' || localStorage.getItem('disclaimer') === 'true'
  );
  const setAcceptedDisclaimer = useCallback(() => {
    localStorage.setItem('disclaimer', 'true');
    setAcceptedDisclaimerState(true);
  }, []);

  if (!acceptedDisclaimer)
    return (
      <Page>
        <PageSection isFilled>
          <Stack hasGutter>
            <Alert
              title="Disclaimer: This product is a work in progress."
              variant="warning"
              actionLinks={
                <>
                  <AlertActionLink onClick={setAcceptedDisclaimer}>Agree</AlertActionLink>
                </>
              }
            >
              <TextContent>
                <Text component={TextVariants.p}>
                  By proceeding you acknowledge that you understand that the functionality is not
                  complete and that the product will be chaning over time.
                </Text>
              </TextContent>
            </Alert>
          </Stack>
        </PageSection>
      </Page>
    );

  return <Fragment>{props.children}</Fragment>;
}
