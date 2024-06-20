Collections allow users to package and distribute playbooks, roles, modules, and plugins. Collections are uploaded into the system and the content of the collection can be only viewed. There are some operations over the collections as whole, but they do not modify important collection content, they modify rather metadata info like signing or if the collection is deprecated.

# Namespaces 

Collections are organized into namespaces. Tuple collection name and namespace can identify the collection quite well - and it contains identifier pulp href, which identifies this object in the pulp. But collection can also be stored in multiple repositories, so identification of collection in particular repository must include repository name as well.

# Collection uploading

There are two simple ways how to upload collection. One is Upload Collection (accessible from collection list). It will accept tarball, that can be downloaded for example from https://galaxy.ansible.com/ui/collections/

Another simple way is using galaxykit -u admin -p admin collection upload <namespace> <name> <version-optional>
But this will create empty collection.

Collection dependencies are harder to upload (what are they, read below).
Here are two ways one to do it. First is using GUI and second using command line (but that may not work anymore).

## Upload collection with dependencies using GUI

Find in galaxy.ansible.com some collection with dependencies. [For example](https://galaxy.ansible.com/ui/repo/published/ansible/posix/)

You can then download any collection that is used by (or using another collections): [link](https://galaxy.ansible.com/ui/repo/published/ansible/posix/dependencies/)

You can download tarball and upload into your local system.


## Upload collection with dependencies using command line

Then you can run command:

```
oci-env pulpcore-manager create-test-collections --strategy=faux --ns=1 --cols=6 --prefix=deptest
```

This will fill the database with the collections wired with dependencies.

# Versioning

Collections can be also versioned. Both Collection and CollectionVersion are stored in pulp. Collection can contains multiple versions. Versions are grouped together by name, namespace and repository name. 

CollectionVersion object contains version and also contains variable is_highest. If true, that object is highest version of collection. So collection list show only highest version of each collection for each repository. So if collection is in multiple repositories, it will be there multiple times - but it will have the same pulp_href, because pulp will store it as single object for better memory management, since this will be object with the same content. Because of this, we must identify collection version keys in table by name, namespace and repository name, not by pulp_href.

This is all accesible from API:

hubAPI`/v3/plugin/ansible/search/collection-versions` 

Collection list shows highest versions of collections, approval list shows every collection version for each repository.

After clicking at collection list item, the Collection detail will appear, which further allows to select version of collection.

# Collection actions

Delete Collection from system                
- deletes collections from every repository

Delete Collection from repository            
- deletes collection from one repository, may cause orphans records in db, because if the collection is deleted from the system entirely, orphan cleanup will run eventualy, but until that, no collection with the same name and namespace cant be uploaded.

Delete Version from system or repository     
- Those two operations are the same as above, but only deletes one version, not all versions.

Sign entire collection or sign version       
- Those two operations signs collection or version.

Deprecate                                    
- Marks collection (not version) as deprecated for one repo. Deprecated collection will not be shown in the collection list, but it will be shown in namespace detail - collection list, where it can be undeprecated. Deprecated collection still sits in its repository and the same collection in other repos will not be deprecated. Deprecation is useful in situations when we dont want to delete collection because of dependencies, but we want to hide it from users.

Upload new version
- This will open upload page, but restricted to particular collection.

Copy version to repositories
- Copies version to selected repositories.

# Collection Detail

## Tab Install

It can be used for downloading tarball, that contains content of the collection and it can be uploaded elsewhere.

## Tab Dependencies

It shows what dependencies collection needs. The ones that are in form of link are collections present in the system. Others are not present.

It also shows what collections uses this collection as dependency. But this is computed from database in actual system. So other collections will not be displayed here, in contrary to dependencies that collection has - those are displayed all, even if they are not in the system.







