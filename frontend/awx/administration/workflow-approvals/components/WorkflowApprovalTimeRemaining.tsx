/* eslint-disable i18next/no-literal-string */
import { Flex, FlexItem, Split, SplitItem } from '@patternfly/react-core';
import { useEffect, useMemo, useState } from 'react';
import { IconWrapper } from '../../../../../framework/components/IconWrapper';
import { ClockIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { TextCell, getPatternflyColor } from '../../../../../framework';
import { Trans, useTranslation } from 'react-i18next';

export function WorkflowApprovalTimeRemaining(props: { approval_expiration: string }) {
  const { t } = useTranslation();
  const approvalExpiration = useMemo(
    () => new Date(props.approval_expiration ?? 0).valueOf(),
    [props.approval_expiration]
  );

  const [timeRemaining, setTimeRemaining] = useState(
    Math.max(0, approvalExpiration - Date.now().valueOf())
  );

  useEffect(() => {
    if (timeRemaining === 0) return;
    const timeout = setInterval(() => {
      setTimeRemaining(Math.max(0, approvalExpiration - Date.now().valueOf()));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [approvalExpiration, timeRemaining]);

  const totalSeconds = Math.floor(timeRemaining / 1000);
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor((totalSeconds / 60 / 60) % 24);
  const days = Math.floor(totalSeconds / 60 / 60 / 24);

  const abbreviatedDays = t(`${days}d`);
  const abbreviatedHours = t(`${hours}h`);
  const abbreviatedMinutes = t(`${minutes}m`);
  const abbreviatedSeconds = t(`${seconds}s`);

  if (totalSeconds === 0)
    return (
      <TextCell
        text={t`Timed out`}
        color={'red'}
        iconColor={'danger'}
        icon={<ExclamationCircleIcon />}
      />
    );
  return (
    <Flex
      spaceItems={{ default: 'spaceItemsNone' }}
      flexWrap={{ default: 'nowrap' }}
      alignItems={{ default: 'alignItemsBaseline' }}
    >
      <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
        <IconWrapper size="sm" color="blue" padRight>
          <ClockIcon />
        </IconWrapper>
      </FlexItem>
      <FlexItem style={{ maxWidth: '100%' }}>
        <div
          style={{
            minWidth: 200,
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            color: getPatternflyColor('blue'),
          }}
        >
          <Trans>
            <Split>
              <SplitItem>Expires in&nbsp;</SplitItem>
              {days !== 0 && <SplitItem>{abbreviatedDays}&nbsp;</SplitItem>}
              {hours !== 0 && <SplitItem>{abbreviatedHours}&nbsp;</SplitItem>}
              {minutes !== 0 && <SplitItem>{abbreviatedMinutes}&nbsp;</SplitItem>}
              {<SplitItem>{abbreviatedSeconds}&nbsp;</SplitItem>}
            </Split>
          </Trans>
        </div>
      </FlexItem>
    </Flex>
  );
}
