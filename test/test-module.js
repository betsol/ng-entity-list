describe('Module', function () {

  //==============//
  // INITIALIZING //
  //==============//

  beforeEach(module('betsol.entityList'));

  var EntityListConfig;
  beforeEach(inject(function (_EntityListConfig_) {
    EntityListConfig = _EntityListConfig_;
  }));


  //=========//
  // TESTING //
  //=========//

  it('service should be present', function () {
    expect(EntityListConfig).to.be.an('object');
  });

});
