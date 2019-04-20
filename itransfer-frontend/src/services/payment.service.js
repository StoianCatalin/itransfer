import axios from 'axios';
import {baseUrl} from "../common/config";

export default class PaymentService {

  constructor() {
    this.baseUrl = `${baseUrl}/payments`;
  }

  getPayments() {
    return axios.get(`${this.baseUrl}/all`);
  }

}
