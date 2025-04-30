// Import required modules
const { ipcRenderer } = require('electron');

// DOM Elements
const themeSwitchEl = document.getElementById('theme-switch');
const notesListEl = document.getElementById('notes-list');
const newNoteBtnEl = document.getElementById('new-note-btn');
const newTodoBtnEl = document.getElementById('new-todo-btn');
const noteTitleEl = document.getElementById('note-title');
const noteContentEl = document.getElementById('note-content');
const saveNoteBtnEl = document.getElementById('save-note-btn');
const deleteNoteBtnEl = document.getElementById('delete-note-btn');
const colorOptionsEl = document.querySelectorAll('.color-option');
const boldBtnEl = document.getElementById('bold-btn');
const italicBtnEl = document.getElementById('italic-btn');
const underlineBtnEl = document.getElementById('underline-btn');

// App state
let currentNote = null;
let notes = [];
let selectedColor = 'blue';
let isTodoList = false;

// Theme switching
themeSwitchEl.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
});

// Initialize the app
function init() {
  // Set default color selection
  document.querySelector('.color-option[data-color="blue"]').classList.add('selected');
  
  // Make sure the editor is in an editable state
  noteTitleEl.disabled = false;
  noteContentEl.contentEditable = "true";
  
  loadNotes();
  setupEventListeners();
  
  // Focus on title field to indicate the app is ready
  setTimeout(() => {
    noteTitleEl.focus();
  }, 300);
}

// Load notes from the store
function loadNotes() {
  ipcRenderer.send('get-notes');
}

// Set up event listeners
function setupEventListeners() {
  // IPC Event listeners
  ipcRenderer.on('notes-loaded', (event, loadedNotes) => {
    notes = loadedNotes;
    renderNotesList();
  });

  ipcRenderer.on('notes-updated', (event, updatedNotes) => {
    notes = updatedNotes;
    
    // If we just saved a new note, update our current note object with the assigned ID
    if (currentNote && !currentNote.id) {
      // Find the newly created note by matching title and content
      const newNote = updatedNotes.find(note => 
        note.title === currentNote.title && 
        note.content === currentNote.content &&
        note.color === currentNote.color
      );
      
      if (newNote) {
        currentNote = newNote;
      }
    }
    
    renderNotesList();
  });

  // UI Event listeners
  newNoteBtnEl.addEventListener('click', createNewNote);
  newTodoBtnEl.addEventListener('click', createNewTodoList);
  saveNoteBtnEl.addEventListener('click', saveNote);
  deleteNoteBtnEl.addEventListener('click', deleteNote);

  // Text formatting buttons
  boldBtnEl.addEventListener('click', () => {
    document.execCommand('bold', false, null);
    noteContentEl.focus();
  });

  italicBtnEl.addEventListener('click', () => {
    document.execCommand('italic', false, null);
    noteContentEl.focus();
  });

  underlineBtnEl.addEventListener('click', () => {
    document.execCommand('underline', false, null);
    noteContentEl.focus();
  });

  // Color picker
  colorOptionsEl.forEach(option => {
    option.addEventListener('click', () => {
      colorOptionsEl.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      selectedColor = option.getAttribute('data-color');
      
      if (currentNote) {
        currentNote.color = selectedColor;
      }
    });
  });

  // Todo list item click handling
  noteContentEl.addEventListener('click', (e) => {
    if (isTodoList && e.target.tagName === 'LI') {
      e.target.classList.toggle('completed');
      // This ensures the content is saved when a todo item is marked as completed
      if (currentNote) {
        currentNote.content = noteContentEl.innerHTML;
      }
    }
  });
}

