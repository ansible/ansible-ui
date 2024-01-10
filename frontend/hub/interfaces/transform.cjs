// @ts-nocheck
/* eslint-disable @typescript-eslint/no-empty-interface */
console.log('Running script...');

const fs = require('fs');
const path = require('path');

const filePrefix = '';

// Specify the path to your JSON file
const filePath = path.join(__dirname, 'swagger.json');

function add(string, depth) {
  return depthString(depth) + string + '\n';
}

let notCreated = [];

function addComment(string, depth) {
  let resString = '';
  if (string.includes('\n')) {
    resString += add('/*', depth);
    resString += add(string, depth);
    resString += add('*/', depth);
    return resString;
  } else {
    return add('// ' + string, depth);
  }
}

function schemaKeyToInterface(schemaKey) {
  const myString = schemaKey.replaceAll('.', '');
  let result = myString.charAt(0).toUpperCase() + myString.slice(1);
  return result;
}

function depthString(depth) {
  let string = '';
  for (let i = 0; i < depth; i++) {
    string += '\t';
  }

  return string;
}

function refToObjectKey(ref) {
  const prefix = '#/components/schemas/';
  return ref.slice(prefix.length);
}

function createPathsForSchemas(jsonData) {
  let pathSchemas = {};
  const paths = jsonData.paths;

  let fileContent = '';

  for (var pathKey in paths) {
    try {
      let path = paths[pathKey];

      let responses = null;

      if (path.get?.responses) {
        responses = path.get.responses;
      }

      if (path.responses) {
        responses = path.responses;
      }

      if (responses) {
        let object = responses['200'];
        if (!object) {
          object = responses['201'];
        }
        if (object && object.content) {
          let ref = object?.content['application/json']?.schema?.$ref;
          if (ref) {
            let objKey = refToObjectKey(ref);
            let objName = schemaKeyToInterface(objKey);

            pathSchemas[objName] = {
              path: pathKey,
              objectName: objName,
              objectKey: objKey,
              listItem: searchForListObject(jsonData, objName, objKey, pathKey),
            };

            const listItem = pathSchemas[objName].listItem;

            let listItemName = listItem?.name;
            let listName = objName;

            if (listItem.apiType) {
              if (listItem.apiType == 'hub') {
                listName = 'HubItemsResponse';
              }

              if (listItem.apiType == 'pulp') {
                listName = 'PulpItemsResponse';
              }

              pathSchemas[objName].doNotCreate = true;
            }

            if (listItemName) {
              finalName = `${listName}<${listItemName}>`;
              pathSchemas[listItemName] = {};
              pathSchemas[listItemName].objectName = listItemName;
              pathSchemas[listItemName].listItemOf = {};
              pathSchemas[listItemName].listItemOf.path = pathKey;
              pathSchemas[listItemName].listItemOf.objectName = listName;
              pathSchemas[listItemName].listItemOf.originalObjectName = objName;
            }

            fileContent += add(finalName);
            fileContent += add(pathKey);
            fileContent += add('');
          }
        }
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  const filePath = path.join(__dirname, filePrefix + 'paths-and-objects.txt');
  fs.writeFile(filePath, fileContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log(`File ${filePath} written successfully!`);
    }
  });

  return pathSchemas;
}

function searchForListObject(jsonData, objName, objKey, pathKey) {
  try {
    let value = jsonData.components.schemas[objKey];
    let ref = value?.properties?.results?.items?.$ref;

    let apiType = 'pulp';

    if (!ref) {
      apiType = 'hub';
      ref = value.properties?.data?.items?.$ref;
    }

    if (!ref) {
      return null;
    }

    let newObjKey = refToObjectKey(ref);
    let newObjName = schemaKeyToInterface(newObjKey);

    return { key: newObjKey, name: newObjName, apiType };
  } catch (ex) {
    console.log(ex);
    return null;
  }
}

function serializeObjectInterface(schema, depth, interfaceName, needImport) {
  try {
    let fileContent = '';
    for (var propertyKey in schema.properties) {
      fileContent += add('', 0);
      const property = schema.properties[propertyKey];
      // type, description, format : 'date-time'
      const type = property.type;
      const description = property.description;
      const format = property.format;

      const tabs = '\t\t\t\t';

      if (description) {
        fileContent += addComment(description, depth);
      }

      if (type == 'string') {
        fileContent += add(propertyKey + tabs + ':' + '\t' + 'string;', depth);
        continue;
      }

      if (type == 'number' || type == 'integer') {
        fileContent += add(propertyKey + tabs + ':' + '\t' + 'number;', depth);
        isEmpty = false;
        continue;
      }

      if (type == 'boolean') {
        fileContent += add(propertyKey + tabs + ':' + '\t' + 'boolean;', depth);
        continue;
      }

      if (property.$ref) {
        let objectName = refToObjectKey(property.$ref);
        fileContent += add(propertyKey + '?' + tabs + ':' + '\t' + objectName, depth);
        needImport[objectName] = true;
        continue;
      }

      // rest is unknown - add it only as comment so we are able to expand it without using Omit and create new type
      fileContent += addComment(propertyKey + tabs + ':' + '\t' + 'unknown;', depth);
    }

    return { fileContent };
  } catch (ex) {
    console.log(ex);
    return '';
  }
}

// Read the JSON file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    // Parse the JSON data
    const jsonData = JSON.parse(data);

    const pathSchemas = createPathsForSchemas(jsonData);
    const schemas = jsonData.components.schemas;
    const keys = Object.keys(schemas);

    keys.forEach((schemaKey) => {
      try {
        let needImport = {};
        const schema = schemas[schemaKey];
        const interfaceName = schemaKeyToInterface(schemaKey);
        const filePath = path.join(__dirname, filePrefix + 'generated/' + interfaceName + '.ts');

        let fileContent = '';
        let interfacePath = null;

        fileContent += add('// Autogenerated file. Please do not modify.');
        fileContent += add('');
        fileContent += add(
          '// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.'
        );
        fileContent += add(
          '// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.'
        );
        fileContent += add(
          '// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.'
        );
        fileContent += add('// See readme in folder above for more information.');
        fileContent += add('');

        fileContent += add('/* eslint-disable @typescript-eslint/no-empty-interface */');

        let canCreateFile = true;

        if (pathSchemas[interfaceName]) {
          interfacePath = pathSchemas[interfaceName]?.path;
          if (interfacePath) {
            fileContent += add('');
            fileContent += add('// URL of interface:');
            fileContent += add('// ' + interfacePath);
          } else {
            try {
              interfacePath = pathSchemas[interfaceName].listItemOf?.path;
              let itemOfObjectName = pathSchemas[interfaceName].listItemOf?.objectName;

              fileContent += add('');
              fileContent += add('// URL of interface:');
              fileContent += add('// ' + interfacePath);
              fileContent += add('// Part of response collection ' + itemOfObjectName);
            } catch (ex) {}
          }
        }

        fileContent += add('');
        if (schema.description) {
          fileContent += addComment(schema.description);
        }

        fileContent += add(`export interface ${interfaceName} {`);

        // description
        if (schema?.properties) {
          let serRes = serializeObjectInterface(schema, 1, interfaceName, needImport);
          fileContent += serRes.fileContent;
          isEmpty = serRes.isEmpty;
        }

        fileContent += add('};');

        let fileContent2 = '';

        for (var imported in needImport) {
          fileContent2 += add(`import { ${imported} } from "./${imported}";`);
        }

        fileContent2 += fileContent;

        console.log('writing ' + filePath);

        const pathSchema = pathSchemas[interfaceName];

        let doNotCreate = false;

        if (pathSchema && pathSchema.doNotCreate) {
          doNotCreate = true;
        }

        if (!doNotCreate) {
          fs.writeFile(filePath, fileContent2, 'utf8', (err) => {
            if (err) {
              console.error('Error writing file:', err);
            } else {
              console.log(`File ${filePath} written successfully!`);
            }
          });
        } else {
          notCreated.push({ name: interfaceName, pathSchema: pathSchemas[interfaceName], schema });
        }
      } catch (ex) {
        console.log(ex);
      }
    });

    console.log(notCreated);
    // Use the parsed JSON data
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});
