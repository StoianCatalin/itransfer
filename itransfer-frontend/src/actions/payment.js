import PaymentService from "../services/payment.service";
import {FETCH_PAYMENTS} from "./actionTypes";

const paymentService = new PaymentService();

export function setPayments(payments) {
    return {
        type: FETCH_PAYMENTS,
        payload: payments,
    }
}

export function fetchPayments() {
    return dispatch => {
        paymentService.getPayments().then((response) => {
            dispatch(setPayments(response.data));
        })
    }
}
