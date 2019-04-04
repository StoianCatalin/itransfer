import {LOGIN_USER} from "../actions/actionTypes";

const initialState = {
    name: '',
    role: '',
    email: '',
    password: '',
    token: '',
    authenticated: false,
};

export function userReducer(state = initialState, action) {
    switch (action.type) {
        case LOGIN_USER:
            return { ...state, ...action.payload, authenticated: true }
        default:
            return state;
    }
}
