import axios from 'axios';
import {baseUrl} from "../common/config";

export default class AuthService {

  constructor() {
    this.baseUrl = `${baseUrl}/auth`;
  }

  login(email, password) {
    return axios.post(`${this.baseUrl}/login`, { email, password });
  }

  register(user, plan) {
    return axios.post(`${this.baseUrl}/register`, { user, plan });
  }

}
