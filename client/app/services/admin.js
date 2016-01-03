import Ember from 'ember';
import EmberAdminServiceAdmin from 'ember-admin/services/admin';

export default EmberAdminServiceAdmin.extend({
  namespace: '',
 includedModels: ['page', 'section','photo'], //make null to add all
//  excludedModels: null
excludedColumns: {
  'page': ['description', 'title']
}
}); 
