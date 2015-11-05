# Installation of the iRODS Cloud Browser

For version 1.0.0, a formal package is not yet supported (this is in the next milestone).  The install is manual, but fairly straight-forward.  The
various files referred to (.war, .zip) can be found on the appropriate release here:

https://github.com/DICE-UNC/irods-cloud-browser/releases

## 1 Deploy the .war file

Deploy the irods-cloud-backend.war file to your web container, typically Tomcat.  This deploys the backend REST service that will connect to iRODS.

## 2 Deploy the front-end code

The html, javascript, and image assets are available in the released irods-cloud-frontend.zip file.  These files should be deployed to the ROOT folder of the Apache HTTP or a similar web server.  


## 3 (optional) proxy the back end via Apache HTTP or other server

It is recommended that Tomcat or other web container be firewalled and proxied behind Apache or other web server.  For example:

http://httpd.apache.org/docs/2.2/mod/mod_proxy_ajp.html


## 4 Configure the front end to your deployed back-end container

The front end javascript code makes ajax calls to the back end that is configured in irods-cloud-frontend/app/components/globals.js on 
line 17

```Javascript

  /*
         NB put the trailing slash in the HOST variable!
         */
        // var HOST = "/irods-cloud-backend/";
        var HOST = "http://"+location.hostname+":8080/irods-cloud-backend/";
        //var HOST = "http://dfc-test-tomcat1.edc.renci.org:8080/irods-cloud-backend/";
        //var HOST = "http://dfc-ui-test.renci.org:8080/irods-cloud-backend/";
        f.backendUrl = function (relativeUrl) {

            var myUrl = HOST + relativeUrl;
            $log.info("computed URL:" + myUrl);
            return myUrl;
        };


```

The HOST variable needs to be set to the http address of the back end. In step 3, a proxy pass was configured, in this step
 set the HOST variable to the irods-cloud-backend context as it is exposed on your HTTP server, with a trailing slash.
 
 
## 5 Optionally configure browser presets

Adding the irods-cloud-backend-config.groovy file to your /etc directory on the server where the irods-cloud-backend .war 
is running allows limiting of the login page to a preset host/port/zone, presenting only a user and password.  If this
file is not present, or the beconf.login.preset.enabled=false is set, than the login form will allow logging in to any iRODS 
grid.

Place that file in the /etc directory, ensuring that the Tomcat service can read it, and fill in the preset data, setting beconf.login.preset.enabled-true

```
*Backend app configuration
 *For app specific configs, prefix with beconf. for consistency 
 */


// use login preset
beconf.login.preset.host='localhost'
beconf.login.preset.port=1247
beconf.login.preset.zone='tempZone'
beconf.login.preset.auth.type='STANDARD'
beconf.login.preset.enabled=true

```

## 6 Restart the HTTP service and test

If the front-end code is properly configured to point to the back-end rest service, one should be able to log in to the application
by browsing to http(s)://hostnameforapachefrontend/irods-cloud-frontend

## 7 If you run into trouble!

This is the first roll-out.  If you experience any problems, please put data and any logs into GitHub at:
https://github.com/DICE-UNC/irods-cloud-browser/issues


Be sure to scrub any information you do not want on the web!  
