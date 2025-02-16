# app.py
import subprocess
import tempfile
import os
from flask import Flask, request, jsonify, url_for, send_from_directory

from flask_cors import CORS
import time
from stt import speech_to_text, analyze_score, analyze_follow_up_questions
from elevenlabs import text_to_speech

# Make sure this directory exists (or use app.static_folder)
AUDIO_FOLDER = os.path.join(os.getcwd(), "static")
if not os.path.exists(AUDIO_FOLDER):
    os.makedirs(AUDIO_FOLDER)
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/analyze', methods=['POST'])
def analyze_video():
    print("Received video")
    video_file = request.files.get('video')
    if not video_file:
        return jsonify({"error": "No video provided"}), 400

      # Save the uploaded video to a temporary file
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_video:
        video_file.save(temp_video)
        temp_video_path = temp_video.name

    # Create a temporary file for the MP3 audio
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_audio:
        temp_audio_path = temp_audio.name

    # Run FFmpeg to extract audio from the video
    command = [
        "ffmpeg",
        "-y",
        "-i", temp_video_path,
        "-vn",
        "-acodec", "libmp3lame",
        "-q:a", "2",
        temp_audio_path
    ]
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        # Clean up the temporary video file before returning
        os.remove(temp_video_path)
        return jsonify({"error": "Failed to convert video to MP3", "details": str(e)}), 500
    print(1)
    # Open the generated MP3 file in binary mode and call speech_to_text
    print(temp_audio_path)
    try:
        with open(temp_audio_path, "rb") as audio_file:
            print(2)
            transcription = speech_to_text(audio_file)
            print(3)
    except Exception as e:
        return jsonify({"error": "Failed to transcribe audio", "details": str(e)}), 500
    finally:
        # Optionally clean up both temporary files
        os.remove(temp_video_path)
        os.remove(temp_audio_path)
    print(1)
    
    scores = analyze_score(transcription)
    questions = analyze_follow_up_questions(transcription)
    with open('output.txt', 'w') as file:
        file.write(f"Scores: {scores}\n, Questions: {questions}\n, Transcription: {transcription}")
    print(2)
        
    
    # Dummy analysis results
    analysis_results = scores.copy()
    analysis_results.update(questions)
    print(analysis_results)
    return jsonify(analysis_results)


@app.route('/tts', methods=['POST'])
def convert_tts():

    print("Received TTS request")
    
    # Expect a JSON payload with a "question" field.
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({'error': 'No question provided'}), 400
    
    question = data['question']
    
    # Set a unique filename or use a constant if only one file is needed.
    timestamp = int(time.time() * 1000)
    output_filename = f"question_{timestamp}.mp3"
    output_path = os.path.join(AUDIO_FOLDER, output_filename)
    
    result = text_to_speech(question, output_file=output_path)
    if result:
        # Create a URL for the saved audio file.
        audio_url = url_for('download_file', filename=output_filename, _external=True)
        return jsonify({'audio_file': audio_url})
    else:
        return jsonify({'error': 'TTS conversion failed'}), 500


@app.route('/download/<filename>')
def download_file(filename):
    # This route serves files from the AUDIO_FOLDER
    return send_from_directory(AUDIO_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)
