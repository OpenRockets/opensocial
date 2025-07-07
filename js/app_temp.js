// OpenSocial Chat Animation Script
class AnimatedChat {
    constructor() {
        this.chatContainer = null;
        this.chatInput = null;
        this.isExpanded = false;
        this.typewriterInterval = null;
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isTyping = false;
        
        // Dynamic placeholder texts
        this.placeholderTexts = [
            "Why OpenSocial?",
            "What to do here?",
            "Where is the GitHub link?",
            "How to start building this?",
            "What is OpenRockets?",
            "What will winners receive?",
            "GitHub link?",
            "Do I allowed to change anything?"
        ];
        
        this.init();
    }
    
    init() {
        this.createChatInterface();
        this.setupEventListeners();
        this.startTypewriterEffect();
    }
    
    createChatInterface() {
        // Create chat container
        this.chatContainer = document.createElement('div');
        this.chatContainer.id = 'animated-chat';
        this.chatContainer.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out';
        
        // Create chat input wrapper
        const chatWrapper = document.createElement('div');
        chatWrapper.className = 'chat-wrapper relative bg-black bg-opacity-40 backdrop-blur-md rounded-full shadow-2xl border border-white border-opacity-20 transition-all duration-300 ease-in-out transform hover:scale-105';
        chatWrapper.style.cssText = `
            width: 300px;
            height: 50px;
            overflow: hidden;
        `;
        
        // Create chat input
        this.chatInput = document.createElement('input');
        this.chatInput.type = 'text';
        this.chatInput.className = 'w-full h-full px-6 pr-16 bg-transparent border-none outline-none text-white placeholder-white placeholder-opacity-70';
        this.chatInput.style.fontFamily = 'Cal Sans, Inter, sans-serif';
        this.chatInput.placeholder = '';
        
        // Create send button
        const sendButton = document.createElement('button');
        sendButton.className = 'absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 hover:border-opacity-60 hover:shadow-lg hover:shadow-white/25 transition-all duration-300';
        sendButton.innerHTML = '<i class="fas fa-paper-plane text-xs"></i>';
        
        // Assemble the chat interface
        chatWrapper.appendChild(this.chatInput);
        chatWrapper.appendChild(sendButton);
        this.chatContainer.appendChild(chatWrapper);
        
        // Add to body
        document.body.appendChild(this.chatContainer);
        
        // Store wrapper reference
        this.chatWrapper = chatWrapper;
    }
    
