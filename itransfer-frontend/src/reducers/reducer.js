import { combineReducers } from 'redux'
import { userReducer } from "./user.reducer";
import { snackbarReducer } from "./snackbar.reducer";

export const rootReducer = combineReducers({
  user: userReducer,
  snackbar: snackbarReducer,
});
