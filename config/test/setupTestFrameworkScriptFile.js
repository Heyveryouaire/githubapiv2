global.beforeAll(() => {
  // require('../../src/services/pointsService/test/nock')("http://indencive.com")

  const { createAndWriteKeyPair } = require('../../src/lib/crypt')("test")
  createAndWriteKeyPair()
});
