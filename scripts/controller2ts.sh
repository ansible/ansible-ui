npx generate-schema projects.json | 
  jq '.properties.results.items' |
  jq --arg title project '. + {title: $title}' |
  npx json2ts --style.singleQuote --no-style.semi --no-additionalProperties