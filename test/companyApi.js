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
  it('Test graph structure', function(done) {
    request(server)
      .post('/graphql')
      .send({
        query: `
        {
          # hello world 公司有個標籤，標籤裡有hello world公司
          companies(queryString: "hello world") {
            name,
            profile {
              address,
              industry
            },
            tagList {
              _id
              name
              companyList {
                name,
                tagList{
                  _id, 
                  name
                }
              }
            }
          }
        }
        `
      })
      .expect(200, done)
  })
})