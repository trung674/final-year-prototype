const mongoose = require('mongoose');
const should = require('chai').should();
const Browser = require('zombie');
const User = require('../src/models/user');
const Recording = require('../src/models/recording');
let server;
let browser;

before(function(done) {
  console.log("Waiting for server to finish starting up.");
  server = require('../src/app.js');
  Browser.localhost('example.com', 3000);
  browser = new Browser();
  this.timeout(6000);
  setTimeout(done , 4000);
});

// Test suites for Recorders group
describe.only('Recorders', function() {
  before(function(done) {
    let user1 = new User({
      username: 'testuser1',
      email: 'testuser1@gmail.com',
      information: {
        fullname: 'John Doe',
        gender: 'male',
        date_of_birth: new Date(1990, 2, 10),
        place_of_birth: 'England',
        first_language: 'English',
        medical_condition: 'Severe physical impairment',
      },
      admin: false,
      lastLogIn: Date.now()
    });
    user1.password = user1.generateHash('password123');
    user1.save(function(err) {
      if (err) throw err;
      done();
    });
  });


  describe('Recorders should be able to log in/log out of the webportal using their own accounts.', function(){
    before(function(done) {
       browser.visit('/signin', function(){
         done();
       });
    });

    it('Connection should be be success', function(){
      browser.assert.success();
    });

    it('Should see sign-in form', function() {
      browser.assert.element('#signin-signup-form');
    });

    describe("Wrong email", function() {
      before(function() {
         browser
          .fill('email', 'testuser@gmail.com')
          .fill('password', 'password123');
         return browser.pressButton('Sign in');
       });

       it("Should see error if wrong email", function() {
         browser.assert.text('p.bg.bg-danger', 'No user found. Please try again');
       });
    });

    describe("Wrong password", function() {
      before(function() {
         browser
          .fill('email', 'testuser1@gmail.com')
          .fill('password', 'password12');
         return browser.pressButton('Sign in');
       });

       it("Should see error if wrong password", function() {
         browser.assert.text('p.bg.bg-danger', 'Wrong password. Please try again');
       });
    });

    describe("Move to dashboard after signing in", function() {
      before(function() {
         browser
          .fill('email', 'testuser1@gmail.com')
          .fill('password', 'password123');
         return browser.pressButton('Sign in');
       });

       it("Should be redirected to user dashboard and see 'Welcome, John Doe' after signing in", function() {
         browser.assert.url({ pathname: '/user' });
         browser.assert.text('h1', 'Welcome, John Doe');
       });
    });

    describe("Should be redirected to sign-in page after signing out", function() {
      before(function() {
         return browser.clickLink('Sign out');
       });

      it("Should see sign-in form", function() {
        browser.assert.element('#signin-signup-form');
      });
    });

  });

  describe("Recorders should be able to receive reading material from administrators.", function() {
    before(function(done) {
      let testsession1 = new Recording({
        title: 'Test Session 1',
        description: 'A number of words',
        type: 'words',
        content: ['one', 'two', 'three', 'four', 'five']
      });

      let testsession2 = new Recording({
        title: 'Test Session 2',
        description: 'Red Riding Hood story',
        type: 'speech',
        content: ['Please talk about the Red Riding Hood story in your own style']
      });

      let testsession3 = new Recording({
        title: 'Test Session 3',
        description: 'TIdigits Prompts',
        type: 'sentences',
        content: ['9 4 OH', '8 1 OH', '3 2', '4 6 6 8 OH']
      });

      Recording.collection.insert([testsession1, testsession2, testsession3], {}, function(err, docs) {
        if (err) throw err;
        done();
      });
    });

    before(function(done) {
       browser.visit('/signin', function(){
         done();
       });
    });

    before(function() {
       browser
        .fill('email', 'testuser1@gmail.com')
        .fill('password', 'password123');
       return browser.pressButton('Sign in');
     });

     it("Should see 3 new sessions", function() {
        browser.assert.text('h1', 'Welcome, John Doe');
        browser.assert.elements('table#new-sessions td:nth-child(1)', 'Test Session 1');
        browser.assert.elements('table#new-sessions td:nth-child(4)', 'Test Session 2');
        browser.assert.elements('table#new-sessions td:nth-child(7)', 'Test Session 3');
        // Sometimes the page is not loaded before default timeout so set custom timeout instead.
        this.timeout(6000);
     });
  });

  describe("Recorders should be able to see lists of new, incomplete or finished sessions.", function() {
    before(function(done) {
      Recording.findOne({title: 'Test Session 2'}, function(err, session) {
        browser.visit('/user/session/' + session._id + '/0?a=start', function() {
          done();
        });
      });
    });

    before(function(done) {
      Recording.findOne({title: 'Test Session 3'}, function(err, session) {
        browser.visit('/user/session/' + session._id + '/0?a=start', function() {
          done();
        });
      });
    });

    before(function(done) {
      Recording.findOne({title: 'Test Session 3'}, function(err, session) {
        if (err) throw err;
        browser.visit('/user/session/' + session._id + '/finish', function() {
          // wait for the redirect to be done
          setTimeout(done , 4000);
        });
      });
    });

    it("should see one ongoing session and one finished session", function() {
      browser.assert.elements('table#ongoing-sessions td:nth-child(1)', 'Test Session 2');
      browser.assert.elements('table#finished-sessions td:nth-child(1)', 'Test Session 3');
    });
  });

  describe("Recorders should be able to change their personal information.", function() {
    before(function(done) {
      browser.visit('/user/profile', function() {
        done();
      });
    });

    before(function() {
       browser
        .fill('fullname', 'Allen Walker')
        .fill('place_of_birth', 'Ireland');
       return browser.pressButton('#btn-update-profile');
     });

     it("Should see success message and updated information", function() {
       browser.assert.text('p.bg.bg-success', 'Successfully updated your profile information.');
       browser.assert.input('input[name="fullname"]', 'Allen Walker');
       browser.assert.input('input[name="place_of_birth"]', 'Ireland');
     });
  });

  after(function(done)  {
    console.log("Erasing all evidences...");
    mongoose.connection.db.dropDatabase(function() {
      done();
    });
  });
});

