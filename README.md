# Ansible UI / Page Framework

## Prerequisites

### [Node.js](https://nodejs.org)

#### Install Node 18

Check the node version

```
node -v
```

On OSX you can setup [homebrew](https://brew.sh/).

Then you can install a specific node version:

```
brew install node@18
brew link node@18
```

You can upgrade the node version with

```
brew upgrade node@18
```

### Install NPM 8

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

1. Clone repository

   ```
   git clone https://github.com/jamestalton/ansible
   ```

2. Install dependencies

   ```
   npm ci
   ```

3. Start the development services

   ```
   npm start
   ```

   This will start the frontend and the backend in parallel.
