import {
  BanIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoIcon,
  SyncAltIcon,
} from '@patternfly/react-icons'
import styled, { Keyframes, keyframes } from 'styled-components'
import { useTranslation } from 'react-i18next'
import {
  PatternFlyColor,
  pfDanger,
  pfDisabled,
  pfInfo,
  pfSuccess,
  pfWarning,
  TextCell,
} from '../../framework'

const Spin: Keyframes = keyframes`
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(1turn);
  }
`

const RunningIcon = styled(SyncAltIcon)`
  animation: ${Spin} 1.75s linear infinite;
`

RunningIcon.displayName = 'RunningIcon'

export function StatusCell(props: { status?: string }) {
  const { t } = useTranslation()
  switch (props.status) {
    case 'disabled':
      return (
        <TextCell
          icon={<BanIcon color={pfDisabled} />}
          iconSize="sm"
          text={t('Disabled')}
          textColor={PatternFlyColor.Grey}
        />
      )
    case 'healthy':
      return (
        <TextCell
          icon={<CheckCircleIcon color={pfSuccess} />}
          iconSize="sm"
          text={t('Healthy')}
          textColor={PatternFlyColor.Green}
        />
      )
    case 'completed':
      return (
        <TextCell
          icon={<CheckCircleIcon color={pfSuccess} />}
          iconSize="sm"
          text={t('Completed')}
          textColor={PatternFlyColor.Green}
        />
      )
    case 'successful':
      return (
        <TextCell
          icon={<CheckCircleIcon color={pfSuccess} />}
          iconSize="sm"
          text={t('Successful')}
          textColor={PatternFlyColor.Green}
        />
      )
    case 'failed':
      return (
        <TextCell
          icon={<ExclamationCircleIcon color={pfDanger} />}
          iconSize="sm"
          text={t('Failed')}
          textColor={PatternFlyColor.Red}
        />
      )
    case 'error':
      return (
        <TextCell
          icon={<ExclamationCircleIcon color={pfDanger} />}
          iconSize="sm"
          text={t('Error')}
          textColor={PatternFlyColor.Red}
        />
      )
    case 'waiting':
      return (
        <TextCell
          icon={<ClockIcon color={pfInfo} />}
          iconSize="sm"
          text={t('Waiting')}
          textColor={PatternFlyColor.Grey}
        />
      )
    case 'pending':
      return (
        <TextCell
          icon={<ClockIcon color={pfInfo} />}
          iconSize="sm"
          text={t('Pending')}
          textColor={PatternFlyColor.Blue}
        />
      )
    case 'new':
      return (
        <TextCell
          icon={<InfoIcon color={pfInfo} />}
          iconSize="sm"
          text={t('Pending')}
          textColor={PatternFlyColor.Blue}
        />
      )
    case 'running':
      return (
        <TextCell
          icon={<RunningIcon color={pfInfo} />}
          iconSize="sm"
          text={t('Running')}
          textColor={PatternFlyColor.Blue}
        />
      )
    case 'canceled':
      return (
        <TextCell
          icon={<ExclamationTriangleIcon color={pfWarning} />}
          iconSize="sm"
          text={t('Canceled')}
          textColor={PatternFlyColor.Yellow}
        />
      )
    case 'never-updated':
      return (
        <TextCell
          icon={<InfoIcon color={pfInfo} />}
          iconSize="sm"
          text={t('Never updated')}
          textColor={PatternFlyColor.Blue}
        />
      )
    default:
      return (
        <TextCell
          icon={<ExclamationTriangleIcon color={pfWarning} />}
          iconSize="sm"
          text={t('Unknown')}
          textColor={PatternFlyColor.Yellow}
        />
      )
  }
}
