# How and Where to Persist Data
* Volumes are stored in a part of the host filesystem which is `managed by Docker`. Volumes are the best way to persist data in Docker.

* Bind mounts may be stored anywhere on the host system. They may even be important system files or directories. `Non-Docker processes on the Docker host or a Docker container can modify them at any time`

* tmpfs mounts are stored in the `host system’s memory` only, and are never written to the host system’s filesystem.


## Volume
* Create from `docker volume create` command, Docker can create a volume `during container or service creation`
* It is stored in a directory on the Docker host
* It is managed by Docker and are isolated from the core functionality of the host machine
* A given volume can be mounted into `multiple containers simultaneously`
* Volumes also support the use of `volume drivers`, which allows you to store your data on remote host or cloud provider


## Bind Mounts
* A file or directory on host machine is directly mounted into the Docker container
* The file or directory is `referenced by its full path` on the host machine
* The file or directory does not need to exist on the docker host already, it is `created on demand` if it does not yet exist
* Bind are very performant, but they rely on the host machine's filesystem having a specific directory structure (?)


## Storage Driver
Docker uses storage drivers to manage the contents of the image layers and the writable container layer. Each storage driver handles the implementation differently, but all drivers use stackable image layers and the copy-on-write (CoW) strategy

Storage drivers allow you to create data in the writable layer of your container. The files won’t be persisted after the container is deleted, and `both read and write speeds are low` (!)

* A Docker image is built up from `a series of layers`. Each layer represents an instruction in the image’s Dockerfile. `Each layer except the very last one is read-only`

* The layers are `stacked on top of each other`. When you create a new container, you add a `new writable layer` on top of the underlying layers, This layer is often called the `container layer`. All changes made to the running container, such as writing new files, modifying existing files, and deleting files, are written to this thin writable container layer

* The major difference between a container and an image is the `top writable layer`

* When the container is deleted, `the writable layer is also deleted`. The underlying image remains unchanged

### The copy-on-write (CoW) strategy
*  If a file or directory exists in a lower layer within the image, and another layer (including the writable layer) needs read access to it, it just uses the `existing file`

* `The first time` another layer needs to modify the file (when building the image or running the container), the file is `copied into that layer and modified`