import {CLOSE_SNACKBAR, OPEN_SNACKBAR} from "./actionTypes";

export function openSnackbar(message) {
  return {
    type: OPEN_SNACKBAR,
    payload: { message }
  }
}

export function closeSnackbar() {
  return {
    type: CLOSE_SNACKBAR
  }
}
