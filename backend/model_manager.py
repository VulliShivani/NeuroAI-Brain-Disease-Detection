import os
import joblib
from tensorflow.keras.models import load_model
import json

class ModelManager:
    """Manage and validate model files and their configurations"""

    MODEL_CONFIGS = {
        'alzheimer_model.h5': {
            'type': 'cnn',
            'input_shape': (224, 224, 3),
            'output_classes': 4,
            'classes': ['MildDemented', 'ModerateDemented', 'NonDemented', 'VeryMildDemented'],
            'required': True,
            'description': 'CNN model for Alzheimer detection from MRI images'
        },
        'brain_tumor_model.h5': {
            'type': 'cnn',
            'input_shape': (128, 128, 3),
            'output_classes': 4,
            # Must match the trained model output index order exactly.
            'classes': ['meningioma', 'notumor', 'glioma', 'pituitary'],
            'required': True,
            'description': 'CNN model for Brain Tumor classification from MRI images'
        },
        'clinical_model.pkl': {
            'type': 'sklearn',
            'input_features': 16,
            'output_classes': 2,
            'disease': 'Parkinson (Clinical)',
            'required': True,
            'description': 'Random Forest model for Parkinson detection from clinical features'
        },
        'clinical_scaler.pkl': {
            'type': 'scaler',
            'associated_model': 'clinical_model.pkl',
            'required': True,
            'description': 'StandardScaler for clinical model features'
        },
        'clincial_model_alz.pkl': {
            'type': 'sklearn',
            'input_features': 16,
            'output_classes': 2,
            'disease': 'Alzheimer (Clinical)',
            'required': False,
            'description': 'Clinical model for Alzheimer detection'
        },
        'speech_model.pkl': {
            'type': 'sklearn',
            'input_features': 26,
            'output_classes': 2,
            'disease': 'Parkinson (Speech)',
            'required': True,
            'description': 'Random Forest model for Parkinson detection from speech features'
        },
        'speech_scaler.pkl': {
            'type': 'scaler',
            'associated_model': 'speech_model.pkl',
            'required': True,
            'description': 'StandardScaler for speech model features'
        }
    }

    def __init__(self, models_dir):
        self.models_dir = models_dir
        self.loaded_models = {}
        self.validation_report = {}

    def validate_models(self):
        """Validate all required model files exist and are loadable"""
        print("\n" + "="*60)
        print("VALIDATING MODEL FILES")
        print("="*60)
        
        report = {
            'total_models': len(self.MODEL_CONFIGS),
            'found': 0,
            'missing': [],
            'errors': [],
            'valid': []
        }
        
        for model_name, config in self.MODEL_CONFIGS.items():
            model_path = os.path.join(self.models_dir, model_name)
            
            # Check if file exists
            if not os.path.exists(model_path):
                status = "MISSING (Optional)" if not config['required'] else "MISSING (REQUIRED)"
                print(f"❌ {model_name}: {status}")
                if config['required']:
                    report['missing'].append(model_name)
                continue
            
            file_size = os.path.getsize(model_path)
            print(f"✓ {model_name} ({file_size / 1024 / 1024:.2f} MB)")
            report['found'] += 1
            
            # Try to load model
            try:
                if config['type'] == 'cnn':
                    model = load_model(model_path)
                    print(f"  → Input shape: {model.input_shape}")
                    print(f"  → Output shape: {model.output_shape}")
                    print(f"  → Classes: {', '.join(config['classes'])}")
                    self.loaded_models[model_name] = model
                elif config['type'] in ['sklearn', 'scaler']:
                    model = joblib.load(model_path)
                    if config['type'] == 'sklearn':
                        print(f"  → Model type: {type(model).__name__}")
                        print(f"  → Expected features: {config['input_features']}")
                        print(f"  → Classes: {config['output_classes']}")
                    self.loaded_models[model_name] = model
                
                report['valid'].append(model_name)
            except Exception as e:
                print(f"  ⚠ ERROR loading: {str(e)}")
                report['errors'].append({
                    'model': model_name,
                    'error': str(e)
                })
        
        missing_required = [m for m in report['missing'] if self.MODEL_CONFIGS[m]['required']]
        
        print("\n" + "-"*60)
        print(f"Summary: {report['found']}/{report['total_models']} models found")
        print(f"Valid: {len(report['valid'])} | Errors: {len(report['errors'])}")
        
        if missing_required:
            print(f"⚠ CRITICAL: {len(missing_required)} required models missing!")
            print(f"Missing: {', '.join(missing_required)}")
        
        if report['errors']:
            print(f"⚠ {len(report['errors'])} models have loading errors")
        
        print("="*60 + "\n")
        
        self.validation_report = report
        return len(report['errors']) == 0 and len(missing_required) == 0

    def get_model_info(self, model_name):
        """Get model configuration info"""
        return self.MODEL_CONFIGS.get(model_name)

    def get_model(self, model_name):
        """Get loaded model or load it"""
        if model_name in self.loaded_models:
            return self.loaded_models[model_name]
        
        model_path = os.path.join(self.models_dir, model_name)
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_name}")
        
        try:
            config = self.MODEL_CONFIGS[model_name]
            if config['type'] == 'cnn':
                model = load_model(model_path)
            elif config['type'] in ['sklearn', 'scaler']:
                model = joblib.load(model_path)
            
            self.loaded_models[model_name] = model
            return model
        except Exception as e:
            raise RuntimeError(f"Failed to load model {model_name}: {str(e)}")

    def get_validation_report(self):
        """Get detailed validation report"""
        return self.validation_report

    def validate_input_shape(self, disease_type, input_data):
        """Validate input data matches model requirements"""
        if disease_type == 'alzheimer':
            config = self.MODEL_CONFIGS['alzheimer_model.h5']
            if hasattr(input_data, 'shape'):
                expected = (1, *config['input_shape'])
                if input_data.shape != expected:
                    return False, f"Expected shape {expected}, got {input_data.shape}"
        elif disease_type == 'tumor':
            config = self.MODEL_CONFIGS['brain_tumor_model.h5']
            if hasattr(input_data, 'shape'):
                expected = (1, *config['input_shape'])
                if input_data.shape != expected:
                    return False, f"Expected shape {expected}, got {input_data.shape}"
        
        return True, "Shape validation passed"
