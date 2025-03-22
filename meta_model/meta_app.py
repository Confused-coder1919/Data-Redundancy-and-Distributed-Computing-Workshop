from flask import Flask, request, jsonify
import requests, json

app = Flask(__name__)
endpoints = {
    "model_A": "http://localhost:5001/predict",
    "model_B": "http://localhost:5002/predict",
    "model_C": "http://localhost:5003/predict"
}

# Load balances
def load_balances():
    with open("balances.json", "r") as f:
        return json.load(f)

# Save balances
def save_balances(balances):
    with open("balances.json", "w") as f:
        json.dump(balances, f, indent=2)

@app.route('/predict', methods=['GET'])
def consensus():
    try:
        params = {
            'sl': request.args.get('sl'),
            'sw': request.args.get('sw'),
            'pl': request.args.get('pl'),
            'pw': request.args.get('pw')
        }

        predictions = {}
        balances = load_balances()

        # Step 1: Query all model endpoints
        for model_id, url in endpoints.items():
            try:
                res = requests.get(url, params=params)
                if res.status_code == 200:
                    predictions[model_id] = res.json()['prediction']
            except:
                continue

        if not predictions:
            return jsonify({"error": "No predictions received"}), 500

        # Step 2: Weighted consensus
        weighted_sum = 0
        total_weight = 0
        for model_id, pred in predictions.items():
            weight = balances[model_id]["weight"]
            weighted_sum += pred * weight
            total_weight += weight

        consensus_result = round(weighted_sum / total_weight)

        # Step 3: Adjust balances + weights (slashing)
        for model_id, pred in predictions.items():
            if pred != consensus_result:
                balances[model_id]["balance"] -= 10  # slash balance
                balances[model_id]["weight"] = max(0.1, balances[model_id]["weight"] - 0.1)  # reduce weight
            else:
                balances[model_id]["balance"] += 5   # reward
                balances[model_id]["weight"] = min(1.5, balances[model_id]["weight"] + 0.05)  # increase weight

        save_balances(balances)

        return jsonify({
            "individual_predictions": predictions,
            "consensus_prediction": consensus_result,
            "updated_balances": balances
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=6001)

