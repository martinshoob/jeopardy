document.addEventListener('click', function (e) {
  if (e.target.id === 'answer-button') {
    button = document.getElementById('answer-button');
    if (button.textContent === 'Odpověď') {
      button.textContent = 'Určitě?';
      button.style.backgroundColor = 'red';
    }
    else if (button.textContent === 'Určitě?') {
      if (document.querySelector('.hint-text') !== null) {
        document.querySelector('.hint-text').remove();
      }
      getAnswers();
      button.style.backgroundColor = '#0078D7';
      button.textContent = 'Odpověď';
    }
    else {
      button.textContent = 'Odpověď';
      button.style.backgroundColor = '#0078D7';
      const answerTextElement = document.querySelector('.answer-text');
      if (answerTextElement) {
        answerTextElement.remove();
      }
    }
  }
});

function getAnswers() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const value = params.get('value');

  const answerTextElement = document.querySelector('.question-container');

  fetch('./json/answers.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load answers.json');
      }
      return response.json();
    })
    .then(data => {
      if (data && data[category] && data[category][value] && document.querySelector('.answer-text') === null) {
        answerData = data[category][value];

        if (answerData.image) {
          if (document.querySelector('.question-image')) {
            document.querySelector('.question-image').remove();
          }
          const img = document.createElement('img');
          img.src = answerData.image;
          img.alt = `Answer image for ${category} - ${value}`;
          img.classList.add('question-image');
          img.style.maxWidth = '100%'; // Optional: adjust the size as needed
          document.querySelector('.question-container').insertBefore(img, document.querySelector('.main-buttons'));
        }

        if (answerData.answer) {
          const answer = document.createElement('p');
          answer.textContent = data[category][value].answer;
          answer.classList.add('answer-text');
          answerTextElement.insertBefore(answer, document.querySelector('.main-buttons'));
        }

      } else {
        console.error('Failed to find answer in answers.json:', category, value);
      }
    })
    .catch(error => {
      console.error('Error fetching or processing answers.json:', error);
      answerTextElement.textContent = 'Failed to load answer';
    });
}
