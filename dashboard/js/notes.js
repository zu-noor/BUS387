// Notes management functionality
class NotesManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.currentNoteId = null;
    this.isTodoMode = false;
    this.initialized = false;
  }

  // Initialize the notes functionality
  initialize() {
    if (this.initialized) return;
    
    // Set up event listeners for notes section
    this.setupEventListeners();
    
    // Render notes list
    this.renderNotesList();
    
    // Render notes preview on dashboard
    this.renderNotesPreview();
    
    this.initialized = true;
  }

  // Set up all event listeners for notes
  setupEventListeners() {
    // New note buttons
    document.getElementById('new-note-btn').addEventListener('click', () => this.createNewNote());
    document.getElementById('notes-new-note-btn').addEventListener('click', () => this.createNewNote());
    
    // New todo buttons
    document.getElementById('new-todo-btn').addEventListener('click', () => this.createNewTodo());
    document.getElementById('notes-new-todo-btn').addEventListener('click', () => this.createNewTodo());
    
    // Save note button
    document.getElementById('save-note-btn').addEventListener('click', () => this.saveCurrentNote());
    
    // Delete note button
    document.getElementById('delete-note-btn').addEventListener('click', () => this.deleteCurrentNote());
    
    // Formatting buttons
    document.getElementById('bold-btn').addEventListener('click', () => this.formatText('bold'));
    document.getElementById('italic-btn').addEventListener('click', () => this.formatText('italic'));
    document.getElementById('underline-btn').addEventListener('click', () => this.formatText('underline'));
    
    // Color picker
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.setNoteColor(option.getAttribute('data-color'));
      });
    });
  }

  // Render the notes list in the left panel
  renderNotesList() {
    const notesList = document.getElementById('notes-list');
    if (!notesList) return;
    
    // Clear the list
    notesList.innerHTML = '';
    
    // Get all notes
    const notes = this.dataManager.getNotes();
    
    if (notes.length === 0) {
      notesList.innerHTML = '<div class="empty-state">No notes yet. Create one!</div>';
      return;
    }
    
    // Sort notes by updated date (newest first)
    const sortedNotes = [...notes].sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    
    // Create note items
    sortedNotes.forEach(note => {
      const noteItem = document.createElement('div');
      noteItem.className = 'note-item';
      noteItem.dataset.id = note.id;
      
      if (this.currentNoteId === note.id) {
        noteItem.classList.add('active');
      }
      
      if (note.color) {
        noteItem.style.borderLeft = `3px solid var(--accent-${note.color})`;
      }
      
      const truncatedContent = this.getTruncatedContent(note.content);
      
      noteItem.innerHTML = `
        <div class="note-item-title">${note.title || 'Untitled Note'}</div>
        <div class="note-item-date">${this.formatDate(note.updatedAt)}</div>
        <div class="note-item-excerpt">${truncatedContent}</div>
      `;
      
      noteItem.addEventListener('click', () => this.openNote(note.id));
      
      notesList.appendChild(noteItem);
    });
  }

  // Render notes preview on dashboard
  renderNotesPreview() {
    const notesPreview = document.querySelector('.notes-preview');
    if (!notesPreview) return;
    
    // Clear preview
    notesPreview.innerHTML = '';
    
    // Get recent notes
    const recentNotes = this.dataManager.getRecentNotes(3);
    
    if (recentNotes.length === 0) {
      notesPreview.innerHTML = '<div class="empty-state">No notes yet. Create one!</div>';
      return;
    }
    
    // Create preview items
    recentNotes.forEach(note => {
      const previewItem = document.createElement('div');
      previewItem.className = 'note-preview-item';
      
      if (note.color) {
        previewItem.style.borderLeftColor = `var(--accent-${note.color})`;
      }
      
      const truncatedContent = this.getTruncatedContent(note.content, 60);
      
      previewItem.innerHTML = `
        <div class="note-preview-title">${note.title || 'Untitled Note'}</div>
        <div class="note-preview-date">${this.formatDate(note.updatedAt)}</div>
        <div class="note-preview-excerpt">${truncatedContent}</div>
      `;
      
      previewItem.addEventListener('click', () => {
        // Navigate to notes section
        document.querySelectorAll('.main-nav a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === 'notes') {
            link.classList.add('active');
          }
        });
        
        // Hide all sections
        document.querySelectorAll('main section').forEach(section => {
          section.classList.add('hidden-section');
          section.classList.remove('active-section');
        });
        
        // Show notes section
        document.getElementById('notes').classList.remove('hidden-section');
        document.getElementById('notes').classList.add('active-section');
        
        // Open the note
        this.openNote(note.id);
      });
      
      notesPreview.appendChild(previewItem);
    });
  }

  // Create a new note
  createNewNote() {
    this.isTodoMode = false;
    
    // Clear the editor
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').innerHTML = '';
    
    // Remove any color setting
    document.querySelectorAll('.color-option').forEach(option => {
      option.classList.remove('selected');
    });
    
    // Update current note ID
    this.currentNoteId = null;
    
    // Update UI to show we're editing a new note
    document.getElementById('note-editor').classList.remove('todo-mode');
    
    // Focus on title
    document.getElementById('note-title').focus();
    
    // Make sure notes section is visible
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === 'notes') {
        link.classList.add('active');
      }
    });
    
    document.querySelectorAll('main section').forEach(section => {
      section.classList.add('hidden-section');
      section.classList.remove('active-section');
    });
    
    document.getElementById('notes').classList.remove('hidden-section');
    document.getElementById('notes').classList.add('active-section');
  }

  // Create a new todo list
  createNewTodo() {
    this.isTodoMode = true;
    
    // Clear the editor
    document.getElementById('note-title').value = 'To-Do List';
    document.getElementById('note-content').innerHTML = `
      <ul class="todo-list">
        <li><input type="checkbox"> Add your first task</li>
        <li><input type="checkbox"> Add another task</li>
      </ul>
    `;
    
    // Set default color to green for todos
    this.setNoteColor('green');
    
    // Update current note ID
    this.currentNoteId = null;
    
    // Update UI to show we're editing a todo
    document.getElementById('note-editor').classList.add('todo-mode');
    
    // Focus on content
    document.getElementById('note-content').focus();
    
    // Make sure notes section is visible
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === 'notes') {
        link.classList.add('active');
      }
    });
    
    document.querySelectorAll('main section').forEach(section => {
      section.classList.add('hidden-section');
      section.classList.remove('active-section');
    });
    
    document.getElementById('notes').classList.remove('hidden-section');
    document.getElementById('notes').classList.add('active-section');
  }

  // Open a note for editing
  openNote(id) {
    const note = this.dataManager.getNoteById(id);
    if (!note) return;
    
    // Set editor values
    document.getElementById('note-title').value = note.title || '';
    document.getElementById('note-content').innerHTML = note.content || '';
    
    // Update current note ID
    this.currentNoteId = id;
    
    // Set color if available
    if (note.color) {
      this.setNoteColor(note.color, false);
    } else {
      // Clear color selection
      document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
      });
    }
    
    // Update note list selection
    document.querySelectorAll('.note-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.id === id) {
        item.classList.add('active');
      }
    });
    
    // Check if it's a todo list
    this.isTodoMode = note.content.includes('<ul class="todo-list">');
    if (this.isTodoMode) {
      document.getElementById('note-editor').classList.add('todo-mode');
    } else {
      document.getElementById('note-editor').classList.remove('todo-mode');
    }
  }

  // Save the current note
  saveCurrentNote() {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').innerHTML;
    let color = null;
    
    // Get selected color
    document.querySelectorAll('.color-option').forEach(option => {
      if (option.classList.contains('selected')) {
        color = option.getAttribute('data-color');
      }
    });
    
    // Prepare note data
    const noteData = {
      title: title || 'Untitled Note',
      content,
      color,
      isTodo: this.isTodoMode
    };
    
    // Create or update note
    if (this.currentNoteId) {
      this.dataManager.updateNote(this.currentNoteId, noteData);
    } else {
      const newNote = this.dataManager.addNote(noteData);
      this.currentNoteId = newNote.id;
    }
    
    // Update UI
    this.renderNotesList();
    this.renderNotesPreview();
    
    // Show success message
    this.showNotification('Note saved successfully');
  }

  // Delete the current note
  deleteCurrentNote() {
    if (!this.currentNoteId) return;
    
    // Confirm deletion
    if (confirm('Are you sure you want to delete this note?')) {
      this.dataManager.deleteNote(this.currentNoteId);
      
      // Clear editor
      document.getElementById('note-title').value = '';
      document.getElementById('note-content').innerHTML = '';
      this.currentNoteId = null;
      
      // Update UI
      this.renderNotesList();
      this.renderNotesPreview();
      
      // Show success message
      this.showNotification('Note deleted successfully');
    }
  }

  // Set the color for the current note
  setNoteColor(color, saveNote = true) {
    // Update color selection UI
    document.querySelectorAll('.color-option').forEach(option => {
      option.classList.remove('selected');
      if (option.getAttribute('data-color') === color) {
        option.classList.add('selected');
      }
    });
    
    // If requested, save the note with the new color
    if (saveNote && this.currentNoteId) {
      this.dataManager.updateNote(this.currentNoteId, { color });
      this.renderNotesList();
      this.renderNotesPreview();
    }
  }

  // Apply formatting to selected text
  formatText(format) {
    document.execCommand(format, false, null);
    document.getElementById('note-content').focus();
  }

  // Helper to format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Helper to get truncated content text
  getTruncatedContent(htmlContent, maxLength = 80) {
    // Create a temporary element to extract text
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;
    const textContent = temp.textContent || temp.innerText || '';
    
    if (textContent.length <= maxLength) {
      return textContent;
    }
    
    return textContent.substring(0, maxLength) + '...';
  }

  // Show a temporary notification
  showNotification(message) {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
      // Create notification container
      notificationContainer = document.createElement('div');
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        notificationContainer.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Export notes manager (will be initialized in app.js)
const notesManager = new NotesManager(dataManager);