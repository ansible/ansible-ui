// @ts-nocheck
console.log('Running script...');
console.log('cwd = ' + process.cwd());

import fs from 'fs';


const filesToGenerate = [];
const filesContent = {};

let firstParam = process.argv[2];

// adds one line of string
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
                            let finalName = objName;

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
        
        }catch(error)
        {
            console.log(error);
        }
    }
  
    fs.writeFile('paths-and-objects.txt', fileContent, 'utf8', (err) => {
         
        if (err) {
            console.error('Error writing file:', err);
        } else {
        console.log(`File paths-and-objects.txt written successfully!`);
        }
    });


    return pathSchemas;
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
    }catch(error)
    {
        console.log(error);
        return null;
    }
}

function serializeObjectInterface(schema, depth, interfaceName, needImport)
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
        };


        return { fileContent };
    }catch(error)
    {
        console.log(error);
        return '';
    }
}


try
{
    // Read the JSON file
    fs.readFile('swagger.json', 'utf8', (err, data) => {

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
        
        keys.forEach( (schemaKey) => {
        
            try{
                let needImport = {};
                const schema = schemas[schemaKey];
                const interfaceName = schemaKeyToInterface(schemaKey);
                const filePath = 'generated/' + interfaceName + '.ts';

                let fileContent = '';
                let interfacePath = null;

                fileContent += add('// Modified at ' + new Date().toLocaleString());
                
                if (pathSchemas[interfaceName])
                {
                    interfacePath = pathSchemas[interfaceName]?.path;
                    if (interfacePath)
                    {
                        fileContent += add('// ' + interfacePath);
                    }else
                    {
                        try
                        {
                            interfacePath = pathSchemas[interfaceName].listItemOf?.path;
                            let itemOfObjectName = pathSchemas[interfaceName].listItemOf?.objectName;
                            fileContent += add('// ' + interfacePath);
                            fileContent += add('// Part of response collection ' + itemOfObjectName );
                        }catch(error)
                        {
                            console.log(error);
                        }
                    }

                    if (interfacePath.includes(firstParam))
                    {
                        filesToGenerate.push(interfaceName);
                    }

                    if (!firstParam)
                    {
                        filesToGenerate.push(interfaceName);
                    }
                }
                
                if (schema.description)
                {
                    fileContent += addComment(schema.description);
                }   
        
                fileContent += add(`export interface ${interfaceName} {`);

                // description
                if (schema?.properties)
                {
                let serRes = serializeObjectInterface(schema, 1, interfaceName, needImport);
                fileContent += serRes.fileContent;
                }

                fileContent += add('};');

                let fileContent2 = '';


                for (var imported in needImport)
                {
                    fileContent2 += add(`import ${imported} from "./${imported}";`);
             
                    if (filesToGenerate.includes(interfaceName))
                    {
                        filesToGenerate.push(imported);
                    }
                }
                
                fileContent2 += fileContent;

                filesContent[interfaceName] = fileContent2;
             
            }catch(error)
            {
                console.log(error);
            }
        });
        
        console.log('All done');
        for (var i in filesToGenerate)
        {
            const fileToGenerate = filesToGenerate[i];
            console.log('writing ' + fileToGenerate);
            const fileContent = filesContent[fileToGenerate];

            fs.writeFile(`generated/${fileToGenerate}` + '.ts', fileContent, 'utf8', (err) => {
        
                if (err) {
                    console.error('Error writing file:', err);
                } else {
                console.log(`File ${fileToGenerate} written successfully!`);
                }
            });
        }

    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
    });
}catch(error)
{
    console.log(error);
}
