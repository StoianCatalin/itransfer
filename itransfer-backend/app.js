const Koa = require('koa');
const http = require('http');
const bodyParser = require('koa-bodyparser');
const cors = require('kcors');
const { sequelize } = require('./models/DatabaseConnection');
const statusController = require('./controllers/status.controller');
const app = new Koa();
const port = 3001;

sequelize
  .sync({ force: true })
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


app.use(bodyParser());
app.use(cors());

app.use(statusController.router.routes());

const server = http.createServer(app.callback());
server.listen(port);
console.log(`Server running on ${port}`);
