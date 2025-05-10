# Integrated Personal Dashboard

This dashboard combines a Notes/To-Do app with a Blog and Travel Diary into a single unified interface.

## Features

### Dashboard Overview
- At-a-glance view of recent notes, blog posts, and travel map
- Quick action buttons to create new content
- Dark/light theme toggle

### Notes & To-Do App
- Create, edit, and delete notes
- Create to-do lists with checkboxes
- Format text with bold, italic, and underline
- Color-code notes for organization
- Notes are saved automatically

### Blog
- View, create and interact with blog posts
- Featured post and recent posts display
- Comment on posts
- React to posts with different reactions
- Rich text content

### Travel Diary
- Interactive map with Mapbox integration
- Add new travel locations with notes and images
- View all travel entries in a list
- Click entries to zoom to location on map

## Getting Started

1. Open `index.html` in a modern web browser
2. Use the navigation menu to switch between sections
3. Click the theme toggle to switch between light and dark mode

## Data Storage

All data is stored in your browser's localStorage:
- Notes are saved as `notes`
- Blog posts are saved as `blog_posts`
- Travel entries are saved as `travel_entries`

## Map Integration

The Travel Diary map uses Mapbox with the following API key:
```
pk.eyJ1Ijoiem5vb3IiLCJhIjoiY21hZ3U4ankyMDR4NzJyb2ZnOXJwOGRlMCJ9.4nJMlIObtEiRQmoLhFFQbw
```

## Browser Compatibility

This dashboard works best in modern browsers:
- Chrome (recommended)
- Firefox
- Edge
- Safari

## Technical Details

This dashboard is built with:
- Vanilla JavaScript (ES6+)
- CSS3 with CSS Variables for theming
- HTML5
- Mapbox GL JS for mapping
- LocalStorage for data persistence

No build steps or dependencies required.