// Test suites for Administrators group
describe('Administrators', function() {
  before(function(done) {
    let user1 = new User({
      username: 'testadmin1',
      email: 'testadmin1@gmail.com',
      admin: true,
      lastLogIn: Date.now()
    });
    user1.password = user1.generateHash('password123');
    user1.save(function(err) {
      if (err) throw err;
      done();
    });
  });

  describe("Administrators should be able to log in using the provided accounts.", function() {
    before(function(done) {
       browser.visit('/signin', function(){
         done();
       });
    });

    before(function() {
      browser
       .fill('email', 'testadmin1@gmail.com')
       .fill('password', 'password123');
      return browser.pressButton('Sign in');
    });

    it("Should be redirect to admin dashboard", function() {
      browser.assert.url({ pathname: '/admin' });
      browser.assert.text('div.page-header h1', 'Administrator Dashboard -');
    });
  });

  describe("Administrators should be able to provide reading material to recorders.", function() {
    before(function(done) {
       browser.visit('/admin/create_session', function(){
         done();
       });
    });

    before(function() {
      browser
       .fill('title', 'New Session 1')
       .fill('description', 'A list of words')
       .select('type', 'Words')
       .fill('content', 'one\r\ntwo\r\nthree\r\nfour');
      return browser.pressButton('Submit');
    });

    it("Should see one new session in database", function() {
      Recording.find({}, function(err, result) {
        if (err) throw err;
        result.should.have.lengthOf(1);
      })
    });
  });

  describe("Administrators should be able to edit an existing session.", function() {
    before(function(done) {
      Recording.findOne({title: 'New Session 1'}, function(err, result) {
        browser.visit('/admin/edit_session/' + result._id, function() {
          done();
        });
      });
    });

    before(function() {
      browser
       .fill('title', 'Edited New Session 1');
      return browser.pressButton('Update');
    });

    it("Should see edited title of the existing session", function() {
      browser.assert.text('p.bg.bg-success', 'Successfully edit the session information');
      browser.assert.input('input[name="title"]', 'Edited New Session 1');
    });
  });

  describe("Administrators should be able to search for existing users based on differnt information such as user name, email and personal information.", function() {
    before(function(done) {
      let user1 = new User({
        username: 'testuser1',
        email: 'testuser1@gmail.com',
        information: {
          fullname: 'John Doe',
          gender: 'male',
          date_of_birth: new Date(1990, 1, 10),
          place_of_birth: 'England',
          first_language: 'English',
          medical_condition: 'Severe physical impairment',
        },
        admin: false,
        lastLogIn: Date.now()
      });
      user1.password = user1.generateHash('password123');
      user1.save(function(err) {
        if (err) throw err;
        done();
      });
    });

    before(function(done) {
       browser.visit('/admin/user_management', function(){
         done();
       });
    });

    before(function() {
      browser
       .fill('query', 'test');
      return browser.pressButton('Submit');
    });

    it("Should see user 'testuser1' in search result", function() {
      browser.assert.elements('table td:nth-child(1)', 'testuser1');
    });
  });

  describe("Administrators should have access to recorder personal information.", function() {
    before(function() {
       return browser.clickLink('testuser1');
    });

    it("Should see user information such as username, email, full name, etc", function() {
      browser.assert.text('table tbody tr:nth-child(2) td', 'John Doe');
      browser.assert.text('table tbody tr:nth-child(3) td', 'testuser1@gmail.com');
      browser.assert.text('table tbody tr:nth-child(4) td', 'male');
      browser.assert.text('table tbody tr:nth-child(5) td', '10/02/1990');
    });
  });

  after(function(done)  {
    console.log("Erasing all evidences...");
    mongoose.connection.db.dropDatabase(function() {
      done();
    });
  });
});

// Test suites for System group
describe('System', function() {
  describe("The system should prevent unauthorised access to user information and recording data.", function() {
    describe("Should be redirected to sign-in form if accessing the user dashboard without signing in.", function() {
      before(function(done) {
         browser.visit('/user', function(){
           done();
         });
      });

      it("The current url path should be /signin.", function() {
        browser.assert.url({ pathname: '/signin' });
      });
    });

    describe("Should be get 'Unauthorized Access' if accessing the admin dashboard without signing in.", function() {
      before(function(done) {
         browser.visit('/signout', function(){
           done();
         });
      });

      before(function(done) {
         browser.visit('/admin', function(){
           done();
         });
      });

      it("Should see '403 - Unauthorized Access' message.", function() {
        browser.assert.text('h1', '403 - Unauthorized Access');
      });
    });
  });

  after(function(done)  {
    console.log("Erasing all evidences...");
    mongoose.connection.db.dropDatabase(function() {
      done();
    });
  });
});

after(function() {
  console.log("Closing server...");
  server.close();
});
