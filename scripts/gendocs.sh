#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR/..

OUT=./framework/docs

components=("BulkActionDialog PageFramework PageHeader PageLayout")

echo "[Ansible UI Framework](https://github.com/ansible/ansible-ui/blob/main/framework/README.md#ansible-ui-framework) ▸ Components" > $OUT/Components.md
echo "" >> $OUT/Components.md
echo "# Ansible UI Components" >> $OUT/Components.md
echo "" >> $OUT/Components.md


for component in ${components}
do
  echo $component
  ./node_modules/.bin/jsdoc2md ./framework/${component}.tsx --configure ./jsdoc2md.json > $OUT/${component}.md
  sed -i -e '1d' "$OUT/${component}.md"
  sed -i -e -n '/^## /,$p' "$OUT/${component}.md"
  sed -i -e "s/<code>/\`/" "$OUT/${component}.md"
  sed -i -e "s/<\/code>/\`/" "$OUT/${component}.md"
  sed -i -e "s/<\/code>/\`/" "$OUT/${component}.md"
  sed -i -e "s/<p>//" "$OUT/${component}.md"
  sed -i -e "s/<\/p>//" "$OUT/${component}.md"
  sed -i -e '/^\*\*Kind\*\*/d' "$OUT/${component}.md"
  sed -i -e '/^<a/d' "$OUT/${component}.md"
  sed -i -e "s/&lt;/</" "$OUT/${component}.md"
  sed -i -e "s/&gt;/>/" "$OUT/${component}.md"
  ./node_modules/.bin/prettier --write "$OUT/${component}.md"
  sed -i -e "1s/(.*//" "$OUT/${component}.md"
  sed -i -e "1s/## /# /" "$OUT/${component}.md"
  sed -i -e "s/\*\*Example\*\*/## Example/" "$OUT/${component}.md"
  sed -i -e "s/\`js/\`tsx/" "$OUT/${component}.md"
  sed -i -e "s/\`Array.<\(.*\)>\`/\`\1[]\`/" "$OUT/${component}.md"
  sed -i -e "s/\`Array(\(.*\))\`/\`\1[]\`/" "$OUT/${component}.md"
  sed -i -e "s/() ⇒//" "$OUT/${component}.md"

  echo "[Ansible UI Framework](https://github.com/ansible/ansible-ui/blob/main/framework/README.md#ansible-ui-framework) ▸ [Components](https://github.com/ansible/ansible-ui/blob/main/framework/docs/components.md#Ansible-UI-Components) ▸ ${component}" > temp.md
  cat "$OUT/${component}.md" >> temp.md
  rm -f "$OUT/${component}.md"
  mv temp.md "$OUT/${component}.md"

  echo "- [${component}](https://github.com/ansible/ansible-ui/blob/main/framework/docs/${component}.md#${component})" >> $OUT/Components.md
done

rm -f $OUT/*.md-e
rm -f $OUT/*.md-n
./node_modules/.bin/prettier --write $OUT/*.md