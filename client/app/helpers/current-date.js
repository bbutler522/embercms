// app/helpers/current-date.js
import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function() {
  return moment().format('LL'); // Using moments format 'LL'
});
