import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

import Spinner from "./components/Spinner";
import { getUser } from "./Redux/Reducer/authReducer";

const MAIN_LOGIN_URL =
  "/login";

const PrivateRoute = () => {
  const dispatch = useDispatch();

  const {
    userInfo,
    loading,
  } = useSelector((state) => state.auth);

  // ============================================================
  // CHECK AUTH
  // ============================================================

  useEffect(() => {
    if (!userInfo) {
      dispatch(getUser());
    }
  }, [dispatch, userInfo]);

  // ============================================================
  // WAITING FOR AUTH CHECK
  // ============================================================

  if (loading) {
    return <Spinner />;
  }

  // ============================================================
  // NOT LOGGED IN
  // REDIRECT TO MAIN DOMAIN LOGIN
  // ============================================================

  if (!userInfo) {
    window.location.replace(MAIN_LOGIN_URL + window.location.pathname);

    return <Spinner />;
  }

  // ============================================================
  // AUTHENTICATED
  // ============================================================

  return <Outlet />;
};

export default PrivateRoute;
