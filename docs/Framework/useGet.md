[useGet](https://github.com/ansible/ansible-ui/blob/main/frontend/common/crud/useGet.tsx)

When using useGet evaluate the need to add error, refresh or isLoading state. For details page, for instance that would display an error message if the user changes an URL to a non valid resource.



```js
  const

{data: task, error, refresh}

= useGet<Task>(params.id ? pulpAPI`/tasks/${params.id}` : '');

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!task) return <LoadingPage breadcrumbs tabs />;

```
