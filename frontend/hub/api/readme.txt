
example:
node transform.js <optional url filter>

Requirements: nodejs installed. For example in linux:
sudo apt update
sudo apt install nodejs

transform.js is script that allows to extract schema definitions from swagger.json file, which must be located in the same folder as script.

Extracted schema definitions will be generated into 'generated' folder, which is in the same folder level as script. Copy all generated files you want to use from there into interface folder (script may generated
some additional files that you dont really need).

Also, file 'paths_and_objects.txt' will be generated (overwritten), which contains all found schemas in swagger.json and their respective interfaces. It can be useful for some searching.

You can also filter for URL api paths that you really want to return. For example:

node transform.js /search/collection

which results to console log:
writing CollectionVersionSearchListResponse
writing RepositoryResponse
writing CollectionSummaryResponse
writing PaginatedCollectionVersionSearchListResponseList
