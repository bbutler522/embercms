import Ember from 'ember';

export default Ember.Component.extend({
	_pages: function() {
	//admin interface works in separate store so this is never called
	}.observes('pages.[]'),
	isHome: function() {
		var pagename = this.get('pagename');
		if (typeof pagename === 'undefined' || !pagename || pagename.length < 1 || pagename.toLowerCase() === 'home' || pagename.toLowerCase() === 'index')
			return true;
		return false;
	}.property('pagename'),
	isAdmin: function() {
		return ecms.hasRole('admin');
	}.property(),
	isSupplier: function() {
		return ecms.hasRole('registrant');
	}.property(),
	isClient: function() {
		return ecms.hasRole('client');
	}.property(),

});
