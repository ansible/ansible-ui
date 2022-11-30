import { Button, Split, SplitItem } from '@patternfly/react-core'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'

export function DateCell(props: { value: number | string }) {
  const date = new Date(props.value)
  return (
    <Split hasGutter>
      <SplitItem>{date.toLocaleDateString()}</SplitItem>
      <SplitItem>{date.toLocaleTimeString()}</SplitItem>
    </Split>
  )
}

export function SinceCell(props: {
  value: string | number | undefined | null
  author?: string
  onClick?: () => void
  t?: (t: string) => string
}) {
  let { t } = props
  t = t ? t : (t: string) => t
  const { author, onClick } = props
  const [dateTime, setDateTime] = useState<string | null>(null)
  useEffect(() => {
    if (typeof props.value === 'number') {
      setDateTime(DateTime.fromMillis(props.value).toRelative())
    } else if (props.value) {
      setDateTime(DateTime.fromISO(props.value).toRelative())
    }
    const timeout = setInterval(() => {
      if (typeof props.value === 'number') {
        setDateTime(DateTime.fromMillis(props.value).toRelative())
      } else if (props.value) {
        setDateTime(DateTime.fromISO(props.value).toRelative())
      }
    }, 1000)
    return () => clearTimeout(timeout)
  }, [props.value])
  if (props.value === undefined) return <></>
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {dateTime}
      {author && <span>&nbsp;{t('by')}&nbsp;</span>}
      {onClick ? (
        <Button variant="link" isInline onClick={onClick}>
          {author}
        </Button>
      ) : (
        <span>{author}</span>
      )}
    </span>
  )
}
