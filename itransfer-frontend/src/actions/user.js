import { CREATE_USER } from './actionTypes';

function createUser(user) {
    return {
        type: CREATE_USER,
        payload: user,
    }
}