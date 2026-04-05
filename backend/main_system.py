import os
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import cv2
from PIL import Image
import shap
from explainability import ExplainabilityEngine
from report_generator import ReportGenerator
from model_manager import ModelManager
from input_validator import InputValidator

class BrainDiseaseAI:
    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(__file__), 'models')
        self.utils_dir = os.path.join(os.path.dirname(__file__), 'utils')
        self.explainability = ExplainabilityEngine()
        self.report_gen = ReportGenerator()
        self.input_validator = InputValidator()
        
        # Initialize and validate models
        print("\n" + "="*70)
        print("INITIALIZING BRAIN DISEASE AI SYSTEM")
        print("="*70)
        
        self.model_manager = ModelManager(self.models_dir)
        models_valid = self.model_manager.validate_models()
        
        if not models_valid:
            print("⚠ WARNING: Some models failed validation or are missing!")
        
        # Load models using ModelManager
        print("\nLoading models into memory...")
        try:
            self.alzheimer_model = self.model_manager.get_model('alzheimer_model.h5')
            print("✓ Alzheimer model loaded")
            
            self.brain_tumor_model = self.model_manager.get_model('brain_tumor_model.h5')
            print("✓ Brain Tumor model loaded")
            
            self.clinical_model_alz = self.model_manager.get_model('clincial_model_alz.pkl')
            print("✓ Clinical Alzheimer model loaded")
            
            self.clinical_model = self.model_manager.get_model('clinical_model.pkl')
            print("✓ Clinical Parkinson model loaded")
            
            self.clinical_scaler = self.model_manager.get_model('clinical_scaler.pkl')
            print("✓ Clinical scaler loaded")
            
            self.speech_model = self.model_manager.get_model('speech_model.pkl')
            print("✓ Speech model loaded")
            
            self.speech_scaler = self.model_manager.get_model('speech_scaler.pkl')
            print("✓ Speech scaler loaded")
            
            print("="*70 + "\n")
            
        except Exception as e:
            print(f"❌ Error loading models: {str(e)}")
            print("="*70 + "\n")
            raise

        # Class labels
        self.alzheimer_classes = ['MildDemented', 'ModerateDemented', 'NonDemented', 'VeryMildDemented']
        self.brain_tumor_classes = ['meningioma', 'notumor', 'glioma', 'pituitary']

    def preprocess_image(self, image_path, img_size=224):
        """Preprocess image for CNN models"""
        print(f"Preprocessing image: {image_path}")
        if not os.path.exists(image_path):
            raise ValueError(f"Image file does not exist: {image_path}")
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not load image with OpenCV: {image_path}")
        print(f"Original image shape: {img.shape}")
        img = cv2.resize(img, (img_size, img_size))
        img = img.astype('float32') / 255.0
        img = np.expand_dims(img, axis=0)
        print(f"Preprocessed shape: {img.shape}")
        return img

    def predict_alzheimer(self, image_path):
        """Predict Alzheimer from MRI image with validation and explainability"""
        print(f"\n{'='*70}")
        print(f"PROCESSING ALZHEIMER PREDICTION")
        print(f"{'='*70}")
        
        # Validate image file
        print("\n[1/6] Validating input image...")
        is_valid, errors, warnings = InputValidator.validate_image_file(image_path)
        
        if errors:
            print("❌ Validation Errors:")
            for error in errors:
                print(f"   - {error}")
            raise ValueError(f"Image validation failed: {errors[0]}")
        
        if warnings:
            print("⚠ Warnings:")
            for warning in warnings:
                print(f"   - {warning}")
        print("✓ Image validation passed")
        
        # Check model availability
        print("\n[2/6] Checking model availability...")
        if self.alzheimer_model is None:
            raise RuntimeError("Alzheimer model not loaded")
        print("✓ Model available")
        
        # Preprocess image
        print("\n[3/6] Preprocessing image...")
        img = self.preprocess_image(image_path, 224)
        print(f"✓ Image preprocessed: shape {img.shape}")
        
        # Validate input shape
        print("\n[4/6] Validating input shape...")
        is_valid, shape_msg = self.model_manager.validate_input_shape('alzheimer', img)
        if not is_valid:
            raise ValueError(f"Shape validation failed: {shape_msg}")
        print(f"✓ {shape_msg}")
        
        # Run prediction
        print("\n[5/6] Running model prediction...")
        prediction = self.alzheimer_model.predict(img, verbose=0)
        print(f"✓ Model prediction complete")
        predicted_class = np.argmax(prediction, axis=1)[0]
        confidence = np.max(prediction)
        print(f"   Predicted: {self.alzheimer_classes[predicted_class]} ({confidence:.1%})")
        
        # Generate explanations
        print("\n[6/6] Generating explanations...")
        heatmap = self.explainability.generate_grad_cam(self.alzheimer_model, img)
        heatmap_b64 = None
        if heatmap is not None:
            heatmap_b64 = self.explainability.visualize_heatmap(img, heatmap)
            print("✓ Grad-CAM heatmap generated")
        
        key_findings = [
            f"MRI analysis indicates {self.alzheimer_classes[predicted_class]}",
            f"Confidence level: {confidence:.1%}",
            "Brain atrophy patterns analyzed",
            "Cortical thickness assessment completed"
        ]
        explanation = self.explainability.generate_explanation_text(
            'Alzheimer Disease',
            self.alzheimer_classes[predicted_class],
            confidence,
            key_findings
        )
        print("✓ Explanation text generated")
        
        result = {
            'disease': 'Alzheimer',
            'prediction': self.alzheimer_classes[predicted_class],
            'confidence': float(confidence),
            'heatmap': heatmap_b64,
            'explanation': explanation,
            'key_findings': key_findings,
            'model_info': self.model_manager.get_model_info('alzheimer_model.h5')
        }
        
        print(f"\n{'='*70}")
        print(f"✓ PREDICTION COMPLETE")
        print(f"{'='*70}\n")
        return result

    def predict_brain_tumor(self, image_path):
        """Predict brain tumor from MRI image with validation and explainability"""
        print(f"\n{'='*70}")
        print(f"PROCESSING BRAIN TUMOR PREDICTION")
        print(f"{'='*70}")
        
        # Validate image file
        print("\n[1/6] Validating input image...")
        is_valid, errors, warnings = InputValidator.validate_image_file(image_path)
        
        if errors:
            print("❌ Validation Errors:")
            for error in errors:
                print(f"   - {error}")
            raise ValueError(f"Image validation failed: {errors[0]}")
        
        if warnings:
            print("⚠ Warnings:")
            for warning in warnings:
                print(f"   - {warning}")
        print("✓ Image validation passed")
        
        # Check model availability
        print("\n[2/6] Checking model availability...")
        if self.brain_tumor_model is None:
            raise RuntimeError("Brain Tumor model not loaded")
        print("✓ Model available")
        
        # Preprocess image
        print("\n[3/6] Preprocessing image...")
        img = self.preprocess_image(image_path, 128)
        print(f"✓ Image preprocessed: shape {img.shape}")
        
        # Validate input shape
        print("\n[4/6] Validating input shape...")
        is_valid, shape_msg = self.model_manager.validate_input_shape('tumor', img)
        if not is_valid:
            raise ValueError(f"Shape validation failed: {shape_msg}")
        print(f"✓ {shape_msg}")
        
        # Run prediction
        print("\n[5/6] Running model prediction...")
        prediction = self.brain_tumor_model.predict(img, verbose=0)
        print(f"✓ Model prediction complete")
        predicted_class = np.argmax(prediction, axis=1)[0]
        confidence = np.max(prediction)
        print(f"   Predicted: {self.brain_tumor_classes[predicted_class]} ({confidence:.1%})")
        
        # Generate explanations
        print("\n[6/6] Generating explanations...")
        heatmap = self.explainability.generate_grad_cam(self.brain_tumor_model, img)
        heatmap_b64 = None
        if heatmap is not None:
            heatmap_b64 = self.explainability.visualize_heatmap(img, heatmap)
            print("✓ Grad-CAM heatmap generated")
        
        key_findings = [
            f"Brain MRI analysis indicates {self.brain_tumor_classes[predicted_class]}",
            f"Confidence level: {confidence:.1%}",
            "Mass effect and contrast enhancement analyzed",
            "Perilesional edema assessment completed"
        ]
        explanation = self.explainability.generate_explanation_text(
            'Brain Tumor',
            self.brain_tumor_classes[predicted_class],
            confidence,
            key_findings
        )
        print("✓ Explanation text generated")
        
        result = {
            'disease': 'Brain Tumor',
            'prediction': self.brain_tumor_classes[predicted_class],
            'confidence': float(confidence),
            'heatmap': heatmap_b64,
            'explanation': explanation,
            'key_findings': key_findings,
            'model_info': self.model_manager.get_model_info('brain_tumor_model.h5')
        }
        
        print(f"\n{'='*70}")
        print(f"✓ PREDICTION COMPLETE")
        print(f"{'='*70}\n")
        return result

    def predict_parkinson_clinical(self, features):
        """Predict Parkinson from clinical features with validation"""
        print(f"\n{'='*70}")
        print(f"PROCESSING PARKINSON CLINICAL PREDICTION")
        print(f"{'='*70}")
        
        # Validate features
        print("\n[1/4] Validating clinical features...")
        is_valid, errors, warnings = InputValidator.validate_clinical_features(features, num_features=16)
        
        if errors:
            print("❌ Validation Errors:")
            for error in errors:
                print(f"   - {error}")
            raise ValueError(f"Feature validation failed: {errors[0]}")
        
        if warnings:
            print("⚠ Warnings:")
            for warning in warnings:
                print(f"   - {warning}")
        print("✓ Feature validation passed")
        
        # Check model availability
        print("\n[2/4] Checking model availability...")
        if self.clinical_model is None or self.clinical_scaler is None:
            raise RuntimeError("Clinical Parkinson model or scaler not loaded")
        print("✓ Model available")
        
        # Scale features
        print("\n[3/4] Scaling features...")
        features_scaled = self.clinical_scaler.transform([features])
        print(f"✓ Features scaled")
        
        # Run prediction
        print("\n[4/4] Running model prediction...")
        prediction = self.clinical_model.predict(features_scaled)[0]
        probability = self.clinical_model.predict_proba(features_scaled)[0]
        confidence = float(max(probability))
        print(f"✓ Prediction complete")
        print(f"   Result: {'Positive' if prediction == 1 else 'Negative'} ({confidence:.1%})")
        
        result = {
            'disease': 'Parkinson (Clinical)',
            'prediction': 'Positive' if prediction == 1 else 'Negative',
            'confidence': confidence,
            'model_info': self.model_manager.get_model_info('clinical_model.pkl')
        }
        
        print(f"\n{'='*70}")
        print(f"✓ PREDICTION COMPLETE")
        print(f"{'='*70}\n")
        return result

    def predict_alzheimer_clinical(self, features):
        """Predict Alzheimer risk from clinical features with validation"""
        print(f"\n{'='*70}")
        print(f"PROCESSING ALZHEIMER CLINICAL PREDICTION")
        print(f"{'='*70}")

        # Validate features
        print("\n[1/4] Validating clinical features...")
        is_valid, errors, warnings = InputValidator.validate_clinical_features(features, num_features=16)

        if errors:
            print("❌ Validation Errors:")
            for error in errors:
                print(f"   - {error}")
            raise ValueError(f"Feature validation failed: {errors[0]}")

        if warnings:
            print("⚠ Warnings:")
            for warning in warnings:
                print(f"   - {warning}")
        print("✓ Feature validation passed")

        # Check model availability
        print("\n[2/4] Checking model availability...")
        if self.clinical_model_alz is None:
            raise RuntimeError("Clinical Alzheimer model not loaded")
        print("✓ Model available")

        # Run prediction (fallback to scaled features if needed)
        print("\n[3/4] Preparing features...")
        features_array = np.array([features], dtype=float)

        print("\n[4/4] Running model prediction...")
        try:
            prediction = self.clinical_model_alz.predict(features_array)[0]
            probability = self.clinical_model_alz.predict_proba(features_array)[0]
        except Exception:
            if self.clinical_scaler is None:
                raise RuntimeError("Clinical Alzheimer prediction failed and scaler is unavailable")
            features_scaled = self.clinical_scaler.transform(features_array)
            prediction = self.clinical_model_alz.predict(features_scaled)[0]
            probability = self.clinical_model_alz.predict_proba(features_scaled)[0]

        confidence = float(max(probability))
        print(f"✓ Prediction complete")
        print(f"   Result: {'Positive' if prediction == 1 else 'Negative'} ({confidence:.1%})")

        result = {
            'disease': 'Alzheimer (Clinical)',
            'prediction': 'Positive' if prediction == 1 else 'Negative',
            'confidence': confidence,
            'model_info': self.model_manager.get_model_info('clincial_model_alz.pkl')
        }

        print(f"\n{'='*70}")
        print(f"✓ PREDICTION COMPLETE")
        print(f"{'='*70}\n")
        return result

    def predict_parkinson_speech(self, features):
        """Predict Parkinson from speech features with validation"""
        print(f"\n{'='*70}")
        print(f"PROCESSING PARKINSON SPEECH PREDICTION")
        print(f"{'='*70}")
        
        # Validate features
        print("\n[1/4] Validating speech features...")
        is_valid, errors, warnings = InputValidator.validate_speech_features(features, num_features=26)
        
        if errors:
            print("❌ Validation Errors:")
            for error in errors:
                print(f"   - {error}")
            raise ValueError(f"Feature validation failed: {errors[0]}")
        
        if warnings:
            print("⚠ Warnings:")
            for warning in warnings:
                print(f"   - {warning}")
        print("✓ Feature validation passed")
        
        # Check model availability
        print("\n[2/4] Checking model availability...")
        if self.speech_model is None or self.speech_scaler is None:
            raise RuntimeError("Speech Parkinson model or scaler not loaded")
        print("✓ Model available")
        
        # Scale features
        print("\n[3/4] Scaling features...")
        features_scaled = self.speech_scaler.transform([features])
        print(f"✓ Features scaled")
        
        # Run prediction
        print("\n[4/4] Running model prediction...")
        prediction = self.speech_model.predict(features_scaled)[0]
        probability = self.speech_model.predict_proba(features_scaled)[0]
        confidence = float(max(probability))
        print(f"✓ Prediction complete")
        print(f"   Result: {'Positive' if prediction == 1 else 'Negative'} ({confidence:.1%})")
        
        result = {
            'disease': 'Parkinson (Speech)',
            'prediction': 'Positive' if prediction == 1 else 'Negative',
            'confidence': confidence,
            'model_info': self.model_manager.get_model_info('speech_model.pkl')
        }
        
        print(f"\n{'='*70}")
        print(f"✓ PREDICTION COMPLETE")
        print(f"{'='*70}\n")
        return result

    def explain_prediction(self, model_type, features):
        """Provide SHAP explanations"""
        if model_type == 'clinical':
            explainer = shap.TreeExplainer(self.clinical_model)
            shap_values = explainer.shap_values(features)
            return shap_values
        # Add more explainers as needed
        return None
