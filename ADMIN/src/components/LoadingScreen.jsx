import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-600 via-pink-600 to-red-500">
      {/* Background Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Main Loader */}
        <div className="relative">
          {/* Outer Ring */}
          <div className="w-20 h-20 border-4 border-white/20 rounded-full"></div>
          
          {/* Spinning Ring */}
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
          
          {/* Second Spinning Ring (Opposite Direction) */}
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-b-purple-200 rounded-full animate-spin-slow"></div>
          
          {/* Inner Logo/Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
        </div>
        
        {/* Loading Text with Gradient */}
        <div className="mt-8 space-y-2 text-center">
          <h2 className="text-2xl font-bold text-white">
            Loading<span className="animate-pulse">...</span>
          </h2>
          <p className="text-white/80 text-sm font-light">
            Please wait while we prepare your dashboard
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-white rounded-full animate-loading-bar"></div>
        </div>
        
        {/* Animated Dots */}
        <div className="mt-4 flex gap-2">
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.45s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;