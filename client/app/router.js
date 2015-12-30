import Ember from 'ember';
import config from './config/environment';
import adminRouter from 'ember-admin/router';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  adminRouter(this);
  this.route('test');
  this.route('test2');
  this.route('400');

  this.resource('user', function() {});

  this.route("login");
  this.route("register");
  this.route('protected');
  this.route('page');
  this.route('section');
  this.route('translation');
});



export default Router;
