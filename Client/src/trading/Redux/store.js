// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Reducer/authReducer';
import betReducer from './Reducer/betReducer';
import paymentReducer from './Reducer/paymentReducer';

const store = configureStore({
  reducer: {
    auth : authReducer,
    bet : betReducer,
    payment : paymentReducer,
  },
});

export default store;
