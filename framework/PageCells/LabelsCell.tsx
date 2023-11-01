import { Label, LabelGroup } from '@patternfly/react-core';
import { Link } from 'react-router-dom';

export function LabelsCell(props: { labels: string[] | { name: string; link: string }[] }) {
  return (
    <LabelGroup numLabels={999} style={{ flexWrap: 'nowrap' }}>
      {props.labels.map((label) => (
        <Label
          key={typeof label === 'string' ? label : label.name}
          color={typeof label === 'string' ? undefined : 'blue'}
        >
          {typeof label === 'string' ? label : <Link to={label.link}>{label.name}</Link>}
        </Label>
      ))}
    </LabelGroup>
  );
}
