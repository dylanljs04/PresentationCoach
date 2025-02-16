<script>
    let videoUrl = '';
    let scores = { clarity: '', slide_coherence: '', accuracy: '' };
    let comments = [];
    let videoElement;
  
    // Handle video file upload and get analysis data from Flask
    async function handleUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
  
      const formData = new FormData();
      formData.append('video', file);
  
      const res = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
  
      // Set the video source, scores, and comments from the backend response
      videoUrl = data.video_url;
      scores = data.scores;
      comments = data.comments;
    }
  
    // Jump to the video timestamp and play
    function jumpToTimestamp(timestamp) {
      videoElement.currentTime = timestamp;
      videoElement.play();
    }
  
    // Helper function to format seconds as mm:ss
    function formatTimestamp(seconds) {
      const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
      const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
      return `${mins}:${secs}`;
    }
  </script>
  
  <style>
    .container {
      display: flex;
      gap: 20px;
      margin: 20px;
    }
    .video-section {
      flex: 1;
    }
    .analysis-section {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .score {
      font-size: 1.2em;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .comments {
      flex: 1;
      overflow-y: auto;
    }
    .comment {
      cursor: pointer;
      padding: 10px;
      border: 1px solid #ccc;
      margin-bottom: 10px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .comment:hover {
      background-color: #f0f0f0;
    }
  </style>
  
  <!-- File Upload -->
  <div>
    <input type="file" accept="video/*" on:change="{handleUpload}" />
  </div>
  
  <!-- Only display the container after a video is uploaded -->
  {#if videoUrl}
    <div class="container">
      <!-- Video Section -->
      <div class="video-section">
        <video bind:this={videoElement} width="640" height="360" controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
  
      <!-- Analysis Section -->
      <div class="analysis-section">
        <!-- Overall Scores -->
        <div class="score">
          <div>Clarity: {scores.clarity}/10</div>
          <div>Slide Coherence: {scores.slide_coherence}/10</div>
          <div>Accuracy: {scores.accuracy}/10</div>
        </div>
  
        <!-- Comments List -->
        <div class="comments">
          {#each comments as comment}
            <div class="comment" on:click={() => jumpToTimestamp(comment.timestamp)}>
              ({formatTimestamp(comment.timestamp)}) - {comment.text}
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
  