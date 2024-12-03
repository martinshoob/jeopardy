const categories = ["Postavy", "Epizody", "Hudba", "Merch", "Test"];
const values = [100, 200, 300, 400, 500];

const loadClickedState = () => {
  const clickedCells = JSON.parse(localStorage.getItem('clickedCells')) || [];
  clickedCells.forEach(id => {
    const cell = document.querySelector(`.cell[data-id="${id}"]`);
    if (cell) {
      cell.classList.add('clicked');
    }
  });
};

const saveClickedState = (id) => {
  const clickedCells = JSON.parse(localStorage.getItem('clickedCells')) || [];
  if (!clickedCells.includes(id)) {
    clickedCells.push(id);
    localStorage.setItem('clickedCells', JSON.stringify(clickedCells));
  }
};

const board = document.getElementById('board');

categories.forEach(category => {
  const categoryCell = document.createElement('div');
  categoryCell.classList.add('cell', 'category');
  categoryCell.innerText = category;
  board.appendChild(categoryCell);
});

for (let i = 0; i < values.length; i++) {
  for (let j = 0; j < categories.length; j++) {
    const questionCell = document.createElement('div');
    questionCell.classList.add('cell');
    questionCell.setAttribute('data-id', `${j}-${i}`);
    questionCell.setAttribute(
      'data-link',
      `question.html?category=${encodeURIComponent(categories[j])}&value=${values[i]}`
    );
    questionCell.innerText = `${values[i]}`;
    board.appendChild(questionCell);
  }
}

const cells = document.querySelectorAll('.cell');
cells.forEach(cell => {
  cell.addEventListener('click', () => {
    if (cell.classList.contains('category') || cell.classList.contains('clicked')) {
      return;
    }

    const id = cell.getAttribute('data-id');
    cell.classList.add('clicked');
    saveClickedState(id);

    const link = cell.getAttribute('data-link');
    if (link) {
      window.location.href = link;
    }
  });
  cell.addEventListener('dblclick', () => {

    if (cell.classList.contains('category')) {
      return;
    }

    const id = cell.getAttribute('data-id');
    cell.classList.remove('clicked');
    const clickedCells = JSON.parse(localStorage.getItem('clickedCells')) || [];
    localStorage.setItem('clickedCells', JSON.stringify(clickedCells.filter(cellId => cellId !== id)));
  }
  )
});

loadClickedState();
