# Page form


The PageForm component helps manage forms across various projects like AWX, HUB, and EDA by using project-specific error adapters. These adapters are integrated into custom PageForm wrappers (like AwxPageForm, HubPageForm, EdaPageForm) to ensure standardized error handling. Developers can seamlessly integrate this feature into their projects by importing and using the appropriate wrapper tailored to their project's needs.

[PageForm](https://github.com/ansible/ansible-ui/blob/9ee9e0d4711c70987d5db583e45b30d03fa3ddcd/framework/PageForm/README.md)

# PageTable

PageTable component has build this functionality by itself (along with useHubView - or other views). It will show any error or loading status.

# UseGet

It is recommended to use useGet instead of useGetRequest. useGetRequest should be use only in situation when useGet can not be used, for example when we are writing handler for some action and the action must load some additional data before doing POST (PATCH, PUT...).

The difference between to is that useGetRequest returns getRequest that can be used asynchronously, usualy in useEffect when something changes or in some action. On the other hand, useGet is hook that runs immidiately when it is called and store the result inside, so we dont need any useEffect or custom state handling of result.

useGet reruns every time the URL changes. If the URL is empty, it does not run at all. This can be used in our advantage - if we need sequence of useGet that depends on each other, we pass empty URL to useGet when previous data are not loaded.

useGet returns data (actual loaded data, or undefined if not loaded yet), error (error from API if occured), refresh (handler for refreshing data).

We are using the result of useGet for error handling. Usage:

const { data, error, refresh } = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/`);

  if (error || data?.data.length == 0) {
    // For other project it should be for example AwxError
    return <HubError error={error} handleRefresh={refresh} />;
  }

if (!data) {
    return <LoadingPage />;
  }

This should be implemented for every use get, but beware of early returning from component, you must first call all hooks, so this return should be done after all hooks are called. Dot forget that if useGet should return some data, which is the case for some details and the data are empty or count 0 (for requests that return list), it should be also handled.   

# Actions

Actions in forms or in PageTable are covered by try catch in the framework itself, so if exception occured, it will be handled.

# Other situations

Those will arise usually in modals. Its recomended to use useGet here. For actions, they must have try catch coverage and manual error handling - for example using error state and displaying the error in the modal.

Loading can be implemented using button - isLoading:

```
 <Button
          key="select"
          variant="primary"
          id="select"
          onClick={() => {
            void copyToRepositories();
          }}
          isDisabled={selectedRepositories.length == 0}
          isLoading={isLoading}
  >
```





