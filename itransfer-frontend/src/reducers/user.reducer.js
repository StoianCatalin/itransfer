import {LOGIN_USER, LOGOUT_USER} from "../actions/actionTypes";
import axios from 'axios';

let initialState = sessionStorage.getItem('user');

if (initialState) {
    initialState = JSON.parse(initialState);
} else {
    initialState = {
        full_name: '',
        role: '',
        email: '',
        password: '',
        token: '',
        authenticated: false,
    };
}

export function userReducer(state = initialState, action) {
    switch (action.type) {
        case LOGIN_USER:
            const newState = { ...state, ...action.payload, authenticated: true };
            sessionStorage.setItem('user', JSON.stringify(newState));
            if (newState.token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${newState.token}`;
            }
            return newState;
        case LOGOUT_USER:
            sessionStorage.removeItem('user');
            return {
                full_name: '',
                role: '',
                email: '',
                password: '',
                token: '',
                authenticated: false,
            };
        default:
            return state;
    }
}
