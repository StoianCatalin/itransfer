import {CLOSE_SNACKBAR, OPEN_SNACKBAR} from "../actions/actionTypes";

const initialState = {
  open: false,
  message: ''
};

export function snackbarReducer(state = initialState, action) {
  switch (action.type) {
    case OPEN_SNACKBAR:
      return { ...state, ...action.payload, open: true };
    case CLOSE_SNACKBAR:
      return { open: false, message: '' };
    default:
      return state;
  }
}