// Create a new empty note
function createNewNote() {
  // First prompt to save if there are unsaved changes
  if (currentNote && hasUnsavedChanges()) {
    if (confirm('You have unsaved changes. Save before creating a new note?')) {
      saveNote();
    }
  }
  
  // Then create the new note
  isTodoList = false;
  currentNote = {
    id: null,
    title: '',
    content: '',
    color: selectedColor,
    isTodoList: false,
    createdAt: new Date().toISOString()
  };
  
  // Clear the editor
  noteTitleEl.value = '';
  noteContentEl.innerHTML = '';
  
  // Ensure the editor is in an editable state
  noteTitleEl.disabled = false;
  noteContentEl.contentEditable = "true";
  
  // Clear the active state from all notes in the list
  const noteItems = document.querySelectorAll('.note-item');
  noteItems.forEach(item => item.classList.remove('active'));
  
  // Focus on the title field
  setTimeout(() => {
    noteTitleEl.focus();
  }, 100);
}

// Create a new empty todo list
function createNewTodoList() {
  // First prompt to save if there are unsaved changes
  if (currentNote && hasUnsavedChanges()) {
    if (confirm('You have unsaved changes. Save before creating a new to-do list?')) {
      saveNote();
    }
  }
  
  // Then create the new to-do list
  isTodoList = true;
  currentNote = {
    id: null,
    title: '',
    content: '<ul><li></li></ul>', // Start with one empty bullet point
    color: selectedColor,
    isTodoList: true,
    createdAt: new Date().toISOString()
  };
  
  // Clear and set up the editor
  noteTitleEl.value = '';
  noteContentEl.innerHTML = '<ul><li></li></ul>';
  
  // Ensure the editor is in an editable state
  noteTitleEl.disabled = false;
  noteContentEl.contentEditable = "true";
  
  // Clear the active state from all notes in the list
  const noteItems = document.querySelectorAll('.note-item');
  noteItems.forEach(item => item.classList.remove('active'));
  
  // Focus on the title field
  setTimeout(() => {
    noteTitleEl.focus();
  }, 100);
}

// Save the current note
function saveNote() {
  if (!currentNote) return;
  
  // Get values from the UI
  const title = noteTitleEl.value || 'Untitled';
  const content = noteContentEl.innerHTML;
  
  // Update the current note object
  currentNote.title = title;
  currentNote.content = content;
  currentNote.color = selectedColor;
  currentNote.isTodoList = isTodoList;
  currentNote.updatedAt = new Date().toISOString();
  
  // Save to storage via IPC
  ipcRenderer.send('save-note', currentNote);
}

// Delete the current note
function deleteNote() {
  if (!currentNote || !currentNote.id) return;
  
  if (confirm('Are you sure you want to delete this note?')) {
    ipcRenderer.send('delete-note', currentNote.id);
    
    // Clear editor but maintain functionality
    currentNote = null;
    noteTitleEl.value = '';
    noteContentEl.innerHTML = '';
    
    // Clear the active state from all notes in the list
    const noteItems = document.querySelectorAll('.note-item');
    noteItems.forEach(item => item.classList.remove('active'));
    
    // Make sure the editor remains functional by ensuring it's enabled
    noteTitleEl.disabled = false;
    noteContentEl.contentEditable = "true";
    
    // Focus on the title field to show it's ready for input
    setTimeout(() => {
      noteTitleEl.focus();
    }, 100);
  }
}

// Render the notes list in the left panel
function renderNotesList() {
  notesListEl.innerHTML = '';
  
  if (notes.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-notes';
    emptyEl.textContent = 'No notes yet. Create one!';
    notesListEl.appendChild(emptyEl);
    return;
  }
  
  notes.sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt;
    const dateB = b.updatedAt || b.createdAt;
    return new Date(dateB) - new Date(dateA);
  });
  
  notes.forEach(note => {
    const noteEl = document.createElement('div');
    noteEl.className = 'note-item';
    noteEl.setAttribute('data-id', note.id);
    
    if (currentNote && currentNote.id === note.id) {
      noteEl.classList.add('active');
    }
    
    const colorIndicator = document.createElement('span');
    colorIndicator.className = 'color-indicator';
    colorIndicator.style.backgroundColor = `var(--${note.color || 'blue'})`;
    
    const titleEl = document.createElement('h3');
    titleEl.appendChild(colorIndicator);
    titleEl.appendChild(document.createTextNode(note.title || 'Untitled'));
    
    const dateEl = document.createElement('p');
    const date = note.updatedAt ? new Date(note.updatedAt) : new Date(note.createdAt);
    dateEl.textContent = date.toLocaleString();
    
    noteEl.appendChild(titleEl);
    noteEl.appendChild(dateEl);
    
    noteEl.addEventListener('click', () => {
      selectNote(note);
    });
    
    notesListEl.appendChild(noteEl);
  });
}

