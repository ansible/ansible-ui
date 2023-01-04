# Docker

The latest version of the Ansible UI can be run locally using docker.

```
docker run --rm -e PORT=4321 -p 4321:4321 quay.io/ansible/ansible-ui
```

Then goto [https://localhost:4321](https://localhost:4321)
