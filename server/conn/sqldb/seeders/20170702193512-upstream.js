'use strict';

module.exports = {
  up: function up(queryInterface) {
    return queryInterface.bulkInsert('upstreams', [{
      id: 1,
      name: 'test',
      provider: 'provider',
      link: 'asdadas',
      support: 'asdasd',
      comment: '',
      active: true,
      balance: 0,
      createdBy: 1,
      updatedBy: 1,
      routeId: 1
    }], {});
  },
  down: function down(queryInterface) {
    return queryInterface.bulkDelete('upstreams', { id: [1] });
  }
};
//# sourceMappingURL=20170702193512-upstream.js.map
