#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR/..

OUT=./framework/docs

components=("PageHeader PageLayout BulkActionDialog")
for component in ${components}
do
  echo $component
  ./node_modules/.bin/jsdoc2md ./framework/${component}.tsx --configure ./jsdoc2md.json > $OUT/${component}.md
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
done

rm -f $OUT/*.md-e
# ./node_modules/.bin/prettier --write $OUT/*.md