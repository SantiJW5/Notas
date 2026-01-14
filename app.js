// app.js (COMPLETO)

// ====== Elementos UI ======
const board = document.getElementById('board');
const addCard = document.getElementById('addCard');

const modal = document.getElementById('modal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const titleInput = document.getElementById('titleInput');
const imageInput = document.getElementById('imageInput');

const editor = document.getElementById('editor');
const backBtn = document.getElementById('backBtn');
const textArea = document.getElementById('textArea');
const colorPicker = document.getElementById('colorPicker');

// Menú contextual (click derecho)
const ctxMenu = document.getElementById('ctxMenu');
const deleteCardBtn = document.getElementById('deleteCardBtn');

// ====== Estado ======
let cards = JSON.parse(localStorage.getItem('cards')) || [];
let currentId = null;
let ctxTargetId = null;

// ====== Helpers ======
function closeModal() {
  modal.classList.add('hidden');
  titleInput.value = '';
  imageInput.value = '';
}

function saveToStorage() {
  localStorage.setItem('cards', JSON.stringify(cards));
}

function closeContextMenu() {
  if (!ctxMenu) return;
  ctxMenu.classList.add('hidden');
  ctxTargetId = null;
}

// ====== Modal ======
addCard.onclick = () => {
  closeContextMenu();
  modal.classList.remove('hidden');
};

cancelBtn.onclick = () => closeModal();

saveBtn.onclick = () => {
  const title = titleInput.value.trim();
  const file = imageInput.files[0];

  if (!title || !file) return;

  const reader = new FileReader();
  reader.onload = () => {
    cards.push({
      id: Date.now(),
      title,
      image: reader.result, // base64
      text: '',
      color: '#ffffff',
    });

    saveToStorage();
    renderCards();
    closeModal();
  };

  reader.readAsDataURL(file);
};

// ====== Render ======
function renderCards() {
  board.innerHTML = '';

  cards.forEach(card => {
    const div = document.createElement('div');
    div.className = 'card image-card';
    div.style.backgroundImage = `url(${card.image})`;

    // click normal -> editor
    div.onclick = () => {
      closeContextMenu();
      openEditor(card.id);
    };

    // click derecho -> menú contextual
    div.oncontextmenu = (e) => openContextMenu(e, card.id);

    board.appendChild(div);
  });

  // el "+" siempre al final
  board.appendChild(addCard);
}

// ====== Editor ======
function openEditor(id) {
  currentId = id;
  const card = cards.find(c => c.id === id);
  if (!card) return;

  textArea.value = card.text || '';
  colorPicker.value = card.color || '#ffffff';
  textArea.style.color = colorPicker.value;

  editor.classList.remove('hidden');
}

function saveEditor() {
  const card = cards.find(c => c.id === currentId);
  if (!card) return;

  card.text = textArea.value;
  card.color = colorPicker.value;

  saveToStorage();
}

backBtn.onclick = () => {
  saveEditor();
  editor.classList.add('hidden');
  currentId = null;
};

colorPicker.oninput = (e) => {
  textArea.style.color = e.target.value;
};

// Guardar mientras escribe (opcional)
textArea.addEventListener('input', () => {
  // si quieres guardar al salir solamente, borra este bloque
  const card = cards.find(c => c.id === currentId);
  if (!card) return;
  card.text = textArea.value;
  saveToStorage();
});

// menu
function openContextMenu(e, cardId) {
  e.preventDefault();
  // no mostrar menú mientras el editor está abierto
  if (!editor.classList.contains('hidden')) return;

  ctxTargetId = cardId;

  // posicion
  ctxMenu.style.left = `${e.clientX}px`;
  ctxMenu.style.top = `${e.clientY}px`;
  ctxMenu.classList.remove('hidden');
}

// cerrar menú al click fuera / scroll / resize / ESC
document.addEventListener('click', () => closeContextMenu());
document.addEventListener('scroll', () => closeContextMenu(), true);
window.addEventListener('resize', () => closeContextMenu());
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeContextMenu();
});

// opciones para ei¿liminar
deleteCardBtn.onclick = (e) => {
  e.stopPropagation();
  if (!ctxTargetId) return;

  cards = cards.filter(c => c.id !== ctxTargetId);
  saveToStorage();
  renderCards();
  closeContextMenu();
};

// ====== Init ======
renderCards();
closeContextMenu();
closeModal();
