var express = require('express');
var { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
var bodyParser = require('body-parser');

var { schema, rootValue, context } = require('./schema');

const PORT = 3000;
const server = express();
module.exports = server;


server.use('/graphql', bodyParser.json(), graphqlExpress(request => ({
  schema,
  rootValue,
  context: context(request.headers, process.env),
})));

server.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  query: `
  {
    companies(queryString: "宏達") {
      name
      profile {
        industry
        category
        employee
        address
      }
    }
  }
`,
}));

server.listen(PORT, () => {
  console.log(`GraphQL Server is now running on http://localhost:${PORT}/graphql`);
  console.log(`View GraphiQL at http://localhost:${PORT}/graphiql`);
});