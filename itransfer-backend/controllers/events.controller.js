const CoreRouter = require('koa-router');
const isAuthenticated = require('../middlewares/authentication.middleware').isAuthenticated;
const { EventsCommands } = require('../commands/Events.commands');
const { Meeting, Room, Office, User, Attender, Event } = require('../models/DatabaseConnection');
const { hasSecretarAccess } = require('../middlewares/role.middleware');

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
      office.busy = !!user.contractUrl ? 2 : 1;
    } else {
      office.busy = 0
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

router.get('/events', isAuthenticated, async (ctx, next) => {
  const events = await Event.findAll({ raw: true });
  for (const event of events) {
    event.attenders = await Attender.findAll({ where: { eventId: event.id }, raw: true });
  }
  ctx.response.body = events;
  await next();
});

router.get('/events/user', isAuthenticated, async (ctx, next) => {
  const events = await Event.findAll({ raw: true }).filter((event) => {
    const startDate = new Date(`${event.startDate} ${event.startTime}`).getTime();
    return startDate >= new Date().getTime();
  });
  for (const event of events) {
    event.attenders = await Attender.findAll({ where: { eventId: event.id }, raw: true });
  }
  ctx.response.body = events;
  await next();
});

router.post('/events', isAuthenticated, hasSecretarAccess, async (ctx, next) => {
  const eventsCommands = new EventsCommands();
  const { status, body } = await eventsCommands.addEvent(ctx.request.body);
  ctx.response.status = status;
  ctx.response.body = body;
  await next();
});

router.put('/events', isAuthenticated, hasSecretarAccess, async (ctx, next) => {
  const eventsCommands = new EventsCommands();
  const { status, body } = await eventsCommands.editEvent(ctx.request.body);
  ctx.response.status = status;
  ctx.response.body = body;
  await next();
});

router.delete('/events/:id', isAuthenticated, hasSecretarAccess, async (ctx, next) => {
  await Event.destroy({ where: { id: ctx.params.id }});
  await Attender.destroy({ where: { eventId: ctx.params.id } });
  ctx.response.status = 200;
  ctx.response.body = { message: 'Event deleted' };
});

router.post('/events/signup/:eventId', isAuthenticated, async  (ctx, next) => {
  const userId = ctx.state.user.id;
  const eventId = ctx.params.eventId;
  const event = await Event.findOne({ include: [Attender], where: { id: eventId } });
  const user = await User.findOne({ where: { id: userId } });
  if (!event) {
    ctx.response.status = 400;
    ctx.response.body = { message: 'Event does not exist' };
  }
  for (const attender of event.attenders) {
    if (attender.userId === user.id) {
      ctx.response.body = { message: 'You are already registered to this event.' }
      return;
    }
  }
  const eventCommands = new EventsCommands();
  await eventCommands.addEventInCalendar(event, user);
  await Attender.create({ userId, eventId });
  ctx.response.status = 200;
  ctx.response.body = { message: 'You were sign-up successfully to this event!' };
});

module.exports = { router };
