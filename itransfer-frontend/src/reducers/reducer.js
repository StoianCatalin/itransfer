import { combineReducers } from 'redux'
import { userReducer } from "./user.reducer";
import { snackbarReducer } from "./snackbar.reducer";
import {paymentReducer} from "./payment.reducer";

export const rootReducer = combineReducers({
  user: userReducer,
  snackbar: snackbarReducer,
  payments: paymentReducer,
});
