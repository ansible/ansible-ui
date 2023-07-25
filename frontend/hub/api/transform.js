console.log('Running script...');

const fs = require('fs');
const path = require('path');

const filePrefix = '';

// Specify the path to your JSON file
const filePath = path.join(__dirname, 'swagger.json');

function add(string, depth)
{
    return depthString(depth) + string + '\n';
}

function addComment(string, depth)
{
    let resString = '';
    if (string.includes('\n'))
    {
        resString += add('/*', depth);
        resString += add(string, depth);
        resString += add('*/', depth);
        return resString;
    }else
    {
        return add('//' + string, depth);
    }
}

function schemaKeyToInterface(schemaKey)
{
    const myString = schemaKey.replaceAll('.', '');
    let result = myString.charAt(0).toUpperCase() + myString.slice(1);
    return result;
}

function depthString(depth)
{
    let string = '';
    for (let i = 0; i < depth; i++)
    {
        string += '\t';
    }

    return string;
}


function refToObjectKey(ref)
{
    const prefix = '#/components/schemas/';
    return ref.slice(prefix.length);
}

function createPathsForSchemas(jsonData)
{
    let pathSchemas = {};
    const paths = jsonData.paths;

    let fileContent = '';

    for (var pathKey in paths)
    {
        try
        {
            let path = paths[pathKey];
           

            let responses = null;
           
            if (path.get?.responses)
            {
                responses = path.get.responses;
            }

            if (path.responses)
            {
                responses = path.responses;
            }

            if (responses) {

                    let object =  responses['200'];
                    if (!object)
                    {
                        object = responses['201'];
                    }
                    if (object && object.content)
                    {
                        let ref = object?.content['application/json']?.schema?.$ref;
                        if (ref)
                        {
                           
                            const prefix = '#/components/schemas/';
                            let objKey = refToObjectKey(ref);
                            let objName = schemaKeyToInterface(objKey);
                        
                            pathSchemas[objName] =  { path : pathKey, objectName: objName, objectKey : objKey, listItem: searchForListObject(jsonData, objName, objKey, pathKey) };
                            
                            let listItemName = pathSchemas[objName].listItem?.name;
                            let finalname = objName;

                            if (listItemName)
                            {
                                finalName = `${objName}<${listItemName}>`;
                                pathSchemas[listItemName] = {};
                                pathSchemas[listItemName].objectName = listItemName;
                                pathSchemas[listItemName].listItemOf = {};
                                pathSchemas[listItemName].listItemOf.path = pathKey;
                                pathSchemas[listItemName].listItemOf.objectName = objName;

                            }
                          
                            fileContent += add(finalName);
                            fileContent += add(pathKey);
                            fileContent += add('');
                        }
                    }
            }   
        
        }catch(ex)
        {
            debugger;
        }
    }

    // link items in list paths
    /*for (var pathKey in pathSchemas)
    {
        let obj = pathSchemas[pathKey];

        let listName = obj?.listItem?.name;

        if (!name2) continue;
        debugger;
        let obj2 = pathSchemas[name2];

        if (obj2)
        {
          obj2.path = obj.path;
        }else
        {
            debugger;
        }
    }*/

    
    const filePath = path.join(__dirname, filePrefix + 'paths-and-objects.txt');
    fs.writeFile(filePath, fileContent, 'utf8', (err) => {
         
        if (err) {
            debugger;
            console.error('Error writing file:', err);
        } else {
        console.log(`File ${filePath} written successfully!`);
        }
    });


    return pathSchemas;
}

function createIndexFile(jsonData)
{
    const data = jsonData.components.schemas;
    let fileContent = '';

    for(var key in data)
    {
        // export * from "./RepositoryResponse";
        const interface = schemaKeyToInterface(key);
        fileContent += add(`export * from  "./${interface}";`);
    }

    const filePath = path.join(__dirname, filePrefix + 'api-schemas/index.ts');
    fs.writeFile(filePath, fileContent, 'utf8', (err) => {
         
        if (err) {
            debugger;
            console.error('Error writing file:', err);
        } else {
        console.log(`File ${filePath} written successfully!`);
        }
    });
}

