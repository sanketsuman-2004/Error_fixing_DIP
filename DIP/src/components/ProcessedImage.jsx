import { useState, useEffect } from "react";
import Spinner from "./Spinner";

const ProcessedImage = ({ filename, filter, isProcessing }) => {
  const [viewMode, setViewMode] = useState("side-by-side");
  const [isComparing, setIsComparing] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset image loaded state when filter changes
  useEffect(() => {
    setImageLoaded(false);
  }, [filter]);

  if (!filename) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-gray-800 opacity-50"></div>
          <svg className="absolute inset-0 w-20 h-20 text-gray-500 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <p className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-200">Select an image and apply a filter</p>
        <p className="text-sm mt-3 max-w-xs text-gray-400">Upload an image and choose a filter to see the transformation</p>
      </div>
    );
  }

  const originalImage = `http://127.0.0.1:5000/uploads/${filename}`;
  const processedImage = `http://127.0.0.1:5000/processed/${filter}_${filename}`;

  const handleCompareMove = (e) => {
    if (isComparing) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = (x / rect.width) * 100;
      setComparePosition(Math.max(0, Math.min(100, percent)));
    }
  };

  // Format filter name for display
  const formatFilterName = (name) => {
    if (!name) return "";
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      {/* View mode toggle */}
      {filter && !isProcessing && (
        <div className="flex gap-2 mb-2 p-1 bg-gray-800 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700">
          <button
            onClick={() => setViewMode("side-by-side")}
            className={`px-4 py-1.5 text-xs rounded-md transition-all duration-300 ${
              viewMode === "side-by-side" 
                ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg" 
                : "bg-transparent hover:bg-gray-700 text-gray-300"
            }`}
          >
            Side by Side
          </button>
          <button
            onClick={() => setViewMode("comparison")}
            className={`px-4 py-1.5 text-xs rounded-md transition-all duration-300 ${
              viewMode === "comparison" 
                ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg" 
                : "bg-transparent hover:bg-gray-700 text-gray-300"
            }`}
          >
            Comparison Slider
          </button>
        </div>
      )}

      {/* Images Display */}
      {viewMode === "side-by-side" ? (
        <div className="flex flex-col sm:flex-row gap-6 w-full">
          {/* Original Image */}
          <div className="w-full sm:w-1/2">
            <p className="text-xs text-center mb-2 text-gray-400 font-medium">Original</p>
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black animate-pulse"></div>
              <img
                src={originalImage}
                alt="Original"
                className={`w-full h-auto rounded-lg border border-gray-700 transition-all duration-500 group-hover:scale-105 relative z-10 ${isProcessing ? 'opacity-50' : 'opacity-100'}`}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-0 group-hover:opacity-80 transition-opacity z-20 flex items-end justify-center p-3">
                <span className="text-xs text-gray-300 font-medium">Original</span>
              </div>
            </div>
          </div>

          {/* Processed Image with Spinner */}
          <div className="w-full sm:w-1/2">
            <p className="text-xs text-center mb-2 font-medium">
              {isProcessing ? (
                <span className="text-teal-400 animate-pulse">Processing...</span>
              ) : filter ? (
                <span className="text-teal-300">{formatFilterName(filter)} Filter</span>
              ) : (
                <span className="text-gray-400">Awaiting Processing</span>
              )}
            </p>
            <div className="relative overflow-hidden rounded-lg bg-gray-900 aspect-square sm:aspect-auto flex items-center justify-center min-h-64 shadow-lg group">
              {isProcessing ? (
                <Spinner />
              ) : filter ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-gray-900 animate-pulse"></div>
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="w-full h-auto rounded-lg border border-teal-900/50 transition-all duration-500 group-hover:scale-105 relative z-10"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-0 group-hover:opacity-80 transition-opacity z-20 flex items-end justify-center p-3">
                    <span className="text-xs text-teal-300 font-medium capitalize">{formatFilterName(filter)}</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        // Comparison slider view
        filter && !isProcessing && (
          <div 
            className="relative w-full h-64 sm:h-96 rounded-lg overflow-hidden cursor-col-resize shadow-xl border border-gray-700 group"
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onMouseLeave={() => setIsComparing(false)}
            onMouseMove={handleCompareMove}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            onTouchMove={(e) => {
              if (isComparing) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                const percent = (x / rect.width) * 100;
                setComparePosition(Math.max(0, Math.min(100, percent)));
              }
            }}
          >
            <div className="absolute inset-0 z-10">
              <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
            </div>
            <div 
              className="absolute inset-0 z-20 overflow-hidden"
              style={{ width: `${comparePosition}%` }}
            >
              <img src={processedImage} alt="Processed" className="absolute top-0 left-0 w-full h-full object-cover" />
              <div className="absolute inset-y-0 right-0 w-0.5 bg-white shadow-lg"></div>
            </div>
            <div 
              className="absolute z-30 inset-y-0 border-l-2 border-white shadow-lg" 
              style={{ left: `${comparePosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-teal-600 to-teal-500 rounded-full text-white text-xs font-bold">
                  ◄►
                </div>
              </div>
            </div>
            {/* Labels */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 backdrop-blur-sm text-white text-xs py-1.5 px-3 rounded-full z-40 shadow-lg">Original</div>
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 backdrop-blur-sm text-teal-300 text-xs py-1.5 px-3 rounded-full z-40 capitalize shadow-lg">{formatFilterName(filter)}</div>
          </div>
        )
      )}

      {/* Download Button */}
      {filter && !isProcessing && (
        <button
          className="mt-6 px-6 py-2.5 text-white bg-gradient-to-r from-teal-600 to-teal-500 rounded-lg 
            hover:from-teal-500 hover:to-teal-400 active:from-teal-700 active:to-teal-600 shadow-lg 
            transition-all duration-300 transform hover:-translate-y-1 group
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          onClick={() => {
            const link = document.createElement("a");
            link.href = processedImage;
            link.download = `${filter}_processed_${filename}`;
            link.click();
          }}
        >
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            <span className="font-medium">Download Processed Image</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default ProcessedImage;