# Installation of the iRODS Cloud Browser

For version 1.0.0, a formal package is not yet supported (this is in the next milestone).  The install is manual, but fairly straight-forward.  The
various files referred to (.war, .zip) can be found on the appropriate release here:

https://github.com/DICE-UNC/irods-cloud-browser/releases

## 1 OS Setup

These instructions are for Ubuntu 14.04, but hopefully give you an idea;

You will need Tomcat7, apache and the unzip and wget command's for the example installation worklow below

`apt-get install tomcat7 tomcat7-docs tomcat7-admin tomcat7-user apache2 apache2-utils unzip wget`

## 2 Download source files

Based on the 1.0 release you do the following;

```
wget https://github.com/DICE-UNC/irods-cloud-browser/releases/download/1.0.0-RELEASE/irods-cloud-backend-config.groovy
wget https://code.renci.org/gf/download/frsrelease/239/2717/irods-cloud-backend.war 
wget https://code.renci.org/gf/download/frsrelease/239/2712/irods-cloud-frontend.zip 
md5sum irods-cloud-backend.war 
c15680b1685b67dd1d1cf6e374ff4159  irods-cloud-backend.war
md5sum irods-cloud-frontend.zip 
f222842e3a33c958c92587c04084e7cd  irods-cloud-frontend.zip
```

## 3 Set a manager for tomcat so you can upload the war file

```
diff /etc/tomcat7/tomcat-users.xml /etc/tomcat7/tomcat-users.xml_orig
36,37d35
<   <role rolename="manager-gui"/>
<   <user username="manager" password="iRODSisGoodRods" roles="manager-gui"/>
```

## 4 Deploy the .war file

Deploy the irods-cloud-backend.war file to your web container, typically Tomcat.  This deploys the backend REST service that will connect to iRODS.

1. log into the tomcat manager with the user you created and upload the file, e.g. http://irods-cloud:8080/manager/html
2. after deploy button pressed and a short wait, you should see an '/irods-cloud-backend' application path created

## 5 Deploy the front-end code

The html, javascript, and image assets are available in the released irods-cloud-frontend.zip file.  These files should be deployed to the ROOT folder of the Apache HTTP or a similar web server.  

e.g. for Apache on Ubuntu 14.04;

```
mv irods-cloud-frontend.zip /var/www/
cd /var/www/html
unzip irods-cloud-frontend.zip
rm irods-cloud-frontend.zip
```



## 6 (optional) proxy the back end via Apache HTTP or other server

It is recommended that Tomcat or other web container be firewalled and proxied behind Apache or other web server.  For example:

http://httpd.apache.org/docs/2.2/mod/mod_proxy_ajp.html

### Setting up Apache to proxy the connection to Tomcat via AJP 

### Modify Tomcat's `server.xml` configuration file by adding/uncommenting the following line:
   ```
   <Connector port="8009" protocol="AJP/1.3" />
   ```

### Install and enable the Apache `proxy_ajp` and `proxy` modules.

```
a2enmod proxy
a2enmod proxy_ajp
a2enmod proxy_http
```

### Create an appropriate Apache configuration file (non SSL).

   ```
   <VirtualHost *:80>
     <Proxy *>
        Order deny,allow
        Allow from all
     </Proxy>

     ProxyPassMatch               /irods-cloud-backend/(.*)       ajp://localhost:8009/irods-cloud-backend/$1
   </VirtualHost>
  ```

### another example using SSL *only* aiming for a good SSL Rating;

```
#put the following in /etc/apache2/conf-available/ssl.conf
<IfModule mod_ssl.c>
   SSLSessionCache shmcb:/tmp/www-frontend/ssl_scache(512000)
   #SSLMutex    file:/www/tmp/www-frontend/logs/ssl_mutex
   #SSLLog      /www/tmp/www-frontend/logs/ssl.engine_log


   SSLVerifyClient    none
   SSLVerifyDepth    10
   SSLCompression   off
   SSLProtocol all -SSLv2 -SSLv3
   SSLHonorCipherOrder on
   SSLCipherSuite
ECDH+AESGCM:DH+AESGCM:ECDH+AES256:DH+AES256:ECDH+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS

   SetEnvIf    User-Agent ".*MSIE.*" nokeepalive ssl-unclean-shutdown
   SSLPassPhraseDialog  builtin
   SSLSessionCacheTimeout  300
   SSLRandomSeed    startup builtin


#  SSLLogLevel    warn
</IfModule>


Listen 443
```


