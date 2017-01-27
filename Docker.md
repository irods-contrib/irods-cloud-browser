## Docker instructions

A Docker image is now available for testing and use.  The image is built using the Dockerfile included in this project.  The image has been pushed to dockerhub and is available at diceunc/rest:gittagversion.  The gittagversion maps to the current release version in the README.md, for example

diceunc/rest:4.1.10.0-RC1

Dockerhub can be consulted for available tags.  The location may eventually change, and this will be noted in later releases.

The image from dockerhub can be configured when it is run in the following manner:

```

docker run -d --rm -p hostport:8080 -v /etc/irods-ext:/etc/irods-ext  -v /some/dir/webdavcert:/tmp/cert --add-host example.coml:192.168.1.1 diceunc/rest:4.1.10.0-RC1


```

Other flags, such as restart or resource, are up to you.  

In this run command, a volume must be mapped from the host /etc/irods-ext directory into the container at the same location. This is where the configuration properties for irods-rest are set.  An example of the properties file to place on the host machine in /etc/irods-ext is available under /etc in this project source.  Included in that config file are settins for ssl negotiation, and a flag that forces checksums to be computed on upload.

The second volume mounts a host directory containing an optional ssl certificate with the name server.crt.  If the mount is provided, and the cert is named server.crt is provided, it will be added to the keystore of the container.  This is necessary for self-signed SSL certificates.  This is for SSL connections between the container and iRODS, not for SSL access to the container from clients.  The container currently does not handle https connections.  Rather, it is highly recommended that this is run behind nginx or apache http server via a proxy.  