var fetch = require('node-fetch');
var FormData = require('form-data')

var data = new FormData();
data.append('json', JSON.stringify({}));

fetch('http://54.250.241.79:10010/company/filter', {
  method: 'POST',
  body: data,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({})
}).then(res => res.json())
  .then(json => console.log('hi', json));
