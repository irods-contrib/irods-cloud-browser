angular.module("template/message-center/message-center.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/message-center/message-center.html",
    '<span>' +
        '<span class="message-center-important">' +
            '<message ng-repeat="message in impMessages" class="message-animation"></message>' +
        '</span>' +
        '<span class="message-center-regular">' +
            '<message ng-repeat="message in messages" class="message-animation"></message>' +
        '</span>' +
    '<span>');
}]);

angular.module("template/message-center/message.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/message-center/message.html",
    '<div class="message-box" ng-class="message.classes">' +
        '<span class="message">{{message.message}}</span>' +
        '<button type="button" class="close" aria-hidden="true" ng-click="removeItem(message)">&times;</button>' +
    '</div>');
}]);