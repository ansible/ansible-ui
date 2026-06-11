import { Label, LabelGroup } from '@patternfly/react-core';
import { PromptDetail } from './PromptDetail';
import { Label as ILabel } from '../../../../interfaces/Label';

interface ITag {
  name: string;
  value?: string;
  label?: string;
}
export function NodeTagDetail({
  label,
  nodeTags = [],
  templateTags = [],
}: {
  label: string;
  nodeTags: ITag[];
  templateTags: ITag[];
}) {
  const tags = nodeTags.length > 0 ? nodeTags : templateTags;
  const isMatch = arraysMatch(tags, templateTags);

  return (
    <PromptDetail
      label={label}
      isEmpty={tags?.length === 0}
      isOverridden={!isMatch}
      overriddenValue={templateTags.map((tag) => tag.name).join(', ')}
    >
      <LabelGroup>
        {tags.map((tag) => (
          <Label key={tag.name}>{tag.name}</Label>
        ))}
      </LabelGroup>
    </PromptDetail>
  );
}
function arraysMatch(arr1: ILabel[] | { name: string }[], arr2: ILabel[] | { name: string }[]) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const idSet1 = new Set(arr1.map((obj) => obj.name));
  const idSet2 = new Set(arr2.map((obj) => obj.name));

  if (idSet1.size !== idSet2.size) {
    return false;
  }
  for (const item of idSet1) {
    if (!idSet2.has(item)) {
      return false;
    }
  }
  return true;
}
