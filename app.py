from flask import Flask, request, jsonify, send_from_directory
import random
from joblib import Parallel, delayed
import multiprocessing
import time

app = Flask(__name__, static_url_path='',
            static_folder='public', template_folder='templates')

sampleStore = dict()
sampleIndex = 0

def loop_until_hit_odds(sampleValues, odds):
    count = 1
    randNum = random.randint(0, odds)
    while randNum != odds:
        count += 1
        randNum = random.randint(0, odds)
    sampleValues.append(count)
    return count


@app.route('/api/generateSample')
def generateSample():
    global sampleIndex
    global sampleStore

    sampleName = f"sample{sampleIndex}"
    sampleIndex += 1
    sampleValues = list()
    size = request.args.get('size', default=1000, type=int)
    odds = request.args.get('odds', default=1365, type=int)

    results = Parallel(n_jobs=multiprocessing.cpu_count())(
        delayed(loop_until_hit_odds)(sampleValues, odds) for i in range(0, size))
    sampleStore[sampleName] = {'data': results, 'odds': odds, 'size': size}
    return jsonify({'sample': sampleName})


@app.route('/api/samples')
def samples():
    samples = [str(f) for f, a in sampleStore.items()]
    return jsonify(samples)


@app.route('/api/samples/<sampleName>')
def samples_data(sampleName):
    if sampleName in sampleStore:
        return jsonify({'samples': sampleStore[sampleName]})

    return jsonify({'samples': None})


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run('0.0.0.0', debug=False)
