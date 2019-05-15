import axios from 'axios';
import {baseUrl} from "../common/config";

export default class UserService {

  constructor() {
    this.baseUrl = `${baseUrl}/users`;
  }

  getMe() {
    return axios.get(`${this.baseUrl}/me`);
  }

  updateMembers(members) {
    return axios.post(`${this.baseUrl}/members`, members);
  }

  getAllUsers() {
    return axios.get(`${this.baseUrl}`);
  }

  saveUser(user) {
    return axios.post(`${this.baseUrl}`, user);
  }

  downloadContractUrl(contractUrl) {
    return `${this.baseUrl}/contracts/${contractUrl}`;
  }

  deleteUser(userId) {
    return axios.delete(`${this.baseUrl}/${userId}`);
  }

}
