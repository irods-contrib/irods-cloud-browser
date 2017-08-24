## Docker instructions

A Docker image is now available for testing and use.  The image is built using the Dockerfile included in this project. The image has been pushed to dockerhub and is available at diceunc/rest:gittagversion.  The gittagversion maps to the current release version in the README.md, for example: `diceunc/cloudbrowser:4.1.10.0-RC1`.

Dockerhub can be consulted for available tags.  The location may eventually change, and this will be noted in later releases.


## Configure (optional) browser login presets and SSL negotiation 

Add the [irods-cloud-backend-config.groovy file](https://github.com/DICE-UNC/irods-cloud-browser/blob/master/irods-cloud-bckend/misc/irods-cloud-backend-config.groovy)  to your `/etc/irods-ext` directory on the server where the `irods-cloud-backend.war` is running.  This allows presets on the login page for host/port/zone. If preset, only a user and password are shown.

If presets are not specified, or if `beconf.login.preset.enabled=false` is set, then the login form will allow 
logging in to any iRODS grid.

Place that file in the `/etc/irods-ext` directory on your host machine with permissions that allow Docker to read it and the Docker image will pick up these settings on startup.

This file also sets the SSL negotiation policy between the mid-teir and iRODS.  This is covered in [ssl.md](ssl.md).  Note that if your iRODS server is not configured for SSL, you need to set this property to `CS_NEG_REFUSE`, otherwise iRODS will try to use SSL and will generate an authentication exception.  You can check `Catalina.out` in the Docker image or iRODS logs and look for SSL exceptions.

You can also give a public SSL certificate, if iRODS is configured to use SSL negotiation, and you are using a self-signed certificate.  In order to do this, an additional Docker `-v` mount command can map the file (called `server.crt`) placed in a location on the host machine, into a location seen by the Docker image.  See the [ssl.md](ssl.md) page for more info.

The image from dockerhub can be configured when it is run in the following manner. Note that `--add-host` is necessary to set `/etc/hosts` within Docker to the location(s) of your iRODS server.

### Example with no ssl cert
```
docker run -d -p hostport:8080 -v /tc/irods-ext:/etc/irods-ext  --add-host example.com:192.168.1.1 diceunc/cloud-browser:4.2.0.0-SNAPSHOT
```

### Example specifying a local ssl public key in a file called server.crt

```
docker run -d -p hostport:8080 -v /tc/irods-ext:/etc/irods-ext  -v /some/dir/cert:/tmp/cert --add-host example.com:192.168.1.1 diceunc/cloud-browser:4.2.0.0-SNAPSHOT
```

Other flags, such as restart or resource, are up to you.  

In this run command, a volume must be mapped from the host `/etc/irods-ext` directory into the container at the same location.

This is where the configuration properties for cloud browser are set.  An example of the properties file to place on the 
host machine in `/etc/irods-ext` is available in `irods-cloud-backend-config.groovy`.  Included in that config file are 
settings for SSL negotiation.

The second volume mounts a host directory containing an optional SSL certificate with the name `server.crt`.  If the 
mount is provided, and the cert named `server.crt` is provided, it will be added to the keystore of the container.  
This is necessary for self-signed SSL certificates.  This is for SSL connections between the container and iRODS, 
not for SSL access to the container from clients.  The container currently does not handle https connections.  
Rather, it is highly recommended that this is run behind nginx or apache http server via a proxy.  