function searchForListObject(jsonData, objName, objKey, pathKey)
{
    try
    {
        let value = jsonData.components.schemas[objKey];
        let ref = value?.properties?.results?.items?.$ref;

        if (!ref)
        {
            ref = value.properties?.data?.items?.$ref;
        }

        if (!ref)
        {
            return null;
        }

        let newObjKey = refToObjectKey(ref);
        let newObjName = schemaKeyToInterface(newObjKey);

        return { key : newObjKey, name : newObjName };
    }catch(ex)
    {
        debugger;
        return null;
    }
}

/*
function getPathFromSchemaListItem(pathSchemas, name)
{
    let obj = null;
    


    for (var key in pathSchemas){ 
        let schema = pathSchemas[key];

        if (key == 'PaginatedansibleCollectionVersionResponseList' && name == 'CollectionVersionSearchListResponse')
        {
            debugger;
        }
        
        if (schema.listItem?.name == name)
        {
            return {path : schema.path, origin : schema.objectName};
        }
 
    }

    return null;
}*/



function serializeObjectInterface(schema, depth, interface, needImport)
{
    try
    {


        let fileContent = '';

        for (var propertyKey in schema.properties) {
            const property = schema.properties[propertyKey];
            // type, description, format : 'date-time'
            const type = property.type;
            const description = property.description;
            const format = property.format;

            const tabs = '\t\t\t\t';
            if (description)
            {
                fileContent += addComment(description, depth);
                
            }else
            {
                //fileContent += add('// no description', depth);
            }

            if (property.allOf)
            {

            }

            if (type == 'string')
            {
                fileContent += add(propertyKey + tabs + ':' + "\t" + 'string;', depth);   
                continue;
            }

            if (type == 'number' || type == 'integer')
            {
                fileContent += add(propertyKey +tabs + ':' + "\t" + 'number;', depth); 
                continue;
            }

            if (type == 'boolean')
            {
                fileContent += add(propertyKey + tabs + ':' + "\t" + 'boolean;', depth);    
                continue;
            }

            if (property.$ref)
            {
                let objectName = refToObjectKey(property.$ref);
                fileContent += add(propertyKey + tabs + ':' + "\t" + objectName, depth); 
                needImport[objectName] = true;
                continue;
            }


            if (type == 'object')
            {
               
               /* fileContent += add('{', depth);
                if (property) { 
                    debugger;
                    fileContent += add(serializeObjectInterface(property), depth + 1 ); 
                }
                fileContent += add('}', depth);
                */
            }
        };


        return { fileContent };
    }catch(ex)
    {
        debugger;
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
    createIndexFile(jsonData);
    const schemas = jsonData.components.schemas;
    const keys = Object.keys(schemas);
    
    keys.forEach( (schemaKey) => {
      
        try{
            let needImport = {};
            const schema = schemas[schemaKey];
            const interface = schemaKeyToInterface(schemaKey);
            const filePath = path.join(__dirname, filePrefix + 'api-schemas/' + interface + '.ts');

            let fileContent = '';
            let interfacePath = null;

            fileContent += add('// Autogenerated file. Please do not modify.');
            fileContent += add('// Modified at ' + new Date().toLocaleString());
            
            if (pathSchemas[interface])
            {
                interfacePath = pathSchemas[interface]?.path;
                if (interfacePath)
                {
                    fileContent += add('// ' + interfacePath);
                }else
                {
                    try
                    {
                        interfacePath = pathSchemas[interface].listItemOf?.path;
                        let itemOfObjectName = pathSchemas[interface].listItemOf?.objectName;
                        fileContent += add('// ' + interfacePath);
                        fileContent += add('// Part of response collection ' + itemOfObjectName );
                    }catch(ex)
                    {
                        debugger;
                    }
                }
            }
            
            if (schema.description)
            {
                fileContent += addComment(schema.description);
            }   
    
            fileContent += add(`export interface ${interface} {`);

            // description
            if (schema?.properties)
            { 

              let serRes = serializeObjectInterface(schema, 1, interface, needImport);
              fileContent += serRes.fileContent;
            }

            fileContent += add('};');

            let fileContent2 = '';


            for (var imported in needImport)
            {
                fileContent2 += add('import { ' + imported +' } from "./index";');
            }
            
            fileContent2 += fileContent;

            console.log('writing ' + filePath);
            fs.writeFile(filePath, fileContent2, 'utf8', (err) => {
         
                if (err) {
                    debugger;
                    console.error('Error writing file:', err);
                } else {
                console.log(`File ${filePath} written successfully!`);
                }
            });
        }catch( ex)
        {
            debugger;
        }
    });
    
    // Use the parsed JSON data

  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});