    setupEventListeners() {
        // Hover effects
        this.chatContainer.addEventListener('mouseenter', () => {
            this.expandChat();
        });
        
        this.chatContainer.addEventListener('mouseleave', () => {
            if (!this.chatInput.matches(':focus')) {
                this.collapseChat();
            }
        });
        
        // Focus effects
        this.chatInput.addEventListener('focus', () => {
            this.expandChat();
            this.stopTypewriterEffect();
        });
        
        this.chatInput.addEventListener('blur', () => {
            if (!this.chatInput.value.trim()) {
                this.collapseChat();
                this.startTypewriterEffect();
            }
        });
        
        // Input handling
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleChatSubmit();
            }
        });
        
        // Send button click
        this.chatContainer.querySelector('button').addEventListener('click', () => {
            this.handleChatSubmit();
        });
    }
    
    expandChat() {
        if (this.isExpanded) return;
        
        this.isExpanded = true;
        this.chatWrapper.style.cssText = `
            width: 400px;
            height: 60px;
            overflow: hidden;
            transform: scale(1.05);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        `;
        
        // Add glow effect
        this.chatWrapper.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50');
    }
    
    collapseChat() {
        if (!this.isExpanded) return;
        
        this.isExpanded = false;
        this.chatWrapper.style.cssText = `
            width: 300px;
            height: 50px;
            overflow: hidden;
            transform: scale(1);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        `;
        
        // Remove glow effect
        this.chatWrapper.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50');
    }
    
    startTypewriterEffect() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        this.currentCharIndex = 0;
        this.typeNextCharacter();
    }
    
    stopTypewriterEffect() {
        if (this.typewriterInterval) {
            clearTimeout(this.typewriterInterval);
            this.typewriterInterval = null;
        }
        this.isTyping = false;
    }
    
    typeNextCharacter() {
        if (!this.isTyping) return;
        
        const currentText = this.placeholderTexts[this.currentTextIndex];
        
        if (this.currentCharIndex <= currentText.length) {
            this.chatInput.placeholder = currentText.substring(0, this.currentCharIndex);
            this.currentCharIndex++;
            
            // Variable typing speed for more natural effect
            const typingSpeed = this.currentCharIndex === currentText.length + 1 ? 2000 : Math.random() * 100 + 80;
            this.typewriterInterval = setTimeout(() => this.typeNextCharacter(), typingSpeed);
        } else {
            // Start erasing after a pause
            this.typewriterInterval = setTimeout(() => this.eraseText(), 1500);
        }
    }
    
    eraseText() {
        if (!this.isTyping) return;
        
        const currentText = this.placeholderTexts[this.currentTextIndex];
        
        if (this.currentCharIndex > 0) {
            this.currentCharIndex--;
            this.chatInput.placeholder = currentText.substring(0, this.currentCharIndex);
            this.typewriterInterval = setTimeout(() => this.eraseText(), 40);
        } else {
            // Move to next text
            this.currentTextIndex = (this.currentTextIndex + 1) % this.placeholderTexts.length;
            this.typewriterInterval = setTimeout(() => this.typeNextCharacter(), 800);
        }
    }
    
    handleChatSubmit() {
        const query = this.chatInput.value.trim();
        if (!query) return;
        
        // Here you can add logic to handle the chat query
        console.log('Chat query:', query);
        
        // Show a simple response (you can enhance this)
        this.showChatResponse(query);
        
        // Clear input
        this.chatInput.value = '';
        this.chatInput.blur();
    }
    
    showChatResponse(query) {
        // Create a temporary response bubble
        const response = document.createElement('div');
        response.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
        response.textContent = `Looking for: "${query}"`;
        
        document.body.appendChild(response);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            response.classList.add('animate-fade-out');
            setTimeout(() => {
                document.body.removeChild(response);
            }, 300);
        }, 3000);
        
        // You can add more sophisticated response logic here
        this.handleQueryNavigation(query);
    }
    
    handleQueryNavigation(query) {
        const queryLower = query.toLowerCase();
        
        // Simple navigation based on query
        if (queryLower.includes('github')) {
            window.open('https://github.com/opensocial-lk', '_blank');
        } else if (queryLower.includes('why opensocial')) {
            document.querySelector('#why-opensocial')?.scrollIntoView({ behavior: 'smooth' });
        } else if (queryLower.includes('features')) {
            document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
        } else if (queryLower.includes('contribute')) {
            document.querySelector('#contribute')?.scrollIntoView({ behavior: 'smooth' });
        } else if (queryLower.includes('how it works')) {
            document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize the animated chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnimatedChat();
});

// Add custom CSS animations
const style = document.createElement('style');
style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    @font-face {
        font-family: 'Cal Sans';
        src: url('https://cdn.jsdelivr.net/gh/calcom/font@main/CalSans-SemiBold.woff2') format('woff2');
        font-weight: 600;
        font-style: normal;
        font-display: swap;
    }
    
    @keyframes fade-out {
        from { opacity: 1; transform: translate(-50%, 0) scale(1); }
        to { opacity: 0; transform: translate(-50%, -10px) scale(0.95); }
    }
    
    .animate-fade-out {
        animation: fade-out 0.3s ease-in-out forwards;
    }
    
    #animated-chat input::placeholder {
        transition: all 0.3s ease;
        font-family: 'Cal Sans', 'Inter', sans-serif;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.7) !important;
    }
    
    #animated-chat:hover input::placeholder {
        color: rgba(255, 255, 255, 0.9) !important;
    }
    
    #animated-chat input {
        font-family: 'Cal Sans', 'Inter', sans-serif;
        font-weight: 500;
        color: white !important;
    }
    
    #animated-chat input:focus::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
    }
    
    #animated-chat button:hover {
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
        border-color: rgba(255, 255, 255, 0.6) !important;
        background-color: rgba(255, 255, 255, 0.3) !important;
        transform: translateY(-1px);
    }
    
    #animated-chat .chat-wrapper:hover {
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        background-color: rgba(0, 0, 0, 0.5);
    }
    
    .dark #animated-chat button {
        background-color: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
    }
    
    .dark #animated-chat button:hover {
        background-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }
`;
document.head.appendChild(style);
