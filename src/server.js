const http = require('http')
export default () => {
  return http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify('Running!', null, 2));
  })
}