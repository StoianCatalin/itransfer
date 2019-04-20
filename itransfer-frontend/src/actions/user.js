import {LOGIN_USER, LOGOUT_USER, SET_MEMBERS, UPDATE_MEMBERS} from './actionTypes';
import UserService from "../services/user.service";

const userService = new UserService();

export function loginUser(user) {
    return {
        type: LOGIN_USER,
        payload: user
    }
}

export function logoutUser() {
    return {
        type: LOGOUT_USER
    }
}

export function setMembers(members) {
    return {
        type: SET_MEMBERS,
        payload: members,
    }
}

export function updateMembers(members) {
    return dispatch => {
        userService.updateMembers(members).then((response) => {
            dispatch(setMembers(response.data));
        })
    }
}
