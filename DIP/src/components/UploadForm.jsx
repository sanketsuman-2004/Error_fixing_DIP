import { useState, useRef, useEffect } from "react";
import axios from "axios";

const UploadForm = ({ setFilename, setFilter, setIsProcessing }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [hoverFilter, setHoverFilter] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

  const filterInfo = {
    sharpen: {
      description: "Enhance edge details and clarity", 
      icon: "✧"
    },
    blur: {
      description: "Smooth out noise and details",
      icon: "◎"
    },
    edge_x: {
      description: "Detect horizontal edges and boundaries",
      icon: "⟷"
    },
    emboss: {
      description: "Create 3D relief effect",
      icon: "◢"
    },
    outline: {
      description: "Extract image contours",
      icon: "◇"
    },
    high_pass: {
      description: "Highlight fine details and textures",
      icon: "◈"
    },
  };

  // Create image preview when file is selected
  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // Free memory when component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (event) => {
    setError(null);
    const file = event.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        setError("File is too large. Please select an image under 15MB.");
        return;
      }
      setSelectedFile(file);
      setFilename(file.name);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        setError("File is too large. Please select an image under 15MB.");
        return;
      }
      if (!allowed_file(file.name)) {
        setError("Unsupported file type. Please use PNG, JPG, JPEG, or BMP.");
        return;
      }
      setSelectedFile(file);
      setFilename(file.name);
    }
  };

  const allowed_file = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return ["png", "jpg", "jpeg", "bmp"].includes(extension);
  };

  const handleUpload = async (filterType) => {
    if (!selectedFile) {
      setError("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("filter", filterType);

    setIsProcessing(true);
    setError(null);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData);
      const data = response.data;

      if (data.success) {
        setFilter(filterType);
        setFilename(selectedFile.name);
      } else {
        setError("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      setError(error.response?.data?.error || "Failed to process the image. Server might be offline.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* File Drop Area */}
      <div 
        onClick={() => fileInputRef.current.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center h-48 border-2 border-dashed 
          rounded-xl cursor-pointer transition-all duration-300
          ${selectedFile ? 'border-teal-500 bg-teal-900 bg-opacity-20' : 'border-gray-700 hover:border-teal-400 hover:bg-gray-800 hover:bg-opacity-30'}
          ${dragActive ? 'border-teal-400 bg-teal-900 bg-opacity-30 scale-105 shadow-lg shadow-teal-900/20' : ''}
          overflow-hidden
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/png,image/jpeg,image/jpg,image/bmp"
        />
        
        {/* Preview background */}
        {preview && (
          <div className="absolute inset-0 opacity-20">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover filter blur-sm"
            />
            <div className="absolute inset-0 bg-gray-900 bg-opacity-70"></div>
          </div>
        )}
        
        <div className="flex flex-col items-center text-center z-10">
          {selectedFile ? (
            <>
              <div className="relative w-16 h-16 mb-2 overflow-hidden rounded-lg border-2 border-teal-500 shadow-lg shadow-teal-900/30">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-sm text-teal-300 font-medium">
                <p className="truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-gray-400 mt-1">Click or drop to change</p>
              </div>
            </>
          ) : (
            <>
              <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <div>
                <p className="text-base text-gray-300">Click or drag image here</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, BMP (max 15MB)</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm animate-pulse">
          {error}
        </div>
      )}

      {/* Filter Buttons */}
      <div className="mt-2">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Apply Filter Effect:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(filterInfo).map(([filter, info]) => (
            <div 
              key={filter}
              className="relative group"
              onMouseEnter={() => setHoverFilter(filter)}
              onMouseLeave={() => setHoverFilter(null)}
            >
              <button
                onClick={() => handleUpload(filter)}
                disabled={!selectedFile}
                className={`
                  w-full px-3 py-3 bg-gray-800 rounded-lg 
                  border border-gray-700 shadow-md group-hover:border-teal-500
                  transition-all duration-300 group-hover:-translate-y-1
                  flex items-center justify-center gap-2
                  ${!selectedFile ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-teal-900/30 hover:shadow-lg'}
                `}
              >
                <span className="text-xl opacity-70 group-hover:text-teal-400 transition-colors">
                  {info.icon}
                </span>
                <span className="capitalize">
                  {filter.replace('_', ' ')}
                </span>
              </button>
              
              {/* Tooltip */}
              {hoverFilter === filter && (
                <div className="absolute -top-14 left-0 w-full z-10">
                  <div className="bg-gray-800 text-xs p-2 rounded-md shadow-lg border border-teal-500 border-opacity-50 text-center">
                    {info.description}
                    <div className="absolute w-3 h-3 bg-gray-800 border-r border-b border-teal-500 border-opacity-50 transform rotate-45 left-1/2 -bottom-1.5 -ml-1.5"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadForm;