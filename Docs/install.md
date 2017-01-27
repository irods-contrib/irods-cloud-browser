# Installation of the iRODS Cloud Browser

There are two methods of installation. The first of which is building an automated .WAR file that can be directly deployed to a tomcat server, 
the second of which is an installation that allows the static assets (javascript, css, etc) to be separately placed
on a server. There is little benefit to the latter and this arrangemetn is discouraged going forward.

# Building Cloud Browser

In most instances, you do not need to build the cloud browser.  Instead, download the all-in-one war file release,
ready to drop into Tomcat or some other web container.  You may find a .war file with each release on GitHub at 
https://github.com/DICE-UNC/irods-cloud-browser/releases

## Optionally configure browser presets - locking the site down to just one Zone

Adding the irods-cloud-backend-config.groovy file to your /etc/irods-ext directory on the server where the irods-cloud-backend.war  
is running allows limiting of the login page to a preset host/port/zone, presenting only a user and password.  
If this file is not present, or the beconf.login.preset.enabled=false is set, than the login form will allow 
logging in to any iRODS grid.

Place that file in the /etc/irods-ext directory, ensuring that the Tomcat service can read it, and fill in the preset 
data, setting beconf.login.preset.enabled-true.  See the irods-cloud-backend-config.groovy file here:

https://github.com/DICE-UNC/irods-cloud-browser/blob/master/irods-cloud-backend-config.groovy

This file also sets the SSL negotiation policy between the mid-teir and iRODS.  This is covered in ssl.md.

## Deploy the .war file

Deploy the irods-cloud-backend.war file to your web container, typically Tomcat.  This deploys the backend REST service 
that will connect to iRODS.

1. log into the tomcat manager with the user you created and upload the file, e.g. http://irods-cloud:8080/manager/html
2. after deploy button pressed and a short wait, you should see an '/irods-cloud-backend' application path created

## (optional) proxy the back end via Apache HTTP or other server

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

## Restart the HTTP service and test

`service apache2 restart`

One should be able to log in to the application
by browsing to http(s)://my.host.com/irods-cloud-backend

## 10 If you run into trouble!

Useful logs are;
```
/var/log/tomcatN
/var/log/apache2/*
```

If you experience any problems, please put data and any logs into GitHub at:
https://github.com/DICE-UNC/irods-cloud-browser/issues

Be sure to scrub any information you do not want on the web!  
