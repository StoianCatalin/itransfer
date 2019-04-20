import {FETCH_PAYMENTS, LOGIN_USER, LOGOUT_USER, SET_MEMBERS} from "../actions/actionTypes";
import axios from 'axios';


const initialState = {
    list: []
};

export function paymentReducer(state = initialState, action) {
    let newState;
    switch (action.type) {
        case FETCH_PAYMENTS:
            newState = {
                list: action.payload
            };
            return newState;
        default:
            return state;
    }
}
