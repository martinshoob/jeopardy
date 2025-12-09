// Connect to the Points Server
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log("Connected to Remote Control Server");
});

// Listen for navigation commands from Admin
socket.on('board_navigate', (data) => {
  console.log("Received command:", data);

  if (data.type === 'back') {
    window.location.href = 'index.html';
  }
  else if (data.type === 'open') {
    // 1. Uložit "clicked" stav (aby otázka zešedla)
    if (data.id) {
      const clickedCells = JSON.parse(localStorage.getItem('clickedCells')) || [];
      if (!clickedCells.includes(data.id)) {
        clickedCells.push(data.id);
        localStorage.setItem('clickedCells', JSON.stringify(clickedCells));
      }
    }

    // 2. Otevřít otázku
    const url = `question.html?category=${encodeURIComponent(data.category)}&value=${data.value}`;
    window.location.href = url;
  }
});

// Helper to send data back to admin
function reportToAdmin(data) {
  socket.emit('board_state_update', data);
}
