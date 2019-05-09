import axios from 'axios';
import {baseUrl} from "../common/config";

export default class EventsService {

  constructor() {
    this.baseUrl = `${baseUrl}/events`;
  }

  getRooms() {
    return axios.get(`${this.baseUrl}/rooms`);
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

}
