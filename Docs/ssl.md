# SSL Configuration and Client Negotiation

This document covers SSL configuration for iRODS, not for the web server.  iRODS supports secure client-server communications
over the iRODS communication channel through a process of negotiation between client and server.

The iRODS Docs cover SSL setup on the server side [here](https://docs.irods.org/4.2.0/plugins/pluggable_authentication/#server-ssl-setup).
SSL certificates are needed if the server has specified SSL transport support, or if PAM authentication is used. 

To use the Cloud Browser with an SSL configured server, or with PAM, follow these steps.

### Obtain an SSL public key

When SSL is configured on iRODS, it is recommended that a commercial SSL certificate is utilized.  It is possible to use a
self-signed certificate, but that certificate must be made known to the server running the cloud browser .war file.  Otherwise,
SSL handshake errors will occur.

### If using a self-signed certificate, add that cert to the java keystore on the server running Tomcat or Jetty, etc

A self-signed certificate (the public key) must be imported into the keystore of the JVM running the mid-tier.  It 
can be tricky to find the right JVM (there may be multiple). Here is a way you can find out.

First, run the command

```
which java
```

Which may return something like
 
```
mconway@mconway-HP-Z820-Workstation:~$ which java
/usr/bin/java

```

What java is linked under user/bin?  Let's see

```
mconway@mconway-HP-Z820-Workstation:~$ cd /usr/bin
mconway@mconway-HP-Z820-Workstation:/usr/bin$ ls -la java
lrwxrwxrwx 1 root root 22 Nov  2 12:31 java -> /etc/alternatives/java
mconway@mconway-HP-Z820-Workstation:/usr/bin$ 

```

Great, another soft link!  Yay..let's sleuth more...

```
mconway@mconway-HP-Z820-Workstation:/usr/bin$ cd /etc/alternatives
mconway@mconway-HP-Z820-Workstation:/etc/alternatives$ ls -la java
lrwxrwxrwx 1 root root 46 Nov 28 09:43 java -> /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java

```

OK, now we're getting closer.  The keystore we want is going to be under, in this case,
/usr/lib/jvm/java-8-openjdk-amd64/jre, and under there you should see a lib/security dir.

```
mconway@mconway-HP-Z820-Workstation:/etc/alternatives$ cd /usr/lib/jvm/java-8-openjdk-amd64/jre/lib/security/
mconway@mconway-HP-Z820-Workstation:/usr/lib/jvm/java-8-openjdk-amd64/jre/lib/security$ ls
blacklisted.certs  cacerts  java.policy  java.security  local_policy.jar  nss.cfg  US_export_policy.jar

```

There it is!  We want to import our public key into that keystore, for example, running in the jre/lib/security directory
as sudo:

``` 
sudo keytool -import -alias myalias -keystore cacerts -file /var/lib/irods/iRODS/server/config/certs/server.crt
```

It should say something like:

``` 
[root@eirods security]# sudo keytool -import -keystore cacerts -file /var/lib/irods/iRODS/server/config/certs/server.crt Enter keystore password: Owner: CN=localhost, OU=DICE, O=DICE, L=CH, ST=North Carolina, C=US Issuer: CN=localhost, OU=DICE, O=DICE, L=CH, ST=North Carolina, C=US Serial number: c584501847c209bb Valid from: Mon Mar 10 12:24:19 GMT-05:00 2014 until: Tue Mar 10 12:24:19 GMT-05:00 2015 Certificate fingerprints: MD5: F8:82:D7:1B:F2:2F:21:CE:53:4A:C9:5B:76:BA:9E:08 SHA1: 29:F3:95:36:4C:69:76:FD:8B:CF:C4:5C:15:79:AE:83:1F:27:57:B6 SHA256: 88:8C:95:49:41:27:60:01:A1:75:A2:AB:CD:6A:85:01:E8:9F:61:B6:27:43:3D:E2:5C:C5:57:71:90:A6:E8:19 Signature algorithm name: SHA1withRSA Version: 3

Extensions:

#1: ObjectId: 2.5.29.35 Criticality=false AuthorityKeyIdentifier [ KeyIdentifier [ 0000: 8D 02 6D 2E 54 1A 80 BB 0C 7E 6A CE E2 82 0A B8 ..m.T.....j..... 0010: 70 35 C1 9F p5.. ] ]

#2: ObjectId: 2.5.29.19 Criticality=false BasicConstraints:[ CA:true PathLen:2147483647 ]

#3: ObjectId: 2.5.29.14 Criticality=false SubjectKeyIdentifier [ KeyIdentifier [ 0000: 8D 02 6D 2E 54 1A 80 BB 0C 7E 6A CE E2 82 0A B8 ..m.T.....j..... 0010: 70 35 C1 9F p5.. ] ]

Trust this certificate? [no]: yes Certificate was added to keystore

```
### Set up the SSL negotiation properties

When you install cloud browser, you can set up properties that configure things about the browser in a 'properties' file
that goes in the /etc/irods-ext directory on the host machine.  In the case of the cloud browser, this is actually a .groovy 
file called [irods-cloud-backend-config.groovy](https://github.com/DICE-UNC/irods-cloud-browser/blob/master/irods-cloud-backend-config.groovy)

If you don't have one, no problem, but the browser will just start up with default settings. You very likely should 
set the client server negotiation preference by editing this line:

```groovy

beconf.negotiation.policy='CS_NEG_DONT_CARE' // NO_NEGOTIATION, CS_NEG_REFUSE, CS_NEG_REQUIRE, CS_NEG_DONT_CARE

```
CS_NEG_DONT_CARE is a recommended choice, because it says 'I'll do whatever the server wants'.  This tells the server to
decide whether transport security will be used.  

If you are doing a PAM login, than SSL is always used for the login process, since credentials are passed to iRODS.  

### That's it, start the app and log in

Really, the setup is straightforward, SSL, especially self-signed certificates, is just really picky.  99.999 percent of the
time, any errors you get are about misconfiguration, specifically, having a self-signed certificate and either
not importing it, or importing it to the wrong place.  Be very careful that the cacerts store you point keytool at is
the actual keystore used by Tomcat or other container.

Really...it'll trip you up.  Look in /var/log/tomcatN/catalina.out for handshake or connection closed exceptions, that's
a sure sign that not all is right in cert-land.

