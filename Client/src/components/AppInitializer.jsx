import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../redux/slices/authSlice";

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, profileLoaded, isProfileLoading } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated && !profileLoaded && !isProfileLoading) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, profileLoaded, isProfileLoading, dispatch]);

  return children;
};

export default AppInitializer;