// Select a note to edit
function selectNote(note) {
  // Prompt to save if there are unsaved changes in the current note
  if (currentNote && hasUnsavedChanges()) {
    if (confirm('You have unsaved changes. Save before switching notes?')) {
      saveNote();
    }
  }
  
  currentNote = JSON.parse(JSON.stringify(note)); // Create a copy to avoid reference issues
  isTodoList = note.isTodoList || false;
  selectedColor = note.color || 'blue';
  
  // Update the active state in the notes list
  const noteItems = document.querySelectorAll('.note-item');
  noteItems.forEach(item => {
    if (item.getAttribute('data-id') === note.id) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Ensure the editor is in an editable state before updating content
  noteTitleEl.disabled = false;
  noteContentEl.contentEditable = "true";
  
  // Update the editor
  noteTitleEl.value = note.title || '';
  noteContentEl.innerHTML = note.content || '';
  
  // Set the selected color
  colorOptionsEl.forEach(option => {
    option.classList.remove('selected');
    if (option.getAttribute('data-color') === selectedColor) {
      option.classList.add('selected');
    }
  });
  
  // Set up todo list functionality if needed
  if (isTodoList) {
    // Make sure we have a UL
    if (!noteContentEl.querySelector('ul')) {
      noteContentEl.innerHTML = '<ul><li></li></ul>';
    }
    
    // Add event listener for list item behavior
    noteContentEl.addEventListener('keydown', handleTodoKeydown);
  } else {
    // Remove todo list event listener if not a todo list
    noteContentEl.removeEventListener('keydown', handleTodoKeydown);
  }
  
  // Focus on a field to indicate it's ready for editing
  setTimeout(() => {
    noteTitleEl.focus();
  }, 100);
}

// Check if there are unsaved changes
function hasUnsavedChanges() {
  if (!currentNote) return false;
  
  const titleChanged = currentNote.title !== noteTitleEl.value;
  const contentChanged = currentNote.content !== noteContentEl.innerHTML;
  const colorChanged = currentNote.color !== selectedColor;
  
  return titleChanged || contentChanged || colorChanged;
}

// Handle keydown events for todo lists
function handleTodoKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    
    // Get the current selection
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const currentLi = range.startContainer.closest('li');
    
    // Only handle if we're inside a list item
    if (currentLi) {
      // Create a new list item
      const newLi = document.createElement('li');
      
      // Insert the new list item after the current one
      if (currentLi.nextSibling) {
        currentLi.parentNode.insertBefore(newLi, currentLi.nextSibling);
      } else {
        currentLi.parentNode.appendChild(newLi);
      }
      
      // Move the cursor to the new list item
      range.setStart(newLi, 0);
      range.setEnd(newLi, 0);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

// Clear the editor
function clearEditor() {
  currentNote = null;
  noteTitleEl.value = '';
  noteContentEl.innerHTML = '';
  
  // Ensure the editor remains usable
  noteTitleEl.disabled = false;
  noteContentEl.contentEditable = "true";
  
  // Clear the active state from all notes in the list
  const noteItems = document.querySelectorAll('.note-item');
  noteItems.forEach(item => item.classList.remove('active'));
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init);