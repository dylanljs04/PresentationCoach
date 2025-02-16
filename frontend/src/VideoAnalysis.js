import React, { useState, useRef } from 'react';
import './VideoAnalysis.css';

const SERVER_URL = 'http://127.0.0.1:5000';

function convertSecondsToMinutes(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

const VideoAnalysis = () => {
  // Overall report scores start empty.
  const [scores, setScores] = useState({
    clarity: '',
    conciseness: '',
    accuracy: '',
  });
  
  // Comments categorized by type.
  const [comments, setComments] = useState({
    clarity: [],
    conciseness: [],
    accuracy: [],
  });

  // New states for questions and response thread.
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [threadResponses, setThreadResponses] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  
  // New state for loading.
  const [isLoading, setIsLoading] = useState(false);

  // New state for presentation file.
  const [presentationFile, setPresentationFile] = useState(null);

  const [videoUrl, setVideoUrl] = useState('');
  const videoRef = useRef(null);

  const getVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = function () {
        reject("Error loading video file.");
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const sendVideoForAnalysis = async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    const videoLength = await getVideoDuration(file);
  
    try {
      const response = await fetch(SERVER_URL + "/analyze", {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log("received data:", data);
  
      // Update scores from backend response.
      const scores_ = { 
        clarity: data.clarity.score,
        conciseness: data.conciseness.score,
        accuracy: data.accuracy.score,
      };
      setScores(scores_);
  
      // Process and categorize comments.
      const clarityComments = data.clarity.comments.map((comment, index) => ({
          comment,
          timestamp: (index * videoLength) / (data.clarity.comments.length - 1)
      }));
      const concisenessComments = data.conciseness.comments.map((comment, index) => ({
          comment,
          timestamp: (index * videoLength) / (data.conciseness.comments.length - 1)
      }));
      const accuracyComments = data.accuracy.comments.map((comment, index) => ({
          comment,
          timestamp: (index * videoLength) / (data.accuracy.comments.length - 1)
      }));
  
      setComments({
         clarity: clarityComments,
         conciseness: concisenessComments,
         accuracy: accuracyComments,
      });
  
      // Update questions if provided by the backend.
      if (data.questions) {
        // Transform array of strings into objects with 'question' and 'audio_file'.
        const formattedQuestions = data.questions.map(q =>
          typeof q === 'string' ? { question: q, audio_file: null } : q
        );
        setQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error('Error during analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video upload and analysis.
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      sendVideoForAnalysis(file);
    }
  };

  // Handle presentation slides upload.
  const handlePresentationUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPresentationFile(file);
      console.log("Presentation file uploaded:", file);
    }
  };

  // Jump to a specific timestamp when a comment is clicked.
  const handleCommentClick = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play();
    }
  };

  // When a question is clicked, request its TTS audio, then open the thread,
  // play the audio after the user confirms, and start recording only after the audio finishes.
  const handleQuestionClick = async (clickedQuestion, index) => {
    const userConfirmed = window.confirm("Do you want to answer this question?");
    if (!userConfirmed) {
      return;
    }
  
    let updatedQuestion = clickedQuestion;
  
    // If no audio file exists yet, call the /tts endpoint.
    if (!clickedQuestion.audio_file) {
      try {
        const response = await fetch(SERVER_URL + "/tts", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: clickedQuestion.question }),
        });
        const data = await response.json();
        // Assume the backend returns { audio_file: "url" }
        updatedQuestion = { ...clickedQuestion, audio_file: data.audio_file };
  
        // Update the questions state with the new audio file.
        setQuestions(prevQuestions =>
          prevQuestions.map((q, i) => (i === index ? updatedQuestion : q))
        );
      } catch (error) {
        console.error('Error during TTS conversion:', error);
        return;
      }
    }
  
    // Open the thread sidebar for this question.
    setSelectedQuestion(updatedQuestion);
  
    // Play the question audio, and start recording once the audio finishes.
    if (updatedQuestion.audio_file) {
      const questionAudio = new Audio(updatedQuestion.audio_file);
      questionAudio.onended = () => {
        startRecording();
      };
      questionAudio.play();
    } else {
      // Fallback: if there's no audio, start recording immediately.
      startRecording();
    }
  };
  
  // Start recording audio for the answer using MediaRecorder.
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        setThreadResponses(prev => [...prev, audioUrl]);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Close the thread sidebar.
  const closeThread = () => {
    setSelectedQuestion(null);
  };

  return (
    <div className="video-analysis-container">
      {/* Loading screen overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <h2>Loading analysis...</h2>
        </div>
      )}
      
      {/* Thread Sidebar (visible when a question is selected) */}
      {selectedQuestion && (
        <div className="thread-sidebar">
          <h3>Thread for:</h3>
          <p>{selectedQuestion.question}</p>
          <button className="button" onClick={closeThread}>Close Thread</button>
          <hr />
          <h4>Responses</h4>
          {threadResponses.length === 0 && <p>No responses yet.</p>}
          {threadResponses.map((response, index) => (
            <div key={index} className="audio-control">
              <audio controls src={response} />
            </div>
          ))}
          <div>
            {isRecording ? (
              <button className="button" onClick={stopRecording}>Stop Recording</button>
            ) : (
              <button className="button" onClick={startRecording}>Start Recording</button>
            )}
          </div>
        </div>
      )}

      {/* Main Content: Video, Upload, and Questions */}
      <div className="main-content">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="video-player"
        />
        <div className="upload-section">
          <div>
            <label>Upload Video:</label>
            <input type="file" accept="video/*" onChange={handleFileUpload} />
          </div>
          <div>
            <label>Upload Presentation:</label>
            <input type="file" accept=".pdf,.ppt,.pptx" onChange={handlePresentationUpload} />
          </div>
        </div>
        {presentationFile && (
          <p>Presentation: {presentationFile.name}</p>
        )}

        {/* Questions Section */}
        <div className="questions-section">
          <h3>Questions</h3>
          {questions.length === 0 && <p>No questions available.</p>}
          {questions.map((q, index) => (
            <div
              key={index}
              onClick={() => handleQuestionClick(q, index)}
              className="question-card"
            >
              <p>
                <strong>Q:</strong> {q.question}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Overall Report and Categorized Comments */}
      <div className="report-comments">
        <div className="report-section">
          <h2>Overall Report</h2>
          <p><strong>Clarity:</strong> {scores.clarity || '-'}</p>
          <p><strong>Conciseness:</strong> {scores.conciseness || '-'}</p>
          <p><strong>Accuracy:</strong> {scores.accuracy || '-'}</p>
        </div>
        <div className="comments-section">
          <h3>Comments</h3>
          {['clarity', 'conciseness', 'accuracy'].map((category) => (
            <div key={category}>
              <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
              {comments[category] && comments[category].length > 0 ? (
                comments[category].map((comment, index) => (
                  <div
                    key={index}
                    onClick={() => handleCommentClick(comment.timestamp)}
                    className="comment-card"
                  >
                    <p>{comment.comment}</p>
                  </div>
                ))
              ) : (
                <p>No comments for {category}.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysis;
