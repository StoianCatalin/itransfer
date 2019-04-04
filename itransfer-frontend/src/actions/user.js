import {LOGIN_USER} from './actionTypes';

export function loginUser(user) {
    return {
        type: LOGIN_USER,
        payload: user
    }
}