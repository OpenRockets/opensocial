/**
 * OpenSocial UI - JavaScript functionality
 * Handles post creation, interactions, and UI updates
 */

// Application state
let posts = [];
let postIdCounter = 5; // Starting after the 4 existing posts

// DOM elements
const createPostBtn = document.getElementById('createPostBtn');
const postCreationCard = document.getElementById('postCreationCard');
const createPostForm = document.getElementById('createPostForm');
const cancelPostBtn = document.getElementById('cancelPost');
const postAuthor = document.getElementById('postAuthor');
const postContent = document.getElementById('postContent');
const charCount = document.getElementById('charCount');
const postsContainer = document.getElementById('postsContainer');
const postCountElement = document.getElementById('postCount');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Avatar gradient classes for new posts
const avatarGradients = [
    'bg-gradient-to-r from-blue-500 to-purple-600',
    'bg-gradient-to-r from-purple-500 to-pink-600',
    'bg-gradient-to-r from-green-500 to-blue-600',
    'bg-gradient-to-r from-yellow-500 to-orange-600',
    'bg-gradient-to-r from-pink-500 to-red-600',
    'bg-gradient-to-r from-indigo-500 to-purple-600',
    'bg-gradient-to-r from-emerald-500 to-teal-600',
    'bg-gradient-to-r from-orange-500 to-red-600'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('OpenSocial UI loaded successfully! 🚀');
    initializeEventListeners();
    updatePostCount();
    loadExistingPosts();
});

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Create post button
    createPostBtn.addEventListener('click', showPostCreationForm);
    
    // Cancel post button
    cancelPostBtn.addEventListener('click', hidePostCreationForm);
    
    // Post form submission
    createPostForm.addEventListener('submit', handlePostSubmission);
    
    // Character count for post content
    postContent.addEventListener('input', updateCharacterCount);
    
    // Like button interactions (using event delegation)
    postsContainer.addEventListener('click', handlePostInteraction);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Auto-save draft (localStorage)
    postContent.addEventListener('input', saveDraft);
    postAuthor.addEventListener('input', saveDraft);
    
    // Load draft on page load
    loadDraft();
}

/**
 * Show the post creation form
 */
function showPostCreationForm() {
    postCreationCard.classList.remove('hidden');
    postCreationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    postAuthor.focus();
    
    // Load any saved draft
    loadDraft();
}

/**
 * Hide the post creation form
 */
function hidePostCreationForm() {
    postCreationCard.classList.add('hidden');
    clearDraft();
    resetForm();
}

/**
 * Handle post form submission
 */
function handlePostSubmission(e) {
    e.preventDefault();
    
    const author = postAuthor.value.trim();
    const content = postContent.value.trim();
    
    // Validation
    if (!author || !content) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (author.length < 2) {
        showToast('Username must be at least 2 characters', 'error');
        return;
    }
    
    if (content.length < 10) {
        showToast('Post content must be at least 10 characters', 'error');
        return;
    }
    
    // Create new post
    const newPost = {
        id: postIdCounter++,
        author: author.startsWith('@') ? author : `@${author}`,
        content: content,
        timestamp: new Date(),
        likes: 0,
        liked: false,
        avatar: author.charAt(0).toUpperCase(),
        gradient: avatarGradients[Math.floor(Math.random() * avatarGradients.length)]
    };
    
    // Add to posts array
    posts.unshift(newPost);
    
    // Create and add post element
    const postElement = createPostElement(newPost);
    postsContainer.insertBefore(postElement, postsContainer.firstChild);
    
    // Animate new post
    postElement.classList.add('new-post');
    setTimeout(() => postElement.classList.remove('new-post'), 500);
    
    // Update UI
    updatePostCount();
    hidePostCreationForm();
    clearDraft();
    showToast('Post created successfully! 🎉', 'success');
    
    // Scroll to new post
    postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    console.log('New post created:', newPost);
}

/**
 * Create a post element
 */
function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 post-item';
    article.dataset.postId = post.id;
    
    const timeAgo = getTimeAgo(post.timestamp);
    
    article.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                <div class="w-10 h-10 ${post.gradient} rounded-full flex items-center justify-center text-white font-semibold">
                    ${post.avatar}
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-2">
                    <h4 class="text-sm font-semibold text-blue-600">${escapeHtml(post.author)}</h4>
                    <span class="text-xs text-gray-500">•</span>
                    <time class="text-xs text-gray-500">${timeAgo}</time>
                </div>
                <p class="text-gray-900 leading-relaxed">
                    ${escapeHtml(post.content)}
                </p>
                <div class="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                    <button class="flex items-center space-x-1 hover:text-blue-600 transition-colors like-btn ${post.liked ? 'liked' : ''}" data-action="like">
                        <svg class="w-4 h-4" fill="${post.liked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                        <span class="like-count">${post.likes}</span>
                    </button>
                    <button class="flex items-center space-x-1 hover:text-blue-600 transition-colors" data-action="reply">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        <span>Reply</span>
                    </button>
                    <button class="flex items-center space-x-1 hover:text-blue-600 transition-colors" data-action="share">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                        </svg>
                        <span>Share</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return article;
}

/**
 * Handle post interactions (likes, replies, shares)
 */
function handlePostInteraction(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    
    const action = button.dataset.action;
    const postElement = button.closest('.post-item');
    const postId = parseInt(postElement.dataset.postId);
    
    switch (action) {
        case 'like':
            handleLike(button, postId);
            break;
        case 'reply':
            handleReply(postId);
            break;
        case 'share':
            handleShare(postId);
            break;
    }
}

