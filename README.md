# Project: DFC iRODS Cloud Browser

#### Release - https://github.com/DICE-UNC/irods-cloud-browser/releases

### Date: 06/30/16
### Release Version: 1.0.1
### git tag: 1.0.1-RELEASE
#### Developer: Mike Conway - DICE, Cesar Garde - iRODS

The iRODS Cloud Browser allows simple, browser based access to any iRODS grid.  This browser is based on the following components:

* Jargon based API 
* Groovy/Grails RESTFul backend with JSON
* AngularJS based frontend

See the INSTALL.md for install instructions

https://github.com/DICE-UNC/irods-cloud-browser

## Requirements

* The backend depends on Java 1.7+ and Tomcat7
* The backend deploys as a .war file
* The frontend is a pure html/javascript package that is served out of Apache HTTP or similar server

## New Features

* __Creation of new files:__ Now you can create .TXT, .XML, and .R files
* __File Editing:__ Now you can edit the .TXT, .XML, and .R files
* __Rule Execution:__ Now you can execute rules from the rule editing interface
* __Main Navigation Bar:__ We have added a main navigation bar to the interface that is located at the far left of the interface, the nav bar has Browse view and Search view. Future development will add more features to this main nav bar 
* __Metadata Search:__ Now you will be able to search through the files and folders of your grid using metadata names and values as the parameters of your search, after you issue a metadata search, it will be stored on your left side nav as a recent query collection
* __Recent Query Collections:__ Just like the "Starred Files" collection, Recent Query Collections are dynamic virtual collections that are created after you issue a Metadata Search

## Changes

* All icon images have been replaced with a vector based font (font awesome library), making theming really fast and easy

