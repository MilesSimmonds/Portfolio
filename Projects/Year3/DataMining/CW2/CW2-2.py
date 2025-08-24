#import libaries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix, ConfusionMatrixDisplay, f1_score
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import RandomizedSearchCV


# Load and clean dataset
DATA_PATH = Path(__file__).resolve().parent / "HealthcareDataset.csv"
df = pd.read_csv(DATA_PATH)
df.dropna(inplace=True)
df.drop(columns=['Patient_ID'], errors='ignore', inplace=True)


# Convert satisfaction into binary
df['Satisfaction_Level'] = pd.cut(df['Patient_Satisfaction'], bins=[0, 2, 5], labels=['Unsatisfied', 'Satisfied'])
print(df['Satisfaction_Level'].value_counts())
df.drop(columns=['Patient_Satisfaction'], inplace=True)

# --- Exploratory Data Analysis (EDA) ---
print("\n Dataset Shape:", df.shape)

# 3. Show number of satisfied vs unsatisfied patients
plt.figure(figsize=(6, 4))
sns.countplot(x='Satisfaction_Level', data=df)
plt.title('Distribution of Patient Satisfaction')
plt.ylabel('Count')
plt.tight_layout()
plt.show()

# 3. Correlation matrix 
plt.figure(figsize=(10, 8))
sns.heatmap(df.select_dtypes(include=[np.number]).corr(), annot=True, cmap='coolwarm', fmt=".2f")
plt.title('Correlation Matrix')
plt.tight_layout()
plt.show()

# Define models
models = {
    'Random Forest': RandomForestClassifier(class_weight='balanced', random_state=42),
    'SVM': SVC(class_weight='balanced', probability=True),
    'Logistic Regression': LogisticRegression(max_iter=1000, class_weight='balanced'),
    'Gradient Boosting': GradientBoostingClassifier()
}

# Prepare data for model evaluation

# Load and clean dataset
DATA_PATH = Path(__file__).resolve().parent / "HealthcareDataset.csv"
df = pd.read_csv(DATA_PATH)
df.dropna(inplace=True)
df.drop(columns=['Patient_ID'], errors='ignore', inplace=True)

# Convert satisfaction into binary
df['Satisfaction_Level'] = pd.cut(df['Patient_Satisfaction'], bins=[0, 3, 5], labels=['Unsatisfied', 'Satisfied'])
print(df['Satisfaction_Level'].value_counts())
df.drop(columns=['Patient_Satisfaction'], inplace=True)

# Encoding and Splitting
categorical_cols = df.select_dtypes(include='object').columns.drop('Satisfaction_Level', errors='ignore')
df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
df_encoded['Satisfaction_Level'] = df_encoded['Satisfaction_Level'].astype('category').cat.codes

X = df_encoded.drop('Satisfaction_Level', axis=1)
y = df_encoded['Satisfaction_Level']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Apply SMOTE
sm = SMOTE(random_state=42)
X_train_res, y_train_res = sm.fit_resample(X_train_scaled, y_train)

# Model Evaluation using Accuracy
models = {
    'Random Forest': RandomForestClassifier(class_weight='balanced', random_state=42),
    'SVM': SVC(class_weight='balanced', probability=True),
    'Logistic Regression': LogisticRegression(max_iter=1000, class_weight='balanced'),
    'Gradient Boosting': GradientBoostingClassifier()
}

model_scores = {}
for name, model in models.items():
    model.fit(X_train_res, y_train_res)
    y_pred = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    
    print(f"\n--- {name} ---")
    print(classification_report(y_test, y_pred, target_names=['Unsatisfied', 'Satisfied']))
    print(f"Accuracy: {acc:.2f}")
    
    model_scores[name] = {'model': model, 'accuracy': acc}

# Plot accuracy comparison
plt.figure(figsize=(8, 5))
sns.barplot(x=list(model_scores.keys()), y=[v['accuracy'] for v in model_scores.values()])
plt.ylim(0, 1)
plt.title('Model Accuracy Comparison')
plt.ylabel('Accuracy')
plt.xlabel('Model')
for i, v in enumerate(model_scores.values()):
    plt.text(i, v['accuracy'] + 0.01, f"{v['accuracy']:.2f}", ha='center', fontweight='bold')
plt.tight_layout()
plt.show()

# Select best model based on accuracy
best_model_name = max(model_scores, key=lambda name: model_scores[name]['accuracy'])
best_model = model_scores[best_model_name]['model']
print(f"\n Best model based on Accuracy: {best_model_name} (Accuracy: {model_scores[best_model_name]['accuracy']:.2f})")

