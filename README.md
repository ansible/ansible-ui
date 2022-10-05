# Ansible UI

The UI for the [Ansible Automation Platform](https://www.ansible.com).

A live instance of the latest development version is running at [AnsibleDev.com](https://ansibledev.com).

## Getting Started

1. Prerequisites

   - Node 18.x (recommended)
   - NPM 8.x (recommended)

    Note: The project should with older versions of node and npm but may require regenerating the package-lock.json.

2. Clone Repository
  
    ```
    git clone git@github.com:ansible/ansible-ui.git
    ```

3. Install Package Dependencies

    ```
    npm ci
    ```

4. Start Project

    ```
    npm start
    ```

    This will start the frontend and the backend in parallel.

    The UI will open and load after a few seconds.

5. View the development documentation

   - [Development guide](./docs/DEVELOPMENT.md)
   - [Framework guide](./framework/FRAMEWORK.md) - Framework for building consistent responsive web applications using PatternFly.
