from sklearn.datasets import load_iris
from sklearn.neighbors import KNeighborsClassifier
import joblib

# Load dataset
data = load_iris()
X, y = data.data, data.target

# Train KNN model
model = KNeighborsClassifier()
model.fit(X, y)

# Save the model
joblib.dump(model, "model_B.pkl")
