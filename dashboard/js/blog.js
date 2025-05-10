// Blog management functionality
class BlogManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.initialized = false;
  }

  // Initialize blog functionality
  initialize() {
    if (this.initialized) return;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Render blog sections
    this.renderBlogPosts();
    this.renderBlogPreview();
    
    this.initialized = true;
  }

  // Set up all event listeners for blog
  setupEventListeners() {
    // New post button
    document.getElementById('new-post-btn').addEventListener('click', () => this.showAddPostModal());
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
          modal.classList.remove('show');
        }
      });
    });
    
    // Blog post form submission
    const blogPostForm = document.getElementById('blog-post-form');
    if (blogPostForm) {
      blogPostForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.createNewPost();
      });
    }
    
    // Window click to close modals
    window.addEventListener('click', (e) => {
      document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    });
  }

  // Render blog posts in blog section
  renderBlogPosts() {
    // Render featured post
    this.renderFeaturedPost();
    
    // Render recent posts
    this.renderRecentPosts();
  }

  // Render featured post
  renderFeaturedPost() {
    const featuredPostContainer = document.getElementById('featured-post');
    if (!featuredPostContainer) return;
    
    const featuredPost = this.dataManager.getFeaturedPost();
    
    if (!featuredPost) {
      featuredPostContainer.innerHTML = '<div class="empty-state">No posts yet. Create your first post!</div>';
      return;
    }
    
    featuredPostContainer.innerHTML = this.createPostCardHTML(featuredPost, true);
    
    // Add click event to view post
    const postCard = featuredPostContainer.querySelector('.post-card');
    if (postCard) {
      postCard.addEventListener('click', () => this.showPostDetails(featuredPost.id));
    }
  }

  // Render recent posts
  renderRecentPosts() {
    const postsGrid = document.getElementById('blog-posts-grid');
    if (!postsGrid) return;
    
    // Clear grid
    postsGrid.innerHTML = '';
    
    // Get recent posts (excluding featured)
    const allPosts = this.dataManager.getPosts();
    const sortedPosts = [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentPosts = sortedPosts.slice(1, 4); // Skip the first one (featured)
    
    if (recentPosts.length === 0) {
      postsGrid.innerHTML = '<div class="empty-state">No additional posts yet.</div>';
      return;
    }
    
    // Create post cards
    recentPosts.forEach(post => {
      const postCard = document.createElement('div');
      postCard.innerHTML = this.createPostCardHTML(post);
      
      // Add click event
      postCard.querySelector('.post-card').addEventListener('click', () => this.showPostDetails(post.id));
      
      postsGrid.appendChild(postCard.firstElementChild);
    });
  }

  // Render blog preview on dashboard
  renderBlogPreview() {
    const postsPreview = document.querySelector('.posts-preview');
    if (!postsPreview) return;
    
    // Clear preview
    postsPreview.innerHTML = '';
    
    // Get recent posts
    const recentPosts = this.dataManager.getRecentPosts(2);
    
    if (recentPosts.length === 0) {
      postsPreview.innerHTML = '<div class="empty-state">No posts yet. Create your first post!</div>';
      return;
    }
    
    // Create preview items
    recentPosts.forEach(post => {
      const previewItem = document.createElement('div');
      previewItem.className = 'post-preview-item';
      
      const formattedDate = this.formatDate(post.date);
      
      previewItem.innerHTML = `
        <div class="post-preview-image" style="background-image: url('${post.coverImage}')"></div>
        <div class="post-preview-content">
          <h3>${post.title}</h3>
          <div class="post-preview-date">${formattedDate}</div>
          <p>${this.truncateText(post.excerpt, 80)}</p>
        </div>
      `;
      
      previewItem.addEventListener('click', () => {
        // Navigate to blog section
        document.querySelectorAll('.main-nav a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === 'blog') {
            link.classList.add('active');
          }
        });
        
        // Hide all sections
        document.querySelectorAll('main section').forEach(section => {
          section.classList.add('hidden-section');
          section.classList.remove('active-section');
        });
        
        // Show blog section
        document.getElementById('blog').classList.remove('hidden-section');
        document.getElementById('blog').classList.add('active-section');
        
        // Show post details
        this.showPostDetails(post.id);
      });
      
      postsPreview.appendChild(previewItem);
    });
  }

  // Show post details
  showPostDetails(postId) {
    const post = this.dataManager.getPostById(postId);
    if (!post) return;
    
    // Create a modal for post details if it doesn't exist
    let postModal = document.getElementById('post-detail-modal');
    
    if (!postModal) {
      postModal = document.createElement('div');
      postModal.id = 'post-detail-modal';
      postModal.className = 'modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content post-detail-modal-content';
      
      modalContent.innerHTML = `
        <span class="close-modal">&times;</span>
        <div class="post-detail-container"></div>
      `;
      
      postModal.appendChild(modalContent);
      document.body.appendChild(postModal);
      
      // Add close event
      postModal.querySelector('.close-modal').addEventListener('click', () => {
        postModal.classList.remove('show');
      });
      
      // Window click to close modal
      postModal.addEventListener('click', (e) => {
        if (e.target === postModal) {
          postModal.classList.remove('show');
        }
      });
    }
    
    // Populate modal with post details
    const postContainer = postModal.querySelector('.post-detail-container');
    
    const formattedDate = this.formatDate(post.date);
    
    postContainer.innerHTML = `
      <div class="post-detail-header">
        <h1>${post.title}</h1>
        <div class="post-meta">
          <span class="post-date">${formattedDate}</span>
          <span class="post-likes">${post.likes} likes</span>
        </div>
      </div>
      ${post.coverImage ? `<div class="post-detail-image">
        <img src="${post.coverImage}" alt="${post.title}">
      </div>` : ''}
      <div class="post-detail-content">
        ${post.content}
      </div>
      <div class="post-detail-reactions">
        <h3>Reactions</h3>
        <div class="reaction-buttons">
          <button class="reaction-btn" data-reaction="Love">❤️ ${post.reactions.Love}</button>
          <button class="reaction-btn" data-reaction="Like">👍 ${post.reactions.Like}</button>
          <button class="reaction-btn" data-reaction="Laugh">😂 ${post.reactions.Laugh}</button>
          <button class="reaction-btn" data-reaction="Wow">😲 ${post.reactions.Wow}</button>
          <button class="reaction-btn" data-reaction="Sad">😢 ${post.reactions.Sad}</button>
        </div>
      </div>
      <div class="post-detail-comments">
        <h3>Comments (${post.comments.length})</h3>
        ${post.comments.length > 0 ? `
          <div class="comments-list">
            ${post.comments.map(comment => `
              <div class="comment">
                <div class="comment-header">
                  <span class="comment-author">${comment.userName}</span>
                  <span class="comment-date">${this.formatDate(comment.date)}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
              </div>
            `).join('')}
          </div>
        ` : '<div class="no-comments">No comments yet</div>'}
        <div class="add-comment">
          <h4>Add a Comment</h4>
          <form id="comment-form" data-post-id="${post.id}">
            <div class="form-group">
              <label for="comment-name">Your Name</label>
              <input type="text" id="comment-name" required>
            </div>
            <div class="form-group">
              <label for="comment-text">Comment</label>
              <textarea id="comment-text" rows="3" required></textarea>
            </div>
            <button type="submit" class="submit-btn">Post Comment</button>
          </form>
        </div>
      </div>
    `;
    
    // Add reaction event listeners
    postContainer.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const reaction = btn.getAttribute('data-reaction');
        post.reactions[reaction]++;
        this.dataManager.updatePost(post.id, { reactions: post.reactions });
        btn.textContent = btn.textContent.split(' ')[0] + ' ' + post.reactions[reaction];
      });
    });
    
    // Add comment form submission
    const commentForm = postContainer.querySelector('#comment-form');
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = commentForm.querySelector('#comment-name').value;
      const text = commentForm.querySelector('#comment-text').value;
      
      if (!name || !text) return;
      
      const newComment = {
        id: Date.now(),
        userName: name,
        text: text,
        date: new Date().toISOString()
      };
      
      post.comments.push(newComment);
      this.dataManager.updatePost(post.id, { comments: post.comments });
      
      // Refresh post details
      this.showPostDetails(post.id);
    });
    
    // Show the modal
    postModal.classList.add('show');
  }

  // Show add post modal
  showAddPostModal() {
    const modal = document.getElementById('add-post-modal');
    if (!modal) return;
    
    // Reset form
    const form = modal.querySelector('#blog-post-form');
    if (form) {
      form.reset();
    }
    
    // Show modal
    modal.classList.add('show');
    
    // Make sure blog section is visible
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === 'blog') {
        link.classList.add('active');
      }
    });
    
    document.querySelectorAll('main section').forEach(section => {
      section.classList.add('hidden-section');
      section.classList.remove('active-section');
    });
    
    document.getElementById('blog').classList.remove('hidden-section');
    document.getElementById('blog').classList.add('active-section');
  }

  // Create new post
  createNewPost() {
    const title = document.getElementById('post-title').value;
    const excerpt = document.getElementById('post-excerpt').value;
    const content = document.getElementById('post-content').value;
    const coverImage = document.getElementById('post-image').value;
    
    if (!title || !excerpt || !content) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create new post
    const newPost = this.dataManager.addPost({
      title,
      excerpt,
      content: this.formatBlogContent(content),
      coverImage: coverImage || 'https://via.placeholder.com/800x400'
    });
    
    // Close modal
    document.getElementById('add-post-modal').classList.remove('show');
    
    // Update UI
    this.renderBlogPosts();
    this.renderBlogPreview();
    
    // Show success message
    this.showNotification('Post published successfully');
  }

  // Format blog content (convert plain text to HTML paragraphs)
  formatBlogContent(content) {
    // Check if content already has HTML tags
    if (content.includes('<p>') || content.includes('<h')) {
      return content;
    }
    
    // Split by double newline and create paragraphs
    return content
      .split('\n\n')
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  // Create HTML for post card
  createPostCardHTML(post, featured = false) {
    const formattedDate = this.formatDate(post.date);
    
    return `
      <div class="post-card ${featured ? 'featured' : ''}">
        ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}">` : ''}
        <div class="post-card-content">
          <h3>${post.title}</h3>
          <p>${this.truncateText(post.excerpt, featured ? 150 : 100)}</p>
          <div class="post-meta">
            <span class="post-date">${formattedDate}</span>
            <span class="post-likes">❤️ ${post.likes}</span>
          </div>
        </div>
      </div>
    `;
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

  // Helper to truncate text
  truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
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

// Export blog manager (will be initialized in app.js)
const blogManager = new BlogManager(dataManager);