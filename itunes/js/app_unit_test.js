/****************************************
*		 Application Unit Testing		*
*****************************************/


App.setupForTesting();
App.injectTestHelpers();

// Run before each test case.
QUnit.testStart(function () {
	Ember.run(function () {
		App.reset();
	});
	Ember.testing = true;
});

// Run after each test case.
QUnit.testDone(function () {
	Ember.testing = false;
});

test("First visit page", function(){
  visit("/").then(function() {
	equal(find(".btn-toolbar a.ember-view").length, 2, "The main page should have 2 buttons for switch list / grid.");
	equal(find(".clearfix .btn").length, 3, "The main page should have 3 controls buttons of play.");
	equal(find(".meta-box").length, 1, "The main page should have 1 read only text block for out meta data.");
	equal(find("li .accordion-toggle").length, 4, "The main page should have 4 elements of nav menu.");
  });
});

test('Click button "list"', function(){
  visit("/").click('a[href="/list"]').then(function() {
	ok(find("a.active").length, 'After click button should have class="active".');
	ok(find(".span9.play-list a").length, 'After click Play List should not be empty.');
	ok(find(".round-btn-25.disabled").length, 'Button Play should be disabled.');
  });
});

test("Click element of songs list.", function(){
  visit("/list").click('.span9 a:first').then(function() {
	ok(find(".span9 a:first.active").length, 'After click button should have class="active".');
	equal(find(".round-btn-25.disabled").length , 0, 'Button Play should be enabled.');
  });
});

test("Click element of songs list.", function(){
  visit("/list/1").then(function() {
	$('i.icon-play').click();
	ok(find(".meta-box").text().length, 'After click button "Play" text box should not be empty.');
  });
});

test("Click on GRID button", function() {
    visit("/")
    .click("a[href='/grid']")
    .then(function() {
        ok(find("a[href='/grid'].active").length, "Click on GRID button must make her active");
        ok(find("a.cont").length, "Click on GRID button must show list of songs in GRID-way and it must be not empty");
    });
});

test("First load of GRID page", function() {
    visit("/grid")
    .then(function() {
        equal(find("a.cont.active").length, 0, 'There must be no active elements');
        equal(find("div.round-btn-25.disabled").length, 1, "Play button must be inactive");
    });
});

test("Click on song in GRID-way", function() {
    visit("/grid")
    .click("a.cont:first")
    .then(function() {
        equal(find("a.cont.active").length, 1, 'There must be 1 active element after click on song');
        equal(find("div.round-btn-25.disabled").length, 0, "Play button must not have class 'disabled'");
        equal(find("div.round-btn-25").length, 1, "Play button must be active");
    });
});

test("Run song", function() {
    visit("/grid")
    .then(function() {
        $("a.cont:first").click();
        $("i.icon-play").click();
        ok($('.meta-box').text().length, "If song is running - there must be info in meta box");
    });
});











