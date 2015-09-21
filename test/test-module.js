describe('Module', function () {

  //==============//
  // INITIALIZING //
  //==============//

  beforeEach(module('betsol.entityList'));

  var EntityList;
  beforeEach(inject(function (_EntityList_) {
    EntityList = _EntityList_;
  }));


  //=========//
  // TESTING //
  //=========//

  it('service should be present', function () {
    expect(EntityList).to.be.a('function');
  });

});
