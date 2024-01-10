# HUB HTTP Requests

The HUB backend, specifically the Pulp API, uses an asynchronous task system for some of its operations. When certain HTTP actions are invoked, the Pulp API might return a `202 Accepted` HTTP status. This status indicates that the requested operation has been accepted for processing but hasn't completed yet. To determine the eventual outcome of the action (success, failure, etc.), one needs to interact with the task system, periodically checking the status of the task until it's resolved.

In order to ease the developer experience, it was created the following functions to ease the parse of the task system.

## POST, PATCH, PUT, DELETE actions

For the actions mentioned above, the HUB provides specialized functions that interact with the task system. Using any of these **functions**:

- `hubAPIPost`: Post request to a given URL with the supplied data and handles `202` responses by parsing the task system.
- `hubAPIDelete`: Deletes a resource at a given URL and handles `202` responses by parsing the task system.
- `hubAPIPatch`: Updates a resource at a specified URL with the provided data and handles `202` responses by parsing the task system.
- `hubAPIPut`: Replaces a resource at a given URL with the supplied data and handles `202` responses by parsing the task system.

If a `202` response is received, the `waitForTask` function parses the task system until a definitive status (success or failure) emerges.

For this reason, when interacting with the HUB backend, leveraging these functions for the aforementioned HTTP verbs will eliminate the need to manual effort to interacting with the task system.

## GET actions

For `GET` actions, it's recommended to utilize the hooks from the framework. These hooks, like `useGet`, are integrated with `swr` features. The `useGet` hook notably provides outputs such as `data`, `error`, and `refresh`, which seamlessly integrate with the existing components in the system.
