# Tasks in Backend

Pulp has inner tasks system. Many operation that modify API operation (post and similar) return task info instead of OK message.

For example if we want to delete collection, we send DELETE request to delete test3 collection in namespace ns1:
/api/automation-hub/v3/plugin/ansible/content/published/collections/index/ns1/test3/

The result is 202 Accepted and content:
{
    "task": "/api/automation-hub/pulp/api/v3/tasks/018a41d4-161c-7edf-bcaa-6246188c9a7f/"
}

Then we can ask for this task:
/api/automation-hub/v3/tasks/018a41d4-161c-7edf-bcaa-6246188c9a7f/

Result can be:
<pre>
{
    "pulp_id": "018a41d4-161c-7edf-bcaa-6246188c9a7f",
    "name": "pulp_ansible.app.tasks.deletion.delete_collection",
    "created_at": "2023-08-29T15:05:32.957732Z",
    "updated_at": "2023-08-29T15:05:32.957752Z",
    "finished_at": null,
    "started_at": null,
    "state": "waiting",
    "error": null,
    "worker": {
        "name": "706@fcdf561fdb22",
        "missing": false,
        "last_heartbeat": "2023-08-29T15:05:28.699393Z"
    },
    "parent_task": null,
    "child_tasks": [],
    "progress_reports": []
}
</pre>

UI is waiting for task but after some another repeated calls with delay for several seconds, API returns state: "completed" with some addional information and we know that now, the operation is finished.

# Synchronization in tests
There is galaxykit command:
task wait all

This will get the task queue and if its empty, it will continue, otherwise it will wait until its empty. This can be very useful in tests. Every galaxykit operation that modifies something returns when the task is queued, but not completed yet. So we need to sync using task wait all, because some galaxykit operations are dependent on each other. For example - create namespace, upload collection using this namespace.
Without sync, the collection will try to upload to namespace that not exist yet. So after every galaxykit modify operation, there has
to be task wait all. The exception is group of independent modify operation - for example creating several collections. In that case, task
wait all in the end is enough. 

examples:

cy.galaxykit('namespace create namespace1');
cy.galaxykit('task wait all');
cy.galaxykit('collection upload namespace1 collection1');
cy.galaxykit('collection upload namespace1 collection2');
cy.galaxykit('collection upload namespace1 collection3');
cy.galaxykit('task wait all');

We can also use this task wait all to better synchronize UI operations, if the synchronization is missing in the app. But the application
should notify user that the task is running or completed. If it is however clearly not doing that, its necessary that test should wait for task.


# Tasks in UI

Tasks in UI can show user what tasks are currently queued in backend. It shows more info in task detail.
Task detail info can be sometimes used in alerts - for example when some long task starts, user can notified with link to the running task.

# Create long running task
This may be useful, for example for testing of action Stop task. It can be done in [python remote console](Hub-console-connect-backend.md)

Command for console is:

Task.objects.create(state="running", name="iamrunning")

Another way how to do it is for example from Kersom and Salma using UI:

create a new remote, then create a new repository and connect it with the remote. Then sync it and it creates a sync task

