from sklearn.datasets import load_iris
from sklearn.svm import SVC
import joblib

# Load dataset
data = load_iris()
X, y = data.data, data.target

# Train SVM model
model = SVC()
model.fit(X, y)

# Save model
joblib.dump(model, "model_C.pkl")
