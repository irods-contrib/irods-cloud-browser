## Docker instructions

A Docker image is now available for testing and use.  The image is built using the Dockerfile included in this project. 
 The image has been pushed to dockerhub and is available at diceunc/rest:gittagversion.  The gittagversion maps to the 
 current release version in the README.md, for example

diceunc/cloudbrowser:4.1.10.0-RC1

Dockerhub can be consulted for available tags.  The location may eventually change, and this will be noted in later releases.


## Configure (optional) browser login presets and SSL negotiation 

Add the irods-cloud-backend-config.groovy file [see](https://github.com/DICE-UNC/irods-cloud-browser/blob/master/irods-cloud-bckend/misc/irods-cloud-backend-config.groovy)  to your /etc/irods-ext directory on the server where the irods-cloud-backend.war  
is running allows limiting of the login page to a preset host/port/zone, presenting only a user and password.  
If this file is not present, or the beconf.login.preset.enabled=false is set, than the login form will allow 
logging in to any iRODS grid.

Place that file in the /etc/irods-ext directory, ensuring that the Tomcat service can read it, and fill in the preset 
data, setting beconf.login.preset.enabled-true.  

This file also sets the SSL negotiation policy between the mid-teir and iRODS.  This is covered in ssl.md.  Note that if your
iRODS server is not configured for SSL, you need to set this property to CS_NEG_REFUSE, otherwise iRODS will try to use SSL and will generate an authentication exception.  You can check Catalina.out in the docker image or iRODS logs and look for SSL exceptions.



The image from dockerhub can be configured when it is run in the following manner:

```

docker run -d --rm -p hostport:8080 -v /etc/irods-ext:/etc/irods-ext  -v /some/dir/cert:/tmp/cert --add-host example.coml:192.168.1.1 diceunc/cloud-browser:4.1.10.0-RC1


```

Other flags, such as restart or resource, are up to you.  

In this run command, a volume must be mapped from the host /etc/irods-ext directory into the container at the same location. 
This is where the configuration properties for cloud browser are set.  An example of the properties file to place on the 
host machine in /etc/irods-ext is available in the irods-cloud-backend-config.groovy.  Included in that config file are 
settings for ssl negotiation.
The second volume mounts a host directory containing an optional ssl certificate with the name server.crt.  If the 
mount is provided, and the cert is named server.crt is provided, it will be added to the keystore of the container.  
This is necessary for self-signed SSL certificates.  This is for SSL connections between the container and iRODS, 
not for SSL access to the container from clients.  The container currently does not handle https connections.  
Rather, it is highly recommended that this is run behind nginx or apache http server via a proxy.  
