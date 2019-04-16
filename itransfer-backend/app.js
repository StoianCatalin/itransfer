const Koa = require('koa');
const http = require('http');
const bodyParser = require('koa-bodyparser');
const cors = require('kcors');
const { sequelize, Plan, Facility } = require('./models/DatabaseConnection');
const statusController = require('./controllers/status.controller');
const authController = require('./controllers/auth.controller');
const usersController = require('./controllers/users.controller');
const plansController = require('./controllers/plans.controller');
const fs = require('fs');
const app = new Koa();
const port = 3001;
const forceSyncDb = false;

setInterval(() => {
  console.log('running...');
}, 10000);

sequelize
  .sync({ force: forceSyncDb })
  .then(async () => {
    console.log('Connection has been established successfully.');

    // TODO: to be removed at the end;
    if (forceSyncDb) {
      const rawdata = fs.readFileSync('./resources/plans.json');
      const plans = JSON.parse(rawdata).plans;
      for (const plan of plans) {
        const p = await Plan.build(plan).save();
        for (const facility of plan.facilities) {
          facility.planId = p.id;
        }
        await Facility.bulkCreate(plan.facilities);
      }
    }
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


app.use(bodyParser());
app.use(cors());

app.use(authController.router.prefix('/auth').routes());
app.use(usersController.router.prefix('/users').routes());
app.use(plansController.router.prefix('/plans').routes());
app.use(statusController.router.routes());

const server = http.createServer(app.callback());
server.listen(port);
console.log(`Server running on ${port}`);
