// Import required modules
const { ipcRenderer } = require('electron');

// DOM Elements
const themeSwitchEl = document.getElementById('theme-switch');
const notesListEl = document.getElementById('notes-list');
const notesCountEl = document.getElementById('notes-count');
const searchNotesEl = document.getElementById('search-notes');
const newNoteBtnEl = document.getElementById('new-note-btn');
const newTodoBtnEl = document.getElementById('new-todo-btn');
const noteTitleEl = document.getElementById('note-title');
const noteContentEl = document.getElementById('note-content');
const saveNoteBtnEl = document.getElementById('save-note-btn');
const deleteNoteBtnEl = document.getElementById('delete-note-btn');
const colorOptionsEl = document.querySelectorAll('.color-option');
const noteTimestampEl = document.getElementById('note-timestamp');
const boldBtnEl = document.getElementById('bold-btn');
const italicBtnEl = document.getElementById('italic-btn');
const underlineBtnEl = document.getElementById('underline-btn');
const listBtnEl = document.getElementById('list-btn');
const checklistBtnEl = document.getElementById('checklist-btn');

// App state
let currentNote = null;
let notes = [];
let selectedColor = 'blue';
let isTodoList = false;
let filteredNotes = [];

// Theme switching
themeSwitchEl.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  
  // Save theme preference to localStorage
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
});

// Load theme preference from localStorage
function loadThemePreference() {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
    themeSwitchEl.checked = true;
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    themeSwitchEl.checked = false;
  }
}

// Initialize the app
function init() {
  loadThemePreference();
  
  // Set default color selection
  document.querySelector('.color-option[data-color="blue"]').classList.add('selected');
  
  // Make sure the editor is in an editable state
  noteTitleEl.disabled = false;
  noteContentEl.contentEditable = "true";
  
  loadNotes();
  setupEventListeners();
  setupAutoSave();
  
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
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
    filteredNotes = [...notes];
    updateNotesCount();
    renderNotesList();
  });

  ipcRenderer.on('notes-updated', (event, updatedNotes) => {
    notes = updatedNotes;
    filteredNotes = filterNotes(searchNotesEl.value);
    updateNotesCount();
    
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
  
  // Search functionality
  searchNotesEl.addEventListener('input', (e) => {
    filteredNotes = filterNotes(e.target.value);
    renderNotesList();
  });

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
  
  listBtnEl.addEventListener('click', () => {
    document.execCommand('insertUnorderedList', false, null);
    noteContentEl.focus();
  });
  
  checklistBtnEl.addEventListener('click', () => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();
    
    // Create a new todo item
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';
    
    const checkbox = document.createElement('div');
    checkbox.className = 'todo-checkbox';
    
    const content = document.createElement('div');
    content.className = 'todo-content';
    content.textContent = selectedText || 'New task';
    
    todoItem.appendChild(checkbox);
    todoItem.appendChild(content);
    
    // Replace the selection or insert at cursor
    range.deleteContents();
    range.insertNode(todoItem);
    
    // Move cursor to end of the inserted content
    range.setStartAfter(todoItem);
    range.setEndAfter(todoItem);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Add a line break after the todo item
    const br = document.createElement('br');
    range.insertNode(br);
    
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
        saveNote(); // Automatically save when color is changed
      }
    });
  });

  // Todo list item click handling
  noteContentEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('todo-checkbox')) {
      e.target.classList.toggle('checked');
      e.target.closest('.todo-item').classList.toggle('completed');
      
      // This ensures the content is saved when a todo item is marked as completed
      if (currentNote) {
        currentNote.content = noteContentEl.innerHTML;
        saveNote(); // Automatically save when checkbox is toggled
      }
    }
    else if (isTodoList && e.target.tagName === 'LI') {
      e.target.classList.toggle('completed');
      // This ensures the content is saved when a todo item is marked as completed
      if (currentNote) {
        currentNote.content = noteContentEl.innerHTML;
        saveNote(); // Automatically save when list item is toggled
      }
    }
  });
}

// Update notes count
function updateNotesCount() {
  notesCountEl.textContent = notes.length;
}

// Filter notes based on search query
function filterNotes(query) {
  if (!query) return [...notes];
  
  query = query.toLowerCase();
  return notes.filter(note => 
    note.title.toLowerCase().includes(query) || 
    stripHtml(note.content).toLowerCase().includes(query)
  );
}

