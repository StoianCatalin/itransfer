import axios from 'axios';
import {baseUrl} from "../common/config";

export default class PaymentService {

  constructor() {
    this.baseUrl = `${baseUrl}/payments`;
  }

  getPayments() {
    return axios.get(`${this.baseUrl}/all`);
  }

  payWithCreditCard(paymentId, card) {
    return axios.post(`${this.baseUrl}/card/${paymentId}`, { card });
  }

  getAllPayments() {
    return axios.get(`${this.baseUrl}`);
  }

}