# Confusion Matrix Before Tuning 
if best_model_name == 'Random Forest':
    # Predict with the initially chosen Random Forest model
    y_pred_before = best_model.predict(X_test_scaled)
    cm_before = confusion_matrix(y_test, y_pred_before)
    disp_before = ConfusionMatrixDisplay(confusion_matrix=cm_before, display_labels=['Unsatisfied', 'Satisfied'])
    disp_before.plot(cmap=plt.cm.Oranges)
    plt.title(f'Confusion Matrix - Before Tuning ({best_model_name})')
    plt.tight_layout()
    plt.show()

     # Hyperparameter Tuning for Random Forest
    param_distributions = {
    'n_estimators': [100, 150, 200, 250, 300, 350, 400],
    'max_depth': [10, 20, 30, 40, 50, None],
    'min_samples_split': [2, 4, 6, 8, 10],
    'min_samples_leaf': [1, 2, 3, 4],
    'max_features': ['sqrt', 'log2', None]
}

    random_search = RandomizedSearchCV(
        estimator=RandomForestClassifier(class_weight='balanced', random_state=42),
        param_distributions=param_distributions,
        n_iter=240,                   # ~20 minutes total (based on 5-fold CV)
        scoring='accuracy',
        cv=5,
        n_jobs=-1,
        verbose=2,
        random_state=42
    )

    random_search.fit(X_train_res, y_train_res)

    print("\nBest Random Forest Parameters:")
    print(random_search.best_params_)

    best_model = random_search.best_estimator_
        
  
    # Confusion Matrix After Tuning
    y_pred_after = best_model.predict(X_test_scaled)
    cm_after = confusion_matrix(y_test, y_pred_after)
    disp_after = ConfusionMatrixDisplay(confusion_matrix=cm_after, display_labels=['Unsatisfied', 'Satisfied'])
    disp_after.plot(cmap=plt.cm.Greens)
    plt.title(f'Confusion Matrix - After Tuning ({best_model_name})')
    plt.tight_layout()
    plt.show()


# Final Evaluation of the Selected Best Model
y_pred_best = best_model.predict(X_test_scaled)
print(f"\n--- Final Evaluation: {best_model_name} ---")
print(classification_report(y_test, y_pred_best, target_names=['Unsatisfied', 'Satisfied']))
print("Accuracy:", accuracy_score(y_test, y_pred_best))

cm = confusion_matrix(y_test, y_pred_best)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=['Unsatisfied', 'Satisfied'])
disp.plot(cmap=plt.cm.Blues)
plt.title(f'Confusion Matrix - Final Best Model ({best_model_name})')
plt.tight_layout()
plt.show()


# Dummy Patient Prediction and Visualisation
dummy_data = pd.DataFrame({
    'Treatment_Duration': [1, 30],
    'Insurance_Type': ['Private', 'Uninsured'],
    'Doctor_Name': ['Dr. Adams', 'Dr. Graves'],
    'Hospital_Name': ['General Hospital', 'Underserved Clinic'],
    'Lab_Test_Results': [98, 30],
    'X-ray_Results': ['Normal', 'Abnormal'],
    'Surgery_Type': ['None', 'Emergency Surgery'],
    'Recovery_Time': [0, 25],
    'Allergies': ['None', 'Shellfish'],
    'Family_History': ['None', 'Heart Disease'],
    'AI_Diagnosis_Confidence': [0.99, 0.10],
    'Gender': ['Female', 'Male'],
    'Diagnosis': ['Check-up', 'Cancer'],
    'Medication': ['Vitamin D', 'Chemotherapy']
})

# One-hot encode dummy data using the same schema as training
dummy_encoded = pd.get_dummies(dummy_data, columns=categorical_cols.tolist(), drop_first=True)
dummy_encoded = dummy_encoded.reindex(columns=X.columns, fill_value=0)
X_dummy_scaled = scaler.transform(dummy_encoded)

# Predict for dummy data
dummy_predictions = best_model.predict(X_dummy_scaled)
predicted_labels = pd.Series(dummy_predictions).map({0: 'Unsatisfied', 1: 'Satisfied'})
probabilities = best_model.predict_proba(X_dummy_scaled)[:, 1]

# Visualise dummy predictions as a bar chart
label_colors = {'Unsatisfied': 'tomato', 'Satisfied': 'mediumseagreen'}
colors = [label_colors[label] for label in predicted_labels]
# Create a bar chart for dummy data
plt.figure(figsize=(8, 4))
bars = plt.bar(dummy_data['Doctor_Name'], [1] * len(predicted_labels), color=colors)
plt.ylim(0, 1.2)
plt.title('Dummy Patient Satisfaction Prediction')
plt.ylabel('Predicted Satisfaction')
plt.xticks(rotation=15)

#display predicted labels above the bars
for bar, label in zip(bars, predicted_labels):
    plt.text(bar.get_x() + bar.get_width() / 2, 1.05, label, ha='center', va='bottom', fontsize=10, fontweight='bold')
    
plt.tight_layout()
plt.show()
#display predicted labels and probabilities
print("Predicted labels:", list(predicted_labels))
print("Satisfaction probabilities:", probabilities)
