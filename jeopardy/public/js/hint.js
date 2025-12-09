document.addEventListener('click', function (e) {
  if (e.target.id === 'hint-button') {
    button = document.getElementById('hint-button');
    if (button.textContent === 'Nápověda') {
      button.textContent = 'Určitě?';
      button.style.backgroundColor = 'red';
    }
    else if (button.textContent === 'Určitě?') {
      if (document.querySelector('.answer-text') === null) {
        getHints();
      }
      button.style.backgroundColor = '#0078D7';
      button.textContent = 'Nápověda';
    }
    else {
      button.textContent = 'Nápověda';
      button.style.backgroundColor = '#0078D7';
      const hintTextElement = document.querySelector('.hint-text');
      if (hintTextElement) {
        hintTextElement.remove();
      }
    }
  }
});

function getHints() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const value = params.get('value');

  const hintTextElement = document.querySelector('.question-container');

  fetch('./json/hints.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load hints.json');
      }
      return response.json();
    })
    .then(data => {
      if (data && data[category] && data[category][value] && document.querySelector('.hint-text') === null) {
        hintData = data[category][value];

        if (hintData.image) {
          if (document.querySelector('.question-image')) {
            document.querySelector('.question-image').remove();
          }
          const img = document.createElement('img');
          img.src = hintData.image;
          img.alt = `Hint image for ${category} - ${value}`;
          img.classList.add('question-image');
          img.style.maxWidth = '100%'; // Optional: adjust the size as needed
          document.querySelector('.question-container').insertBefore(img, document.querySelector('.main-buttons'));
        }

        if (hintData.audio) {
          if(document.querySelector('.question-audio')) {
            document.querySelector('.question-audio').remove();
          }
          const audio = document.createElement('audio');
          audio.controls = true;
          audio.src = hintData.audio;
          audio.alt = `Hint audio for ${category} - ${value}`;
          document.querySelector('.question-container').insertBefore(audio, document.querySelector('.main-buttons'));
        }

        if (hintData.video) {
          if(document.querySelector('.question-video')) {
              document.querySelector('.question-video').remove();
          }
          const video = document.createElement('video');
          video.controls = true;
          video.src = hintData.video;
          video.alt = `Hint video for ${category} - ${value}`;
          video.style.maxWidth = '100%'; // Optional: adjust the size as needed
          document.querySelector('.question-container').insertBefore(video, document.querySelector('.main-buttons'));
        }

        if (hintData.hint) {
          const hint = document.createElement('p');
          hint.textContent = data[category][value].hint;
          hint.classList.add('hint-text');
          hintTextElement.insertBefore(hint, document.querySelector('.main-buttons'));
        }

      } else {
        console.error('Failed to find hint in hints.json:', category, value);
      }
    })
    .catch(error => {
      console.error('Error fetching or processing hints.json:', error);
      hintTextElement.textContent = 'Failed to load hint';
    });
}
