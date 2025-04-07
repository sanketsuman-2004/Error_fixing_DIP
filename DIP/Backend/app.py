from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
import os
from werkzeug.utils import secure_filename
import time
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "gif", "webp"}  # Extended supported formats
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["PROCESSED_FOLDER"] = PROCESSED_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # Limit uploads to 16MB

# Helper function to check allowed file extensions
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Clear old files to avoid clutter (executed at server start)
def clear_old_files(folder, max_age_hours=24):
    current_time = time.time()
    max_age_seconds = max_age_hours * 60 * 60
    
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            file_age = current_time - os.path.getmtime(file_path)
            if file_age > max_age_seconds:
                os.remove(file_path)
                print(f"Deleted old file: {file_path}")
        except Exception as e:
            print(f"Failed to delete {file_path}: {e}")

# Use OpenCV's built-in filter functions for better efficiency
def apply_filter(image, filter_type):
    if filter_type == "sharpen":
        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
        return cv2.filter2D(image, -1, kernel)
    
    elif filter_type == "blur":
        return cv2.GaussianBlur(image, (9, 9), 0)
    
    elif filter_type == "edge_x":
        return cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=3)
    
    elif filter_type == "emboss":
        kernel = np.array([[-2, -1, 0], [-1, 1, 1], [0, 1, 2]], dtype=np.float32)
        return cv2.filter2D(image, -1, kernel)
    
    elif filter_type == "outline":
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) > 2 else image
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blur, 50, 150)
        if len(image.shape) > 2:
            return cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
        return edges
    
    elif filter_type == "high_pass":
        kernel = np.array([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], dtype=np.float32)
        return cv2.filter2D(image, -1, kernel)
    
    # Add new filters
    elif filter_type == "sepia":
        sepia_kernel = np.array([[0.272, 0.534, 0.131],
                                [0.349, 0.686, 0.168],
                                [0.393, 0.769, 0.189]])
        sepia_image = cv2.transform(image, sepia_kernel)
        return np.clip(sepia_image, 0, 255).astype(np.uint8)
    
    elif filter_type == "invert":
        return cv2.bitwise_not(image)
    
    elif filter_type == "pencil_sketch":
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        sketch, _ = cv2.pencilSketch(blur, sigma_s=60, sigma_r=0.07, shade_factor=0.05)
        return cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR)
    
    else:
        # Default: return original image
        return image

@app.route("/upload", methods=["POST"])
def upload_image():
    if "file" not in request.files or "filter" not in request.form:
        return jsonify({"error": "No file or filter specified"}), 400

    file = request.files["file"]
    filter_type = request.form["filter"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type"}), 400

    # Use a unique filename to avoid conflicts
    original_filename = secure_filename(file.filename)
    filename = f"{uuid.uuid4().hex}_{original_filename}"
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    # Read image correctly for OpenCV
    image = cv2.imread(file_path, cv2.IMREAD_COLOR)

    if image is None:
        return jsonify({"error": "Failed to load image"}), 500

    # Apply filter
    try:
        processed_image = apply_filter(image, filter_type)
    except Exception as e:
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500

    # Save processed image with filter name
    processed_filename = f"{filter_type}_{filename}"
    processed_path = os.path.join(app.config["PROCESSED_FOLDER"], processed_filename)
    cv2.imwrite(processed_path, processed_image)

    return jsonify({
        "success": True,
        "original_filename": original_filename,
        "uploaded_image": f"/uploads/{filename}",
        "processed_image": f"/processed/{processed_filename}"
    })

# Route to serve uploaded images
@app.route("/uploads/<filename>")
def get_uploaded_image(filename):
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to serve processed images (with download support)
@app.route("/processed/<filename>")
def get_processed_image(filename):
    try:
        return send_from_directory(
            PROCESSED_FOLDER, 
            filename, 
            as_attachment=request.args.get('download', '').lower() == 'true'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route("/health")
def health_check():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    # Clear old files when the server starts (files older than 24 hours)
    clear_old_files(UPLOAD_FOLDER)
    clear_old_files(PROCESSED_FOLDER)
    app.run(debug=True)