/**
 * Handle like button click
 */
function handleLike(button, postId) {
    const likeCountSpan = button.querySelector('.like-count');
    const svg = button.querySelector('svg');
    let currentCount = parseInt(likeCountSpan.textContent);
    
    // Find post in array if it exists
    const post = posts.find(p => p.id === postId);
    
    if (button.classList.contains('liked')) {
        // Unlike
        button.classList.remove('liked');
        svg.setAttribute('fill', 'none');
        likeCountSpan.textContent = currentCount - 1;
        
        if (post) {
            post.liked = false;
            post.likes = currentCount - 1;
        }
        
        showToast('Like removed', 'info');
    } else {
        // Like
        button.classList.add('liked');
        svg.setAttribute('fill', 'currentColor');
        likeCountSpan.textContent = currentCount + 1;
        
        if (post) {
            post.liked = true;
            post.likes = currentCount + 1;
        }
        
        showToast('Post liked! ❤️', 'success');
        
        // Add little animation
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }
}

/**
 * Handle reply button click
 */
function handleReply(postId) {
    showToast('Reply feature coming soon! 💬', 'info');
    // In a real app, this would open a reply form or modal
}

/**
 * Handle share button click
 */
function handleShare(postId) {
    if (navigator.share) {
        // Use Web Share API if available
        navigator.share({
            title: 'OpenSocial Post',
            text: 'Check out this post on OpenSocial!',
            url: window.location.href
        }).then(() => {
            showToast('Post shared successfully! 🚀', 'success');
        }).catch(() => {
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
}

/**
 * Fallback share method
 */
function fallbackShare() {
    // Copy link to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Link copied to clipboard! 📋', 'success');
    }).catch(() => {
        showToast('Share feature coming soon! 📤', 'info');
    });
}

/**
 * Update character count display
 */
function updateCharacterCount() {
    const currentLength = postContent.value.length;
    const maxLength = 500;
    
    charCount.textContent = currentLength;
    
    // Color coding
    charCount.className = '';
    if (currentLength > maxLength * 0.8) {
        charCount.classList.add('warning');
    }
    if (currentLength > maxLength * 0.95) {
        charCount.classList.add('danger');
    }
}

/**
 * Update post count in sidebar
 */
function updatePostCount() {
    const totalPosts = posts.length + 4; // 4 existing posts + new posts
    postCountElement.textContent = totalPosts;
}

/**
 * Load existing posts data (for like functionality)
 */
function loadExistingPosts() {
    const existingPosts = document.querySelectorAll('.post-item[data-post-id]');
    existingPosts.forEach((postElement, index) => {
        if (!postElement.dataset.postId) {
            postElement.dataset.postId = index + 1;
        }
    });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    // Update toast styling based on type
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform translate-y-full transition-transform duration-300 z-50`;
    
    switch (type) {
        case 'error':
            toast.classList.add('bg-red-600', 'text-white');
            break;
        case 'warning':
            toast.classList.add('bg-yellow-600', 'text-white');
            break;
        case 'info':
            toast.classList.add('bg-blue-600', 'text-white');
            break;
        default:
            toast.classList.add('bg-green-600', 'text-white');
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to submit post
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!postCreationCard.classList.contains('hidden')) {
            e.preventDefault();
            createPostForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to cancel post creation
    if (e.key === 'Escape') {
        if (!postCreationCard.classList.contains('hidden')) {
            hidePostCreationForm();
        }
    }
    
    // Ctrl/Cmd + K to focus search (if we add search functionality)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        const searchInput = document.querySelector('nav input[type="text"]');
        if (searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    }
}

/**
 * Save draft to localStorage
 */
function saveDraft() {
    const draft = {
        author: postAuthor.value,
        content: postContent.value,
        timestamp: Date.now()
    };
    
    if (draft.author || draft.content) {
        localStorage.setItem('opensocial-draft', JSON.stringify(draft));
    }
}

/**
 * Load draft from localStorage
 */
function loadDraft() {
    const draftStr = localStorage.getItem('opensocial-draft');
    if (draftStr) {
        try {
            const draft = JSON.parse(draftStr);
            
            // Only load draft if it's less than 24 hours old
            if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
                postAuthor.value = draft.author || '';
                postContent.value = draft.content || '';
                updateCharacterCount();
            } else {
                clearDraft();
            }
        } catch (e) {
            console.error('Failed to load draft:', e);
            clearDraft();
        }
    }
}

/**
 * Clear draft from localStorage
 */
function clearDraft() {
    localStorage.removeItem('opensocial-draft');
}

/**
 * Reset form fields
 */
function resetForm() {
    postAuthor.value = '';
    postContent.value = '';
    updateCharacterCount();
}

/**
 * Get time ago string
 */
function getTimeAgo(timestamp) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize search functionality (placeholder)
 */
function initializeSearch() {
    const searchInput = document.querySelector('nav input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            // Search implementation would go here
            console.log('Searching for:', query);
        });
    }
}

/**
 * Smooth scroll to top function
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Add scroll to top button functionality
 */
document.addEventListener('scroll', function() {
    // You can add a scroll-to-top button here if needed
});

// Export functions for testing or external use
window.OpenSocialUI = {
    showToast,
    createPost: handlePostSubmission,
    updatePostCount,
    scrollToTop
};

console.log('OpenSocial UI JavaScript loaded and ready! 🎉');