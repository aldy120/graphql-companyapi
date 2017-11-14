var request = require('supertest');
var server = require('../src/server');
var assert = require('assert');

describe('graphql', function () {
  it('get graphql', function (done) {
    request(server)
      .get('/graphiql')
      .expect(200, done)
  })
  it('first test', function (done) {
    request(server)
      .post('/graphql')
      .send({
        query: '{tags {name}}'
      })
      .expect(200)
      .end(function (err, res) {
        assert(Array.isArray(res.body.data.tags));
        done();
      });
  })
  after(function(done) {
    process.exit();
  })
})