// Strip HTML tags for plain text search
function stripHtml(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

// Format timestamp
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // Less than a week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  // Format as date
  return date.toLocaleDateString();
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
  updateTimestamp(currentNote.createdAt);
  
  // Ensure the editor is in an editable state
  noteTitleEl.disabled = false;
  noteContentEl.contentEditable = "true";
  
  // Clear the active state from all notes in the list
  const noteItems = document.querySelectorAll('.note-item');
  noteItems.forEach(item => item.classList.remove('active'));
  
  // Update color selection
  updateColorSelection(selectedColor);
  
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
    content: '<div class="todo-item"><div class="todo-checkbox"></div><div class="todo-content">New task</div></div>',
    color: selectedColor,
    isTodoList: true,
    createdAt: new Date().toISOString()
  };
  
  // Clear and set up the editor
  noteTitleEl.value = '';
  noteContentEl.innerHTML = currentNote.content;
  updateTimestamp(currentNote.createdAt);
  
  // Ensure the editor is in an editable state
  noteTitleEl.disabled = false;
  noteContentEl.contentEditable = "true";
  
  // Clear the active state from all notes in the list
  const noteItems = document.querySelectorAll('.note-item');
  noteItems.forEach(item => item.classList.remove('active'));
  
  // Update color selection
  updateColorSelection(selectedColor);
  
  // Focus on the title field
  setTimeout(() => {
    noteTitleEl.focus();
  }, 100);
}

// Update the timestamp display
function updateTimestamp(dateString) {
  noteTimestampEl.textContent = `Last edited: ${formatDate(dateString)}`;
}

// Update color selection in the UI
function updateColorSelection(color) {
  colorOptionsEl.forEach(option => {
    option.classList.remove('selected');
    if (option.getAttribute('data-color') === color) {
      option.classList.add('selected');
    }
  });
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
  
  updateTimestamp(currentNote.updatedAt);
  
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
    updateTimestamp(new Date().toISOString());
    
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

// Get note preview text
function getNotePreview(note) {
  if (!note.content) return '';
  
  const temp = document.createElement('div');
  temp.innerHTML = note.content;
  const text = temp.textContent || temp.innerText || '';
  return text.substring(0, 40) + (text.length > 40 ? '...' : '');
}

// Render the notes list in the left panel
function renderNotesList() {
  notesListEl.innerHTML = '';
  
  if (filteredNotes.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-notes text-center py-5 text-muted';
    emptyEl.innerHTML = `
      <i class="bi bi-journal-text fs-1"></i>
      <p class="mt-2">No notes found</p>
    `;
    notesListEl.appendChild(emptyEl);
    return;
  }
  
  filteredNotes.sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt;
    const dateB = b.updatedAt || b.createdAt;
    return new Date(dateB) - new Date(dateA);
  });
  
  filteredNotes.forEach(note => {
    const noteEl = document.createElement('div');
    noteEl.className = 'note-item fade-in';
    if (currentNote && currentNote.id === note.id) {
      noteEl.classList.add('active');
    }
    
    // Create the note preview HTML
    noteEl.innerHTML = `
      <div class="note-item-title">
        <span class="color-indicator" style="background-color: var(--${note.color || 'blue'})"></span>
        ${note.title || 'Untitled'}
        ${note.isTodoList ? '<i class="bi bi-check2-square ms-1 small"></i>' : ''}
      </div>
      <div class="note-preview">${getNotePreview(note)}</div>
      <div class="note-item-date">${formatDate(note.updatedAt || note.createdAt)}</div>
    `;
    
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
    if (currentNote && currentNote.id === note.id) {
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
  updateTimestamp(note.updatedAt || note.createdAt);
  
  // Update the selected color
  updateColorSelection(selectedColor);
}

// Check if there are unsaved changes
function hasUnsavedChanges() {
  if (!currentNote) return false;
  
  const titleChanged = currentNote.title !== noteTitleEl.value;
  const contentChanged = currentNote.content !== noteContentEl.innerHTML;
  const colorChanged = currentNote.color !== selectedColor;
  
  return titleChanged || contentChanged || colorChanged;
}

// Set up auto-save functionality
function setupAutoSave() {
  // Auto-save on title changes
  noteTitleEl.addEventListener('input', () => {
    if (currentNote) {
      // Debounce the save operation
      clearTimeout(noteTitleEl.saveTimeout);
      noteTitleEl.saveTimeout = setTimeout(() => {
        saveNote();
      }, 1000);
    }
  });
  
  // Auto-save on content changes
  noteContentEl.addEventListener('input', () => {
    if (currentNote) {
      // Debounce the save operation
      clearTimeout(noteContentEl.saveTimeout);
      noteContentEl.saveTimeout = setTimeout(() => {
        saveNote();
      }, 1000);
    }
  });
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init);