# Builder environment for cb

It's recommended you have an actual dev environment (e.g. npm, grails, groovy), and sdkman really helps here! (see http://sdkman.io/)

For convenience, this docker image provisions a basic environment, so that running the build.sh should build an appropriate docker image and put you at a # prompt
within that image.

#### Procedure...

> build.sh

will do things, First change the volume in build.sh from /Users/conwaym/temp to a place on your local machine, so that it can receive the newly created war file.

```
~/Documents/workspace-niehs-dev/irods-cloud-browser/irods-cloud-backend/builder @ ALMBP-02010755(conwaymc): ./build.sh
Sending build context to Docker daemon  3.072kB
Step 1/8 : FROM ubuntu:xenial
 ---> 00fd29ccc6f1

 ...



 + gulp@3.9.1
 added 274 packages in 5.612s
 /usr/bin/gulp -> /usr/lib/node_modules/gulp-cli/bin/gulp.js
 + gulp-cli@2.0.0
 added 244 packages in 4.847s
  ---> c86cea83ab92
 Removing intermediate container 46d8297f3b4c
 Successfully built c86cea83ab92
 Successfully tagged diceunc/cbbuilder:latest

 ```

 Now you can check out cloud browser (this isn't done in docker image so that there is no confusion about saved layers and you get the latest bits)

> git clone https://github.com/DICE-UNC/irods-cloud-browser.git

now go into the frontend in the repo and run npm install to get all the npm bits and dependencies


```

cd irods-cloud-browser/irods-cloud-frontend/
root@33b4cc6bff76:/irods-cloud-browser/irods-cloud-frontend# npm install

```

now put all the frontend stuff into the war with a gulp command

```

root@33b4cc6bff76:/irods-cloud-browser/irods-cloud-frontend# gulp backend-build

```

Now the ../irods-cloud-backend which makes up the war contains the css, javascript, etc from the frontend...let's cd to that!

```

cd ..
root@33b4cc6bff76:/irods-cloud-browser# cd irods-cloud-backend

```

Now you can build the war, and tell it to dump the built file into the mounted volume in build.sh

You can take that war and put it in the irods-cloud-backend subdir and then run the docker build there with the provided Dockerfile in /irods-cloud-browser/irods-cloud-backend/Dockerfile
