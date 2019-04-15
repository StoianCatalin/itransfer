import axios from 'axios';
import {baseUrl} from "../common/config";

export default class PlansService {

  constructor() {
    this.baseUrl = `${baseUrl}/plans`;
  }

  getPlans(id) {
    return axios.get(`${this.baseUrl}/${id}`);
  }

}
