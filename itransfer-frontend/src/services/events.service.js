import axios from 'axios';
import {baseUrl} from "../common/config";

export default class EventsService {

  constructor() {
    this.baseUrl = `${baseUrl}/events`;
  }

  getRooms() {
    return axios.get(`${this.baseUrl}/rooms`);
  }

  getOffices() {
    return axios.get(`${this.baseUrl}/offices`);
  }

  createMeeting(meetingBody) {
    return axios.post(`${this.baseUrl}/meeting`, meetingBody);
  }

  getMeetings() {
    return axios.get(`${this.baseUrl}`);
  }

  deleteMeeting(eventId) {
    return axios.delete(`${this.baseUrl}/meeting/${eventId}`);
  }

  getEvents() {
    return axios.get(`${this.baseUrl}/events`);
  }

  getEventsUser() {
    return axios.get(`${this.baseUrl}/events/user`);
  }

  createEvent(payload) {
    return axios.post(`${this.baseUrl}/events`, payload);
  }

  editEvent(payload) {
    return axios.put(`${this.baseUrl}/events`, payload);
  }

  deleteEvent(eventId) {
    return axios.delete(`${this.baseUrl}/events/${eventId}`);
  }

  signUpEvent(eventId) {
    return axios.post(`${this.baseUrl}/events/signup/${eventId}`);
  }

}
