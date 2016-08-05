angular-message-center [![Build Status](https://travis-ci.org/IanShoe/angular-message-center.png?branch=master)](https://travis-ci.org/IanShoe/angular-message-center)[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/IanShoe/angular-message-center/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
======================

Easy Angular Notification Center
---------

This is an angular module that allows for easy message broadcasting as notification alerts. The module has two importance levels which are styled differently through the message-center.css file. The css is meant to be tailored for specific needs and serves only as a baseline. The templates are run through angular's $templateCache for portability.

I support a few options for both the message service and the messages themselves
Message Service Opts:
---------
`MessageService.configure({disabled:false, max:3, timeout:3000})`

Message Opts:
---------
`MessageService.broadcast('My Message',{color: 'primary', important:true})`

Oh and it's also responsive!

Installation
---------

1. `bower install angular-message-center`

2. Add the script tag `<script src="bower_components/angular-message-center/dist/message-center.js">` or alternatively the min file `<script src="bower_components/angular-message-center/dist/message-center.min.js">` and `<link href="bower_components/angular-message-center/dist/message-center.css">` on your index.html

3. The message center uses ngAnimate so include `<script src="bower_components/angular-animate/angular-animate.js">` on your index.html as well. (may need to `bower install angular-animate`)

4. Add the required dependancy to your app.js file `var yourApp = angular.module('your-app', ['MessageCenter']);`

5. Inject the MessageService into your controllers, directives, or other services `yourApp.controller('myCtrl', ['$scope', 'MessageService', function($scope, MessageService){...}])`

6. Broadcast a message by calling `MessageService.broadcast('This is an awesome message', opts)`
