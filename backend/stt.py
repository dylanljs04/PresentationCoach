from openai import OpenAI
import os
import json
from dotenv import load_dotenv
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_ORG_ID = os.getenv("OPENAI_ORG_ID")
client = OpenAI(
    api_key=OPENAI_API_KEY,  # Add this line
    organization=OPENAI_ORG_ID,
)

def speech_to_text(audio_file):
    print(audio_file)
    try:
        transcription = client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file
        )
    except Exception as e:
        print("ERROR in speech_to_text: ", e)
        return "Error"
    
    print(transcription.text)
    return transcription.text


def speech_to_text_with_timestamps(audio_file):
    """
    Converts speech to text with timestamps using OpenAI Whisper API.
    Parameters:
        audio_file (str): Path to the audio file.
    Returns:
        list: A list of dictionaries containing timestamps and transcriptions.
    """
    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file,
        response_format="verbose_json"  # Enables timestamped output
    )

    segments = transcription.segments  # Extract segmented transcription
    transcript_with_timestamps = []

    for segment in segments:
        transcript_with_timestamps.append({
            "start_time": segment["start"],  # Start time of segment
            "end_time": segment["end"],      # End time of segment
            "text": segment["text"]          # Transcribed text
        })

    return transcript_with_timestamps


def analyze_score(transcription):
    completion = client.chat.completions.create(
    model="gpt-4o",
    temperature=0.1,
    messages=[
        {"role": "assistant", "content": """
            "I've uploaded a presentation script. This is for a high school presentation. Please evaluate it based on these criteria:

            *   Clarity of Speech: How easy is it to understand the language used? Are there jargon or complex sentences that could be simplified?
            *   Conciseness: Is the script to the point?  Are there any unnecessary words or phrases that could be removed?
            *   Accuracy: Does the script contain any factual errors or misleading information?

            In each criterion, provide a score from 0-100, and some comments of your evaluation. Since this is a presentation, give the comments in order of the transcript, as if you were listening in real time.
            In the end, return your answer as a raw string like so
            {
                "clarity": {
                   "score": $SCORE,
                   "comments": [$COMMENTS]
                },
                "conciseness": {
                   "score": $SCORE,
                   "comments": [$COMMENTS]
                },
                "accuracy": {
                   "score": $SCORE,
                   "comments": [$COMMENTS]
                },
            }
         """},
        {
            "role": "user",
            "content": f"{transcription}",
        }
    ])
    score = completion.choices[0].message.content
    print(score)
    json_obj = json.loads(score)
    return json_obj

def analyse_by_timestamp(transcription):
    completion = client.chat.completions.create(
    model="gpt-4o",
    temperature=0.1,
    messages=[
        {"role": "assistant", "content": """
            "I've uploaded a presentation script. This is for a high school presentation. Please evaluate it based on these criteria:

            *   Clarity of Speech: How easy is it to understand the language used? Are there jargon or complex sentences that could be simplified?
            *   Conciseness: Is the script to the point?  Are there any unnecessary words or phrases that could be removed?
            *   Accuracy: Does the script contain any factual errors or misleading information?

            In each criterion, provide a score from 0-100, and some comments of your evaluation. Since this is a presentation, give the comments in order of the transcript, as if you were listening in real time.
            In the end, return your answer as a raw string like so
            {
                "clarity": {
                   "score": $SCORE,
                   "comments": [$COMMENTS]
                },
                "conciseness": {
                   "score": $SCORE,
                   "comments": [$COMMENTS]
                },
                "accuracy": {
                   "score": $SCORE,
                   "comments": [$COMMENTS]
                },
            }
         """},
        {
            "role": "user",
            "content": f"{transcription}",
        }
    ])
    score = completion.choices[0].message.content
    print(score)
    json_obj = json.loads(score)
    return json_obj



def analyze_follow_up_questions(transcription):
    completion = client.chat.completions.create(
    model="gpt-4o",
    temperature=0.1,
    messages=[
        {"role": "assistant", "content": """
            "I've uploaded a presentation script. This is for a high school presentation. Please evaluate it and ask up to 4 follow up questions you may have.
         
            In the end, return your answer as a raw string like so
         
            {
                "questions": [$QUESTIONS]
            }
         """},
        {
            "role": "user",
            "content": f"{transcription}",
        }
    ])
    score = completion.choices[0].message.content
    print(score)
    json_obj = json.loads(score)
    return json_obj

# print(speech_to_text_with_timestamps("Speech.mp3"))
