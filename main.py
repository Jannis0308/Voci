### main.py
import os
from flask import Flask, request, jsonify, send_from_directory

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Sicherstellen, dass der Ordner existiert

app = Flask(__name__, static_url_path='', static_folder='.')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

@app.route('/upload', methods=['POST'])
def upload_file():
    # Überprüfen, ob eine Datei hochgeladen wurde
    if 'file' not in request.files:
        print("Keine Datei im Request gefunden.")
        return 'Keine Datei hochgeladen', 400

    file = request.files['file']
    if not file.filename.endswith('.voci'):
        print("Ungültiges Dateiformat.")
        return 'Ungültiges Dateiformat. Bitte lade eine .voci-Datei hoch.', 400

    try:
        # Speichere die Datei im Upload-Ordner
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        print(f"Datei erfolgreich gespeichert: {file_path}")

        # Dateiinhalt verarbeiten
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.read().strip().splitlines()

        vocab = []
        for line in lines:
            parts = line.split('\t')  # Tabulator-getrennte Werte
            if len(parts) == 2:
                vocab.append({'question': parts[0].strip(), 'answer': parts[1].strip()})
            else:
                print(f"Überspringe fehlerhafte Zeile: {line}")

        if not vocab:
            print("Keine gültigen Vokabeln gefunden.")
            return 'Die Datei wurde gespeichert, aber keine gültigen Vokabeln gefunden.', 400

        # Erfolgreiche Antwort
        return jsonify({'message': 'Datei erfolgreich hochgeladen und gespeichert.', 'vocab': vocab})

    except Exception as e:
        print(f"Fehler beim Verarbeiten der Datei: {e}")
        return 'Fehler beim Hochladen und Verarbeiten der Datei', 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)