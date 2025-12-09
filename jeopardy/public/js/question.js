document.addEventListener('DOMContentLoaded', function () {
  main();
});

document.addEventListener('click', function (e) {
  if (e.target.id === 'back-button') {
    goBack();
  }
});

function main() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const value = params.get('value');

  // Question title
  document.getElementById('question-title').innerText = `${category} - ${value}`;

  fetch('./json/questions.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load questions.json');
      }
      return response.json();
    })
    .then(data => {
      const questionData = data[category]?.[value];
      // console.log(data);
      if (questionData) {
        document.getElementById('question-text').innerText = questionData.question;

        if (questionData.image) {
          const img = document.createElement('img');
          img.src = questionData.image;
          img.alt = `Image for ${category} - ${value}`;
          img.classList.add('question-image');
          img.style.maxWidth = '100%'; // Optional: adjust the size as needed
          document.querySelector('.question-container').appendChild(img);
        }

        if (questionData.audio) {
          const audio = document.createElement('audio');
          audio.controls = true;
          audio.src = questionData.audio;
          audio.alt = `Audio for ${category} - ${value}`;
          document.querySelector('.question-container').appendChild(audio);
        }

        if (questionData.video) {
          const video = document.createElement('video');
          video.controls = true;
          video.src = questionData.video;
          video.alt = `Video for ${category} - ${value}`;
          video.style.maxWidth = '100%'; // Optional: adjust the size as needed
          document.querySelector('.question-container').appendChild(video);
        }
      } else {
        document.getElementById('question-text').innerText = "Question not found.";
      }

      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('main-buttons');  // Apply the class to the container

      const button = document.createElement('button');
      button.innerText = 'Zpět';
      button.id = 'back-button';
      buttonContainer.appendChild(button);

      const button2 = document.createElement('button');
      button2.innerText = 'Odpověď';
      button2.id = 'answer-button';
      buttonContainer.appendChild(button2);

      const button3 = document.createElement('button');
      button3.innerText = 'Nápověda';
      button3.id = 'hint-button';
      buttonContainer.appendChild(button3);

      document.querySelector('.question-container').appendChild(buttonContainer);

    })
    .catch(error => {
      console.error(error);
      document.getElementById('question-text').innerText =
        "There was an error loading the question. Please try again later.";
    });

  fetch('./json/answers.json')
    .then(response => response.json())
    .then(data => {
      const answerData = data[category]?.[value];
      const answerText = answerData ? answerData.answer : "Answer not found";

      // Send to Admin via the remote.js helper
      if (typeof reportToAdmin === 'function') {
        reportToAdmin({
          state: 'question_open',
          category: category,
          value: value,
          answer: answerText
        });
      }
    });

  // Fetch players from the scoreboard
  fetch("http://localhost:3000/players")
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load players data');
      }
      return response.json();
    })
    .then(data => {
      const players = data.players;
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'player-buttons-container';
      document.querySelector('.question-container').appendChild(buttonsContainer);
      // Create buttons
      players.forEach((player, index) => {
        const button = document.createElement('button');
        button.innerText = player.name;
        button.className = 'player-button';
        button.onclick = function () {
          const pointsToAdd = parseInt(value);
          updatePlayerPoints(index, pointsToAdd);
          button.style.backgroundColor = 'green';
        };
        buttonsContainer.appendChild(button);
      });
    })
    .catch(error => {
      console.error('Error loading players:', error);
    });
}

function goBack() {
  window.history.back();
}

// Update
function updatePlayerPoints(playerIndex, points) {
  const data = {
    index: playerIndex,
    points: points
  };

  // Log for debugging
  console.log('Sending data:', data);

  fetch("http://localhost:3000/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      console.log(result.message);
    })
    .catch(error => {
      console.error('Error updating player points:', error);
    });
}

