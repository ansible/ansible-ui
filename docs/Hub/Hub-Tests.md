# How to make tests running

There may be problems with login. Note that tests must run in CI and they must also run in local environment, so we can check if they work
before they are pushed to CI.

Login uses environment variables `HUB_USERNAME` and `HUB_PASSWORD`.

In local, admin has:

user: `admin`  
password: `admin`

In CI, admin has:

user: `admin`  
password: `password`

Its because CI is running against galaxy server, which has different settings. You don't need to do anything to be able to run tests in CI, however, for local environment, set the env variable. In shell, where you are running tests, type:

```
export HUB_PASSWORD='admin'

npm run e2e:hub
```

This is described in readme.

# Rules for writing tests:

Tests will run in parallel, we must expect messy database full of data that does not 
“belong” to the current test, so we can not test sorting, paging and stuffs like that. We will have to search directly for items in tables.

All items must have unique primary key - generated randomly with long enough number to avoid conflicts. Beware of prefix problems - if the generated string will be prefix of another string, it may cause problems because tests are looking usually for subtext. We may use some guid like generator, that guarantees fixed length of generated string. Random number generator generates variable length, which can cause substrings problem.

So:
in before:
cy.galaxykit('collection remove collection1');

Then in test:
cy.galaxykit('collection upload collection1');

will not work because even if collection1 is removed before test run, the same test may run in parallel and upload collection1, then second test will run and collection1 will fail to be uploaded saying that collection1 already exist.

So you need to do something like this:
const collection = 'e2e_test_' + randomName();
cy.galaxykit(`collection upload ${collection}`);

Every object in the database has to be created this way, collections, namespaces, repositories, remotes, execution environments. Everything.
We can only rely on things that are present in database as default, which is for example published repository, staging and rejected repository. So we can upload collections to published if they are unique every upload.

Clean up items after tests (not bulk clean up, but only delete items that test created). Cleaning up can not be down in it, data must be cleaned in after section (possibly using galaxykit), we can not rely on cleaning in the end of the it.

Use galaxykit to fill unnecessary data (and for cleanup). Use only UI operations once 
and the rest will be done by galaxykit.

Login should be using API call, not using manual UI login - manual login should be tested only 
once.

"It" sections should be able to run in parallel, so they can not rely on previous its and each randomly generated item name should be used only once in each test, so test "its" are isolated.

Test server should be cleaning whole data from time to time, because we can not guarantee that there will not be any memory leaks (uncleaned data).

Sporadic failures are failures that occur only sometimes and usualy on the CI in github. How to avoid them as much as possible? Those failures often are caused by timing issues. For example we expect some operation to be done, while it can take longer in CI and it fails. There are two basic ways how to sync operations. First is using intercept, which waits for the API call to be done. This is not best way, because between intercept and render can be some another time delay and page will not be fully rendered after intercept. Second way is to use test for element occurences. For example wait for alert that informs that operation is done. In the case of modals, the modal usually disappears without alert, so we need to test if error message occured, or the user is redirected to another page - so test if the modal dissapeared.

# Synchronization
This is EXTREMELY IMPORTANT. It is described in task system:
### [Tasks](Hub-Tasks.md) 
 
