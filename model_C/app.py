from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load("model_C.pkl")

@app.route('/predict', methods=['GET'])
def predict():
    try:
        sl = float(request.args.get('sl'))
        sw = float(request.args.get('sw'))
        pl = float(request.args.get('pl'))
        pw = float(request.args.get('pw'))
        prediction = model.predict([[sl, sw, pl, pw]])[0]
        return jsonify({"model": "C", "prediction": int(prediction)})
    except:
        return jsonify({"error": "Invalid parameters"}), 400

if __name__ == '__main__':
    app.run(port=5003)
