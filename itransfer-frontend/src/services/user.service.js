import axios from 'axios';
import {baseUrl} from "../common/config";

export default class UserService {

  constructor() {
    this.baseUrl = `${baseUrl}/users`;
  }

  getMe() {
    return axios.get(`${this.baseUrl}/me`);
  }

}
