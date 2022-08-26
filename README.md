# Ansible UI

- [Prerequisites](#prerequisites)
  - [Node 18](#node-18)
  - [NPM 8](#npm-8)
- [Development](#development)
  - [Clone](#clone)
  - [Install](#install)
  - [Test](#test)
  - [Run](#run)
- [VSCode](#vscode)

## Prerequisites

### [Node 18](https://nodejs.org)

Check the node version.

```
node -v
```

On OSX you can setup [homebrew](https://brew.sh/).

Then you can install a specific node version:

```
brew install node@18
brew link node@18
```

You can upgrade the node version with:

```
brew upgrade node@18
```

### NPM 8

Each node version comes with a specific version of NPM.

- Check Version

  ```
  npm -v
  ```

- Install/Update to version 8.x

  ```
  npm i -g npm@8
  ```

## Development

### Clone

```
git clone https://github.com/jamestalton/ansible
```

### Install

```
npm ci
```

### Test

```
npm test
```

### Run

```
npm start
```

This will start the frontend and the backend in parallel.

The UI will open and load after a few seconds.

## VSCode

VSCode is the recommended way to develop for the project.

Opening the `ansible.code-workspace` should prompt to install recommended extensions.
