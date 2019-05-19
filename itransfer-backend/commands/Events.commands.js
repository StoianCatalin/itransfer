const { google } = require('googleapis');
const privatekey = require("../privatekey.json");
const { Meeting, Room, Event } = require('../models/DatabaseConnection');

class EventsCommands {

  constructor() {}

  async addEvent(payload) {
    try {
      await Event.create(payload);
      return { status: 200, body: { message: 'Event created.' } };
    } catch (e) {
      return { status: 400, body: { message: 'Missing params' } };
    }
  }

  async editEvent(payload) {
    const event = await Event.findOne({ where: { id: payload.id }});
    if (!event) {
      return { status: 400, body: { message: 'Event do not exist' } };
    }
    event.name = payload.name;
    event.location = payload.location;
    event.price = payload.price;
    event.startDate = payload.startDate;
    event.startTime = payload.startTime;
    event.endDate = payload.endDate;
    event.endTime = payload.endTime;
    await event.save();
    return { status: 200, body: { message: 'Event edited' } };
  }

  addMeetings(meetingBody, user) {
    console.log(meetingBody);
    return new Promise(async (resolve) => {
      const meetings = await Meeting.findAll({
        where: { roomId: meetingBody.roomId },
      });
      const startDateTimestamp = new Date(meetingBody.startDate+':00+03:00').getTime();
      const endDateTimestamp = new Date(meetingBody.endDate+':00+03:00').getTime();
      for (const meeting of meetings) {
        if ((startDateTimestamp >= meeting.startDate &&
          startDateTimestamp < meeting.endDate) ||
          endDateTimestamp <= meeting.endDate &&
          endDateTimestamp > meeting.startDate) {
          resolve({ status: 409, message: 'Room is already taken by someone else.' });
          return;
        }
      }

      const meeting = await Meeting.create({
        ...meetingBody,
        startDate: startDateTimestamp,
        endDate: endDateTimestamp,
        attenders: meetingBody.attenders.join(','),
        userId: user.id,
      });
      const room = await Room.findOne({
        where: { id: meeting.roomId },
      });
      if (!meeting) {
        resolve({ status: 409, message: 'An error occurred. Please contact administrator.' });
        return;
      }
      let jwtClient = new google.auth.JWT(
        privatekey.client_email,
        null,
        privatekey.private_key,
        [
          'https://www.googleapis.com/auth/calendar',
        ]);
      jwtClient.authorize(function (err, tokens) {
        if (err) {
          console.log(err);
        } else {
          const calendar = google.calendar('v3');
          const event = {
            'summary': meeting.name,
            'location': room.name,
            'description': '',
            'start': {
              'dateTime': `${meetingBody.startDate}:00+03:00`,
              'timeZone': 'Europe/Bucharest',
            },
            'end': {
              'dateTime': `${meetingBody.endDate}:00+03:00`,
              'timeZone': 'Europe/Bucharest',
            },
            'attendees': meetingBody.attenders.map((m) => {
              return {'email': m}
            }),
            'reminders': {
              'useDefault': false,
              'overrides': [
                {'method': 'email', 'minutes': 10},
                {'method': 'popup', 'minutes': 10},
              ],
            },
          };
          calendar.events.insert({
            auth: jwtClient,
            calendarId: 'itransfer.noreply@gmail.com',
            resource: event
          }, async (err, event) => {
            if (err) {
              console.log(err);
              resolve({ status: 409, message: 'An error occurred. Please contact administrator.' });
              return;
            }
            console.log(event.data.id);
            meeting.gcalendar_meeting_id = event.data.id;
            await meeting.save();
            resolve({ status: 200, message: 'Event was added in calendar.' });
          })
        }
      });
    });
  }

  deleteMeeting(meetingId, user) {
    return new Promise(async (resolve) => {
      const meeting = await Meeting.findOne({
        where: { id: meetingId }
      });
      if (!meeting) {
        resolve({ status: 200, message: 'An error occured.' });
        return;
      }
      if (meeting.userId !== user.id) {
        resolve({ status: 200, message: 'You do not have permissions to remove this event.' });
        return;
      }
      const jwtClient = new google.auth.JWT(
        privatekey.client_email,
        null,
        privatekey.private_key,
        [
          'https://www.googleapis.com/auth/calendar',
        ]);
      jwtClient.authorize(function (err, tokens) {
        if (err) {
          console.log(err);
        } else {
          const calendar = google.calendar('v3');
          calendar.events.delete({
            auth: jwtClient,
            calendarId: 'itransfer.noreply@gmail.com',
            eventId: meeting.gcalendar_meeting_id,
          }, async (err) => {
            if (err) {
              console.log(err);
              resolve({ status: 409, message: 'An error occurred. Please contact administrator.' });
              return;
            }
            await meeting.destroy();
            resolve({ status: 200, message: 'Event was deleted from calendar.' });
          });
        }
      });
    });
  }
}

module.exports = { EventsCommands };
