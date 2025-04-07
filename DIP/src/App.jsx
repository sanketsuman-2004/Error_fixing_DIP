import { useState, useEffect } from "react";
import UploadForm from "./components/UploadForm";
import ProcessedImage from "./components/ProcessedImage";

const App = () => {
  const [filename, setFilename] = useState(null);
  const [filter, setFilter] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "about"

  // Track mouse position for lighting effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Fancy light effect that follows cursor */}
      <div 
        className="pointer-events-none absolute w-96 h-96 rounded-full bg-teal-400 opacity-10 blur-3xl"
        style={{
          left: `${mousePosition.x - 192}px`,
          top: `${mousePosition.y - 192}px`,
          transition: "transform 0.1s ease-out",
        }}
      />

      {/* Top navbar */}
      <div className="fixed top-0 left-0 right-0 z-30 glass px-4 py-3 backdrop-blur-md bg-gray-900 bg-opacity-70 border-b border-gray-800">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-300">
              Image Processor
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            <button 
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                activeTab === "upload" 
                  ? "bg-teal-600 text-white" 
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              Upload & Process
            </button>
            <button 
              onClick={() => setActiveTab("about")}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                activeTab === "about" 
                  ? "bg-teal-600 text-white" 
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              About Filters
            </button>
          </div>
          
          <div className="flex md:hidden">
            <button className="text-gray-300 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {activeTab === "upload" ? (
        <div className="relative z-10 flex flex-col md:flex-row w-full max-w-6xl gap-6 p-6 md:p-8 glass rounded-xl shadow-2xl">
          {/* Upload Section */}
          <div className="w-full md:w-1/2 p-6 glass rounded-lg shadow-lg border border-gray-700 hover-glow transition-all duration-300">
            <h2 className="text-2xl font-bold text-teal-400 mb-6">
              Upload Image
            </h2>
            <UploadForm setFilename={setFilename} setFilter={setFilter} setIsProcessing={setIsProcessing} />
          </div>

          {/* Processed Image Section */}
          <div className="w-full md:w-1/2 p-6 glass rounded-lg shadow-lg border border-gray-700 hover-glow transition-all duration-300">
            <h2 className="text-2xl font-bold text-teal-400 mb-6">
              Preview Results
            </h2>
            <ProcessedImage filename={filename} filter={filter} isProcessing={isProcessing} />
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-4xl p-8 glass rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold text-teal-400 mb-6">About Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "Sharpen", desc: "Enhances edge details to make the image appear more crisp and detailed." },
              { name: "Blur", desc: "Smooths out the image by reducing noise and detail, giving a softer appearance." },
              { name: "Edge Detection", desc: "Identifies and highlights edges and boundaries within the image." },
              { name: "Emboss", desc: "Creates a 3D relief effect that makes the image appear raised or stamped." },
              { name: "Outline", desc: "Extracts and emphasizes the contours and shapes in the image." },
              { name: "High Pass", desc: "Filters out low-frequency information while preserving high-frequency details." }
            ].map((filter, index) => (
              <div key={index} className="p-4 glass rounded-lg border border-gray-700 hover-glow transition-all duration-300">
                <h3 className="text-xl font-semibold text-teal-400 mb-2">{filter.name}</h3>
                <p className="text-gray-300">{filter.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-teal-400 mb-2">How It Works</h3>
            <p className="text-gray-300">
              This app uses convolution kernels to transform images. Each filter applies a specific mathematical operation
              to every pixel in your image, considering its surrounding pixels. The process is entirely done on the server
              using OpenCV, a powerful computer vision library.
            </p>
          </div>
          
          <button 
            onClick={() => setActiveTab("upload")}
            className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-all duration-300"
          >
            Try It Now
          </button>
        </div>
      )}
      
      {/* Footer */}
      <div className="absolute bottom-2 right-4 text-xs text-gray-500">v1.3.0</div>
    </div>
  );
};

export default App;