from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io

class CurrencyDetector:
    def __init__(self, model_path='assets/best.pt'):
        """Initialize currency detector with custom trained model"""
        self.model = YOLO(model_path)
        self.class_names = self.model.names
        
    def detect_currency(self, image_bytes, conf_threshold=0.25):
        """
        Detect Pakistani currency in an image
        
        Args:
            image_bytes: Image as bytes
            conf_threshold: Confidence threshold for detections (0-1)
            
        Returns:
            dict: Detection results with bounding boxes, classes, and confidences
        """
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert PIL to numpy array
        image_np = np.array(image)
        
        # Run inference
        results = self.model(image_np, conf=conf_threshold)
        
        # Process results
        detections = []
        total_amount = 0
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # Get confidence and class
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                class_name = self.class_names[class_id]
                
                # Try to extract currency value from class name
                try:
                    # Assuming class names are like "10", "20", "50", "100", etc.
                    currency_value = int(''.join(filter(str.isdigit, class_name)))
                    total_amount += currency_value
                except:
                    currency_value = None
                
                detections.append({
                    'class': class_name,
                    'class_id': class_id,
                    'confidence': confidence,
                    'value': currency_value,
                    'bbox': {
                        'x1': x1,
                        'y1': y1,
                        'x2': x2,
                        'y2': y2
                    }
                })
        
        return {
            'detections': detections,
            'count': len(detections),
            'total_amount': total_amount,
            'image_size': {
                'width': image.width,
                'height': image.height
            }
        }
    
    def detect_and_draw(self, image_bytes, conf_threshold=0.25):
        """
        Detect currency and return annotated image
        
        Args:
            image_bytes: Image as bytes
            conf_threshold: Confidence threshold for detections
            
        Returns:
            bytes: Annotated image as bytes
        """
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        
        # Run inference
        results = self.model(image_np, conf=conf_threshold)
        
        # Draw annotations
        annotated_img = results[0].plot()
        
        # Convert back to bytes
        annotated_pil = Image.fromarray(annotated_img)
        img_byte_arr = io.BytesIO()
        annotated_pil.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return img_byte_arr.getvalue()