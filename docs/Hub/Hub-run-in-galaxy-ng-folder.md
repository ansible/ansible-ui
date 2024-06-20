There are some situation when we need to run backend without oci-env in galaxy_ng folder.
You need compose.env to be filled just like compose.env from oci-env

This approach in galaxy_ng without oci_env is now obsolete, but we may return to it in future.

https://ansible.readthedocs.io/projects/galaxy-ng/en/latest/dev/oci_env/
https://ansible.readthedocs.io/projects/galaxy-ng/en/latest/dev/docker_environment/

Resume:

### First you must kill oci-env in oci_env folder: 

oci-env compose down

### Then you move into galaxy_ng folder:

Commands:

Container build           ./compose build

Container run             ./compose up

Container down            ./compose down

you can also run ./compose down --volumes

to clean the volumes (clean db). The compose just runs docker commands.

### Database setup. 

This command will run migrations:

make docker/all 