import {LOGIN_USER, LOGOUT_USER, SET_MEMBERS} from "../actions/actionTypes";
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
        members: [],
        plan: null,
    };
}

export function userReducer(state = initialState, action) {
    let newState;
    switch (action.type) {
        case LOGIN_USER:
            newState = { ...state, ...action.payload, authenticated: true };
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
                members: [],
                plan: null,
            };
        case SET_MEMBERS:
            newState = { ...state, members: action.payload };
            sessionStorage.setItem('user', JSON.stringify(newState));
            return newState;
        default:
            return state;
    }
}
