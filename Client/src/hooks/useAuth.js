// src/hooks/useAuth.js
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  
  const { 
    isAuthenticated, 
    profileLoaded, 
    isProfileLoading,
    loading,
    user,
    error 
  } = authState;

  const refreshProfile = () => {
    if (isAuthenticated) {
      dispatch(getProfile());
    }
  };

  return {
    ...authState,
    isLoading: loading || isProfileLoading,
    isReady: profileLoaded || !isAuthenticated,
    refreshProfile,
    hasUser: !!user,
  };
};