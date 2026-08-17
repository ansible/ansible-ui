import { Label, LabelGroup } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { LabelValue } from '../PageTable/PageTableColumn';

type LabelWithLink = { name: string; link: string };

type LabelsWithLinksProps = {
  labels?: never;
  labelsWithLinks: LabelWithLink[];
  numLabels?: number;
  noWrap?: boolean;
};

type LabelsProps = {
  labels: LabelValue[];
  labelsWithLinks?: never;
  numLabels?: number;
  noWrap?: boolean;
};

export function LabelsCell(props: Readonly<LabelsProps | LabelsWithLinksProps>) {
  return (
    <LabelGroup
      numLabels={props.numLabels ?? 999}
      style={props.noWrap ? { flexWrap: 'nowrap' } : undefined}
    >
      {props.labels
        ? props.labels.map((label) => {
            if (typeof label === 'string') {
              return <Label key={label}>{label}</Label>;
            }
            return (
              <Label
                key={label.label}
                color={label.status ? undefined : label.color}
                icon={label.icon}
                variant={label.variant}
                status={label.status}
              >
                {label.label}
              </Label>
            );
          })
        : props.labelsWithLinks.map((labelWithLink) => (
            <Label
              color="blue"
              isClickable
              key={labelWithLink.name}
              render={({ content, className }) => (
                <Link className={className} to={labelWithLink.link}>
                  {content}
                </Link>
              )}
            >
              {labelWithLink.name}
            </Label>
          ))}
    </LabelGroup>
  );
}
