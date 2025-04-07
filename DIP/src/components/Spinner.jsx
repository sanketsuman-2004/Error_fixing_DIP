import React from "react";

const Spinner = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-20 h-20">
        {/* Multiple rings for a more dynamic effect */}
        <div className="absolute inset-0 rounded-full border-4 border-t-teal-400 border-r-teal-300 border-b-teal-200 border-l-gray-700 animate-spin"></div>
        <div className="absolute inset-1 rounded-full border-2 border-t-teal-500 border-r-transparent border-b-teal-300 border-l-transparent animate-spin animate-reverse"></div>
        
        {/* Inner elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="text-sm text-teal-300 animate-pulse font-medium tracking-wide">
        Applying filter...
      </p>
    </div>
  );
};

export default Spinner;