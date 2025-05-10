// Data management for the integrated dashboard
class DataManager {
  constructor() {
    this.notes = [];
    this.posts = [];
    this.travelEntries = [];
    this.loadData();
  }

  // Load data from localStorage
  loadData() {
    // Load notes
    try {
      const notesData = localStorage.getItem('notes');
      if (notesData) {
        this.notes = JSON.parse(notesData);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      this.notes = [];
    }

    // Load blog posts
    try {
      const postsData = localStorage.getItem('blog_posts');
      if (postsData) {
        this.posts = JSON.parse(postsData);
      } else {
        // Load sample posts if no posts exist
        this.posts = this.getSamplePosts();
        this.savePosts();
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      this.posts = this.getSamplePosts();
      this.savePosts();
    }

    // Load travel entries
    try {
      const travelData = localStorage.getItem('travel_entries');
      if (travelData) {
        this.travelEntries = JSON.parse(travelData);
      } else {
        // Load sample travel entries if none exist
        this.travelEntries = this.getSampleTravelEntries();
        this.saveTravelEntries();
      }
    } catch (error) {
      console.error('Error loading travel entries:', error);
      this.travelEntries = this.getSampleTravelEntries();
      this.saveTravelEntries();
    }
  }

  // Notes methods
  getNotes() {
    return this.notes;
  }

  getRecentNotes(limit = 3) {
    return [...this.notes]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit);
  }

  getNoteById(id) {
    return this.notes.find(note => note.id === id);
  }

  addNote(note) {
    const newNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.notes.push(newNote);
    this.saveNotes();
    return newNote;
  }

  updateNote(id, updatedNote) {
    const index = this.notes.findIndex(note => note.id === id);
    if (index !== -1) {
      this.notes[index] = {
        ...this.notes[index],
        ...updatedNote,
        updatedAt: new Date().toISOString()
      };
      this.saveNotes();
      return this.notes[index];
    }
    return null;
  }

  deleteNote(id) {
    const index = this.notes.findIndex(note => note.id === id);
    if (index !== -1) {
      this.notes.splice(index, 1);
      this.saveNotes();
      return true;
    }
    return false;
  }

  saveNotes() {
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }

  // Blog posts methods
  getPosts() {
    return this.posts;
  }

  getRecentPosts(limit = 4) {
    return [...this.posts]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }

  getFeaturedPost() {
    const sortedPosts = [...this.posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedPosts.length > 0 ? sortedPosts[0] : null;
  }

  getPostById(id) {
    return this.posts.find(post => post.id === id);
  }

  addPost(post) {
    const newPost = {
      ...post,
      id: Date.now(),
      date: new Date().toISOString(),
      comments: [],
      reactions: {
        'Love': 0,
        'Like': 0,
        'Laugh': 0,
        'Wow': 0,
        'Sad': 0
      },
      likes: 0
    };
    this.posts.push(newPost);
    this.savePosts();
    return newPost;
  }

  updatePost(id, updatedPost) {
    const index = this.posts.findIndex(post => post.id === id);
    if (index !== -1) {
      this.posts[index] = { ...this.posts[index], ...updatedPost };
      this.savePosts();
      return this.posts[index];
    }
    return null;
  }

  deletePost(id) {
    const index = this.posts.findIndex(post => post.id === id);
    if (index !== -1) {
      this.posts.splice(index, 1);
      this.savePosts();
      return true;
    }
    return false;
  }

  savePosts() {
    localStorage.setItem('blog_posts', JSON.stringify(this.posts));
  }

  // Travel entries methods
  getTravelEntries() {
    return this.travelEntries;
  }

  getRecentTravelEntries(limit = 5) {
    return [...this.travelEntries]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }

  getTravelEntryById(id) {
    return this.travelEntries.find(entry => entry.id === id);
  }

  addTravelEntry(entry) {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      date: entry.date || new Date().toISOString()
    };
    this.travelEntries.push(newEntry);
    this.saveTravelEntries();
    return newEntry;
  }

  updateTravelEntry(id, updatedEntry) {
    const index = this.travelEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      this.travelEntries[index] = { ...this.travelEntries[index], ...updatedEntry };
      this.saveTravelEntries();
      return this.travelEntries[index];
    }
    return null;
  }

