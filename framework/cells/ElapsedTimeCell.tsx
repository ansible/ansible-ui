import { Split, SplitItem } from '@patternfly/react-core'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function ElapsedTimeCell(props: { start?: number | string; finish?: number | string }) {
  const { t } = useTranslation()
  const start = useMemo(() => new Date(props.start ?? 0).valueOf(), [props.start])
  const finish = useMemo(() => new Date(props.finish ?? 0).valueOf(), [props.finish])

  const [elapsed, setElapsed] = useState(finish - start.valueOf())

  useEffect(() => {
    const timeout = setInterval(() => {
      if (start) {
        if (!props.finish) setElapsed(Date.now() - start)
        else setElapsed(finish - start)
      }
    }, 1000)
    return () => clearTimeout(timeout)
  }, [start, finish, props.finish])

  const totalSeconds = Math.floor(elapsed / 1000)
  const seconds = Math.floor(totalSeconds % 60)
  const minutes = Math.floor((totalSeconds / 60) % 60)
  const hours = Math.floor((totalSeconds / 60 / 60) % 24)
  const days = Math.floor(totalSeconds / 60 / 60 / 24)

  if (!start) return <></>
  return (
    <Split>
      {days !== 0 && (
        <SplitItem>
          {days}
          {t('d')}&nbsp;
        </SplitItem>
      )}
      {hours !== 0 && (
        <SplitItem>
          {hours}
          {t('h')}&nbsp;
        </SplitItem>
      )}
      {minutes !== 0 && (
        <SplitItem>
          {minutes}
          {t('m')}&nbsp;
        </SplitItem>
      )}
      {
        <SplitItem>
          {seconds}
          {t('s')}
        </SplitItem>
      }
    </Split>
  )
}
