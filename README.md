# Project: DFC iRODS Cloud Browser

#### Release - https://github.com/DICE-UNC/irods-cloud-browser/releases

### Date: 08/18/2016
### Release Version: 1.0.2.0-Beta1
### git tag: 1.0.2.0-Beta1
#### Developer: Mike Conway - DICE, Cesar Garde - iRODS

The iRODS Cloud Browser allows simple, browser based access to any iRODS grid.  This browser is based on the following components:

* Jargon based API 
* Groovy/Grails RESTFul backend with JSON
* AngularJS based frontend

See the INSTALL.md for install instructions

https://github.com/DICE-UNC/irods-cloud-browser

This beta release includes new packaging and initial gulp automation including single war build and Selenium testing for milestone:

https://github.com/DICE-UNC/irods-cloud-browser/milestone/6

## Requirements

* The backend depends on Java 1.7+ and Tomcat7
* The backend deploys as a .war file
* The frontend is a pure html/javascript package that is served out of Apache HTTP or similar server

## Build Automation

Visit irod-cloud-browser/irod-cloud-frontend README.md for further details.

## New Features

* __Creation of new files:__ Now you can create .TXT, .XML, and .R files
* __File Editing:__ Now you can edit the .TXT, .XML, and .R files
* __Rule Execution:__ Now you can execute rules from the rule editing interface
* __Main Navigation Bar:__ We have added a main navigation bar to the interface that is located at the far left of the interface, the nav bar has Browse view and Search view. Future development will add more features to this main nav bar 
* __Metadata Search:__ Now you will be able to search through the files and folders of your grid using metadata names and values as the parameters of your search, after you issue a metadata search, it will be stored on your left side nav as a recent query collection
* __Recent Query Collections:__ Just like the "Starred Files" collection, Recent Query Collections are dynamic virtual collections that are created after you issue a Metadata Search

## Changes

### Build automation via gulp, cleanup vendor dependencies and migrate to bower and npm #2

Clean up build processes and have a more standard, automated development/deployment workflow using Gulp.  This includes asset prep and validation, running tests with Karma, and Selenium automated functional testing.

### Add selenium test automation to CI #114

Initial provisioning and basic Selenium testing to be expanded in later releases. Incorporated a runTest Gulp task

### minify css assets #18

Added guilp CSS concatenation and minification.  Added W3C validation to automation.

### Install notes #124

Added enhanced build procedures and install notes
