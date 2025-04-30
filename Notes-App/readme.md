# Notes & To-Do List Manager

A desktop application built with Electron, Node.js, and npm that allows you to create, edit, and manage notes and to-do lists.

## Features

- **Split-screen layout** with notes list on the left and editor on the right
- Support for both **notes** and **to-do lists**
- **Rich text formatting** with bold, italic, and underline options
- **Color-coding** for visual organization (red, blue, green, purple)
- **Light and Dark mode** support
- **Automatic bullet points** for to-do lists with ability to cross out completed items
- **Local storage** for all notes and lists

## Project Structure

```
electron-notes-todo-app/
├── package.json        # Project configuration and dependencies
├── main.js             # Main Electron process
├── index.html          # Application UI structure
├── styles.css          # Styling for the application
└── renderer.js         # Frontend logic
```

## Setup Instructions

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone or download this repository to your local machine.

2. Open a terminal and navigate to the project directory:
   ```
   cd path/to/electron-notes-todo-app
   ```

3. Install the required dependencies:
   ```
   npm install
   ```

### Running the Application

To start the application, run:

```
npm start
```

## Usage Guide

### Creating Notes and To-Do Lists

- Click the "New Note" button to create a standard note
- Click the "New To-Do List" button to create a to-do list
- Enter a title in the title field
- Add your content in the main editor area

### Formatting Text

- Use the B, I, and U buttons for Bold, Italic, and Underline formatting

### Managing To-Do Lists

- For to-do lists, each line automatically becomes a bullet point
- Click on any bullet point to mark it as completed (adds strikethrough)
- Press Enter to create a new bullet point

### Color Coding

- Select one of the four color options (red, blue, green, purple) to organize your notes

### Switching Themes

- Use the toggle switch at the top of the window to switch between Light Mode and Dark Mode

### Saving and Deleting

- Click the "Save" button to save your changes
- Click the "Delete" button to remove the current note