```
etc/apache2/sites-available/cloud-browser.conf 
<VirtualHost *:443>

   ServerName cloud-browser.research.ac.uk

   ## Configuration for proxying back to tomcat server...


   ProxyPassMatch               /irods-cloud-backend/(.*)       http://localhost:8080/irods-cloud-backend/$1
   ProxyPassReverse             /irods-cloud-backend/           http://localhost:8080/irods-cloud-backend/
  
   ## SSL configuration

   Header always set Strict-Transport-Security "max-age=63072000; preload"


   SSLEngine  on
   SSLOptions +StrictRequire +StdEnvVars

   <Directory />
     SSLRequireSSL
   </Directory>


   SSLCertificateFile    /etc/apache2/ssl/research-wildcard.crt
   SSLCertificateKeyFile /etc/apache2/ssl/research-wildcard.key

   <IfModule mime.c>
     AddType application/x-x509-ca-cert      .crt
     AddType application/x-pkcs7-crl         .crl
   </IfModule>


   RequestHeader set SSL_TEST 1
   RequestHeader set SSL_SESSION_ID %{SSL_SESSION_ID}e

   SetEnvIf User-Agent ".*MSIE.*" nokeepalive ssl-unclean-shutdown downgrade-1.0 force-response-1.0


</VirtualHost>

<VirtualHost *:80>
 <Proxy *>
    Order deny,allow
    Allow from all
 </Proxy>


</VirtualHost>
```

### Enable the new Apache configurations.
```
ln -s /etc/apache2/sites-available/cloud_browser.conf /etc/apache2/sites-enabled/
ln -s /etc/apache2/conf-available/ssl.conf /etc/apache2/conf-enabled/
```

### Don't forget to install the SSL cert!

## 7 Configure the front end to your deployed back-end container

The front end javascript code makes ajax calls to the back end that is configured in irods-cloud-frontend/app/components/globals.js on 
line 17.

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

If using apache https proxy config above you don't need to specify the port, so;

```
/etc/apache2/sites-enabled# diff /var/www/irods-cloud-frontend/app/components/globals.js /var/www/irods-cloud-frontend/app/components/globals.js.orig
17,20c17
<   var HOST = "https://irods-cloud.research.ac.uk/irods-cloud-backend/";
---
>         var HOST = "http://"+location.hostname+":8080/irods-cloud-backend/";
```

The HOST variable needs to be set to the http address of the back end. In step 3, a proxy pass was configured, in this step
 set the HOST variable to the irods-cloud-backend context as it is exposed on your HTTP server (e.g., without :8080), with a trailing slash.
 
 
## 8 Optionally configure browser presets - locking the site down to just one Zone

Adding the irods-cloud-backend-config.groovy file to your /etc directory on the server where the irods-cloud-backend .war  is running allows limiting of the login page to a preset host/port/zone, presenting only a user and password.  If this file is not present, or the beconf.login.preset.enabled=false is set, than the login form will allow logging in to any iRODS grid.

Place that file in the /etc directory, ensuring that the Tomcat service can read it, and fill in the preset data, setting beconf.login.preset.enabled-true

```
/*
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

## 9 Restart the HTTP service and test

`service apache2 restart`

If the front-end code is properly configured to point to the back-end rest service, one should be able to log in to the application
by browsing to http(s)://hostnameforapachefrontend/irods-cloud-frontend

## 10 If you run into trouble!

Useful logs are;
```
/var/log/tomcat7/localhost_access_log.*
/var/log/apache2/*
```

This is the first roll-out.  If you experience any problems, please put data and any logs into GitHub at:
https://github.com/DICE-UNC/irods-cloud-browser/issues


Be sure to scrub any information you do not want on the web!  
