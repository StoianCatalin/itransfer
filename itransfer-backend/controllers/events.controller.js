const CoreRouter = require('koa-router');
const isAuthenticated = require('../middlewares/authentication.middleware').isAuthenticated;
const { EventsCommands } = require('../commands/Events.commands');
const { Meeting, Room, Office, User } = require('../models/DatabaseConnection');

const router = new CoreRouter();
router.get('/rooms',async (ctx, next) => {
  const rooms = await Room.findAll({
    raw: true,
  });
  ctx.response.body = rooms;
  await next();
});

router.get('/offices',async (ctx, next) => {
  let offices = await Office.findAll({
    raw: true,
  });
  if (!offices) {
    ctx.response.body = [];
  }
  for (const office of offices) {
    if (office.userId) {
      const user = await User.findOne({ where: { id: office.userId } });
      office.busy = !!user.contractUrl;
    } else {
      office.busy = false
    }
  }
  ctx.response.body = offices;
  await next();
});

router.get('/', isAuthenticated,async (ctx, next) => {
  const meetings = await Meeting.findAll({
    where: { userId: ctx.state.user.id },
    raw: true,
  });
  ctx.response.body = meetings;
  await next();
});

router.post('/meeting', isAuthenticated, async (ctx, next) => {
  const meetingBody = ctx.request.body;
  const eventsCommands = new EventsCommands();
  const response = await eventsCommands.addMeetings(meetingBody, ctx.state.user);
  ctx.response.body = response;
});

router.delete('/meeting/:id', isAuthenticated, async (ctx, next) => {
  const eventsCommands = new EventsCommands();
  const response = await eventsCommands.deleteMeeting(ctx.params.id, ctx.state.user);
  ctx.response.body = response;
});

module.exports = { router };
