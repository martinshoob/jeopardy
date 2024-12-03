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
        const hint = document.createElement('p');
        hint.textContent = data[category][value].hint;
        hint.classList.add('hint-text');
        hintTextElement.insertBefore(hint, document.querySelector('.main-buttons'));
      } else {
        console.error('Failed to find hint in hints.json:', category, value);
      }
    })
    .catch(error => {
      console.error('Error fetching or processing hints.json:', error);
      hintTextElement.textContent = 'Failed to load hint';
    });
}
