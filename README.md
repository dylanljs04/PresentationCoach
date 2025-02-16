# Presentation Coach

## Overview
Presentation Coach is an AI-powered tool designed to help users improve their presentation skills. Users upload their **PDF slide deck**, record their **presentation video**, and receive **AI-driven feedback** based on key criteria: **clarity, conciseness, and slide coherence**. The AI also simulates a **live audience** by generating follow-up questions about the slides, allowing users to practice answering spontaneously.

## Features
- ✅ **PDF Slide Upload** – Users can upload their slide deck (PDF format).
- ✅ **Speech-to-Text Processing** – Converts spoken words from video into text using **OpenAI Whisper**.
- ✅ **Presentation Evaluation** – AI provides feedback on **clarity, conciseness, and slide coherence**.
- ✅ **Live Audience Simulation** – AI generates questions related to the slides.
- ✅ **Follow-up Response Evaluation** – Users record answers to AI-generated questions, and AI provides feedback.
- ✅ **Text-to-Speech Support** – Uses **ElevenLabs API** to generate speech output for follow-up questions.

## Tech Stack
- **Frontend:** React (with Tailwind CSS)
- **Backend:** Flask (Python)
- **AI APIs:**
  - **Speech-to-Text:** OpenAI Whisper
  - **Text-to-Speech:** ElevenLabs API
- **File Processing:** PyMuPDF (for PDF extraction)
- **Video Processing:** FFmpeg (for extracting audio from video)

## Installation & Setup
### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/presentation-coach.git
cd presentation-coach
```

### **2. Backend Setup (Flask)**
#### **Create a Virtual Environment**
```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate    # Windows
```
#### **Install Dependencies**
```bash
pip install -r requirements.txt
```
#### **Set Up Environment Variables**
Create a `.env` file in the backend folder:
```
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```
#### **Run the Backend Server**
```bash
python app.py
```

### **3. Frontend Setup (React)**
```bash
cd frontend
npm install
npm start
```
The React app should now be running at `http://localhost:3000/`.

## Usage
- **Upload PDF slides** – The AI processes the slides.
- **Record your presentation** – The AI extracts audio and transcribes speech.
- **Receive AI feedback** – Based on clarity, conciseness, and slide coherence.
- **Live Audience Simulation** – AI generates follow-up questions.
- **Record answers to questions** – AI evaluates your response and provides feedback.

## Future Enhancements
- 🔹 **Gesture & Body Language Analysis** using Computer Vision.
- 🔹 **Real-time Presentation Feedback** with AI suggestions as you speak.
- 🔹 **Integration with Google Slides** for direct slide imports.

## Contributors
- **Your Name** (@your-username)
- **Other Team Members**

## License
This project is licensed under the **MIT License**.

