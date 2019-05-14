const Koa = require('koa');
const http = require('http');
const bodyParser = require('koa-bodyparser');
const md5 = require('md5');
const cors = require('kcors');
const { sequelize, Plan, Facility, Room, Office, User } = require('./models/DatabaseConnection');
const statusController = require('./controllers/status.controller');
const authController = require('./controllers/auth.controller');
const usersController = require('./controllers/users.controller');
const plansController = require('./controllers/plans.controller');
const paymentsController = require('./controllers/payments.controller');
const eventsController = require('./controllers/events.controller');
const PaymentJob = require('./jobs/payment.job');
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
      let rawdata = fs.readFileSync('./resources/plans.json');
      const plans = JSON.parse(rawdata).plans;
      for (const plan of plans) {
        const p = await Plan.build(plan).save();
        for (const facility of plan.facilities) {
          facility.planId = p.id;
        }
        await Facility.bulkCreate(plan.facilities);
      }
      rawdata = fs.readFileSync('./resources/rooms.json');
      const rooms = JSON.parse(rawdata).rooms;
      await Room.bulkCreate(rooms);

      rawdata = fs.readFileSync('./resources/offices.json');
      const offices = JSON.parse(rawdata).offices;
      await Office.bulkCreate(offices);

      const user = {
        full_name: 'Admin',
        cnp: '1',
        identity_number: '1',
        address: '1',
        email: 'admin@itransfer.ro',
        password: md5('admin123'),
        role: 3,
        startDate: new Date().getTime(),
      };
      await User.create(user);
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
app.use(paymentsController.router.prefix('/payments').routes());
app.use(eventsController.router.prefix('/events').routes());
app.use(statusController.router.routes());

PaymentJob.run();

const server = http.createServer(app.callback());
server.listen(port);
console.log(`Server running on ${port}`);