  deleteTravelEntry(id) {
    const index = this.travelEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      this.travelEntries.splice(index, 1);
      this.saveTravelEntries();
      return true;
    }
    return false;
  }

  saveTravelEntries() {
    localStorage.setItem('travel_entries', JSON.stringify(this.travelEntries));
  }

  // Sample data
  getSamplePosts() {
    return [
      {
        id: 1,
        title: 'Getting Started with React',
        date: '2023-05-15T12:00:00Z',
        excerpt: 'Learn the basics of React and how to set up your first application with create-react-app.',
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        content: `
          <p>React is a JavaScript library for building user interfaces. It's maintained by Facebook and a community of individual developers and companies.</p>
          
          <h2>Why React?</h2>
          <p>React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes.</p>
          
          <h2>Setting up your environment</h2>
          <p>The easiest way to get started with React is to use Create React App, an officially supported way to create single-page React applications.</p>
        `,
        comments: [
          {
            id: 101,
            userName: 'ReactFan',
            text: 'Great introduction! Looking forward to more React tutorials.',
            date: '2023-05-16T08:30:00Z'
          }
        ],
        reactions: {
          'Love': 12,
          'Like': 8,
          'Laugh': 0,
          'Wow': 3,
          'Sad': 0
        },
        likes: 24
      },
      {
        id: 2,
        title: 'CSS Grid vs Flexbox',
        date: '2023-04-22T15:30:00Z',
        excerpt: 'Understanding when to use CSS Grid and when to use Flexbox for modern web layouts.',
        coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
        content: `
          <p>CSS Grid Layout and CSS Flexbox Layout are two powerful systems for creating layouts in web design. But when should you use each one?</p>
          
          <h2>Flexbox: One-dimensional layouts</h2>
          <p>Flexbox is designed for one-dimensional layouts - either a row or a column.</p>
          
          <h2>Grid: Two-dimensional layouts</h2>
          <p>CSS Grid Layout is designed for two-dimensional layouts - rows and columns together.</p>
        `,
        comments: [],
        reactions: {
          'Love': 8,
          'Like': 14,
          'Laugh': 0,
          'Wow': 2,
          'Sad': 0
        },
        likes: 18
      },
      {
        id: 3,
        title: 'My Trip to Japan',
        date: '2023-06-10T09:15:00Z',
        excerpt: 'Exploring the beautiful landscapes and culture of Japan during cherry blossom season.',
        coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
        content: `
          <p>Japan is a country that perfectly blends ancient traditions with modern life. During my visit in April, I was lucky enough to witness the famous cherry blossoms in full bloom.</p>
          
          <h2>Tokyo</h2>
          <p>Tokyo is a bustling metropolis that never sleeps. From the crowded streets of Shibuya to the serene gardens of the Imperial Palace, the city offers something for everyone.</p>
          
          <h2>Kyoto</h2>
          <p>Kyoto, the ancient capital, is home to over 1,600 Buddhist temples and 400 Shinto shrines. The Arashiyama Bamboo Grove was one of the most magical places I've ever visited.</p>
          
          <h2>Food</h2>
          <p>Japanese cuisine is an art form. From delicate sushi to hearty ramen, every meal was a culinary adventure.</p>
        `,
        comments: [
          {
            id: 301,
            userName: 'TravelLover',
            text: 'Great photos! Japan is on my bucket list.',
            date: '2023-06-11T14:20:00Z'
          }
        ],
        reactions: {
          'Love': 15,
          'Like': 10,
          'Laugh': 0,
          'Wow': 8,
          'Sad': 0
        },
        likes: 33
      }
    ];
  }

  getSampleTravelEntries() {
    return [
      {
        id: '1',
        name: 'Toronto, Canada',
        date: '2023-07-15T00:00:00Z',
        notes: 'Visited CN Tower and explored the vibrant downtown area.',
        image: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800',
        coordinates: {
          lat: 43.6532,
          lng: -79.3832
        }
      },
      {
        id: '2',
        name: 'Istanbul, Turkey',
        date: '2023-06-10T00:00:00Z',
        notes: 'Explored the Hagia Sophia and enjoyed amazing Turkish cuisine.',
        image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
        coordinates: {
          lat: 41.0082,
          lng: 28.9784
        }
      },
      {
        id: '3',
        name: 'San Juan del Sur, Nicaragua',
        date: '2023-05-05T00:00:00Z',
        notes: 'Relaxed on beautiful beaches and enjoyed the local seafood.',
        image: 'https://images.unsplash.com/photo-1605216663980-b7ca6e9f2451?w=800',
        coordinates: {
          lat: 11.2529,
          lng: -85.8705
        }
      },
      {
        id: '4',
        name: 'Rome, Italy',
        date: '2023-04-20T00:00:00Z',
        notes: 'Visited the Colosseum and enjoyed authentic Italian pizza and pasta.',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
        coordinates: {
          lat: 41.9028,
          lng: 12.4964
        }
      },
      {
        id: '5',
        name: 'Zurich, Switzerland',
        date: '2023-03-15T00:00:00Z',
        notes: 'Enjoyed the pristine lakes and majestic Alps in this beautiful city.',
        image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',
        coordinates: {
          lat: 47.3769,
          lng: 8.5417
        }
      },
      {
        id: '6',
        name: 'Paris, France',
        date: '2023-02-10T00:00:00Z',
        notes: 'Visited the Eiffel Tower and explored the charming streets of Montmartre.',
        image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800',
        coordinates: {
          lat: 48.8566,
          lng: 2.3522
        }
      }
    ];
  }
}

// Export data manager
const dataManager = new DataManager();