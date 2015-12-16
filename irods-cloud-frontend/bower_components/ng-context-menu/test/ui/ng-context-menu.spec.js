describe('Right clicking on a panel', function() {
  it('should display a contextmenu', function() {
    browser.get('http://localhost:8080/');

    var panel = element(by.id('panel-0'));
    var menu = element(by.css('#menu-0 .dropdown-menu'));

    expect(panel.isPresent()).toBe(true);
    expect(menu.isPresent()).toBe(true);

    menu.isDisplayed()
      .then(function(visible) {
        expect(visible).toBe(false);

        return browser.actions()
          .mouseMove(panel)
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(function() {
        return menu.isDisplayed();
      })
      .then(function(visible) {
        expect(visible).toBe(true);
      });
  });
});