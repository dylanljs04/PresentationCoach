import requests

ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech/"
ELEVEN_LABS_API_KEY = "sk_3c75f11e5b2c0629d65a933ded6177af3b4eaf2877f184d4"
# Function to convert text to speech
def text_to_speech(text, voice_id="21m00Tcm4TlvDq8ikWAM", output_file="questions.mp3"):
    """
    Converts text to speech using the Eleven Labs API and saves it as an MP3 file.
    """
    ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech/"
    ELEVEN_LABS_API_KEY = "sk_3c75f11e5b2c0629d65a933ded6177af3b4eaf2877f184d4"
    headers = {
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY
    }
    
    payload = {
        "text": text,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.8}
    }
    
    response = requests.post(f"{ELEVEN_LABS_API_URL}{voice_id}", json=payload, headers=headers)
    
    if response.status_code == 200:
        with open(output_file, "wb") as file:
            file.write(response.content)
        print(f"Audio saved as {output_file}")
        return output_file
    else:
        print("Error:", response.status_code, response.json())
        return None
