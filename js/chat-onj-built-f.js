/**
 * OpenSocial Dynamic Chat Widget
 * Self-contained chat interface that injects itself into any page
 * No HTML modifications required - just include this script
 */

(function() {
    'use strict';

    class DynamicChatWidget {
        constructor() {
            this.chatContainer = null;
            this.chatInput = null;
            this.sendButton = null;
            this.thinkingTray = null;
            this.initiativeText = null;
            this.isExpanded = false;
            this.isTyping = false;
            this.isThinking = false;
            this.typewriterTimeout = null;
            this.currentTextIndex = 0;
            this.currentCharIndex = 0;
            
            // Chat placeholder texts with typewriter effect
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
            
            // Initialize when DOM is ready
            this.initializeWhenReady();
        }
        
        initializeWhenReady() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            } else {
                this.init();
            }
        }
        
        init() {
            this.injectStyles();
            this.createInitiativeText();
            this.createChatWidget();
            this.setupEventListeners();
            this.startTypewriterEffect();
            

        }
        
        injectStyles() {
            // Check if styles already injected
            if (document.getElementById('opensocial-chat-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'opensocial-chat-styles';
            style.textContent = `
                /* Cal Sans Font Import */
                @font-face {
                    font-family: 'Cal Sans';
                    src: url('https://cdn.jsdelivr.net/gh/calcom/font@main/CalSans-SemiBold.woff2') format('woff2');
                    font-weight: 600;
                    font-style: normal;
                    font-display: swap;
                }
                
                /* Chat Widget Styles */
                #opensocial-chat-widget {
                    position: fixed !important;
                    bottom: 1rem !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    z-index: 999999 !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    pointer-events: auto !important;
                }
                
                .opensocial-chat-container {
                    display: flex !important;
                    align-items: center !important;
                    background: rgba(0, 0, 0, 0.7) !important;
                    backdrop-filter: blur(16px) !important;
                    -webkit-backdrop-filter: blur(16px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 25px !important;
                    padding: 0.75rem 1.5rem !important;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    width: 300px !important;
                    height: 50px !important;
                    position: relative !important;
                }
                
                .opensocial-chat-container:hover {
                    transform: scale(1.05) !important;
                    background: rgba(0, 0, 0, 0.8) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
                    width: 400px !important;
                    height: 60px !important;
                }
                
                .opensocial-chat-container.focused {
                    width: 450px !important;
                    height: 65px !important;
                    transform: scale(1.08) !important;
                    background: rgba(0, 0, 0, 0.85) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.15) !important;
                }
                
                /* Thinking Tray Styles */
                .opensocial-thinking-tray {
                    position: absolute !important;
                    bottom: calc(100% + 15px) !important;
                    left: 50% !important;
                    transform: translateX(-50%) translateY(10px) !important;
                    background: rgba(0, 0, 0, 0.9) !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.3) !important;
                    border-radius: 15px !important;
                    padding: 0.75rem 1.25rem !important;
                    color: white !important;
                    font-family: 'Cal Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    font-size: 0.875rem !important;
                    font-weight: 500 !important;
                    white-space: nowrap !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    z-index: 1000000 !important;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
                }
                
                .opensocial-thinking-tray.show {
                    opacity: 1 !important;
                    transform: translateX(-50%) translateY(0) !important;
                }
                
                .opensocial-thinking-tray::after {
                    content: '' !important;
                    position: absolute !important;
                    top: 100% !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    border: 6px solid transparent !important;
                    border-top-color: rgba(0, 0, 0, 0.9) !important;
                }
                
                /* Initiative Text Styles */
                .opensocial-initiative-text {
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    color: white !important;
                    font-family: 'Cal Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    font-size: 1.25rem !important;
                    font-weight: 600 !important;
                    text-align: center !important;
                    z-index: 999998 !important;
                    opacity: 1 !important;
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    letter-spacing: 0.05em !important;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
                }
                
                .opensocial-initiative-text.fold-out {
                    opacity: 0 !important;
                    transform: translate(-50%, -50%) scaleY(0) !important;
                    transform-origin: center !important;
                }
                
                /* Thinking animation dots */
                .opensocial-thinking-dots {
                    display: inline-flex !important;
                    align-items: center !important;
                    margin-left: 0.5rem !important;
                }
                
                .opensocial-thinking-dots span {
                    width: 4px !important;
                    height: 4px !important;
                    background: rgba(255, 255, 255, 0.8) !important;
                    border-radius: 50% !important;
                    margin: 0 2px !important;
                    animation: opensocial-thinking-pulse 1.4s ease-in-out infinite !important;
                }
                
                .opensocial-thinking-dots span:nth-child(1) {
                    animation-delay: 0s !important;
                }
                
                .opensocial-thinking-dots span:nth-child(2) {
                    animation-delay: 0.2s !important;
                }
                
                .opensocial-thinking-dots span:nth-child(3) {
                    animation-delay: 0.4s !important;
                }
                
                .opensocial-chat-container:hover {
                    transform: scale(1.05) !important;
                    background: rgba(0, 0, 0, 0.8) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
                    width: 400px !important;
                    height: 60px !important;
                }
                
                .opensocial-chat-container.expanded {
                    width: 450px !important;
                    height: 65px !important;
                    transform: scale(1.08) !important;
                    background: rgba(0, 0, 0, 0.85) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.15) !important;
                }
                
                /* Thinking Tray Styles */
                .opensocial-thinking-tray {
                    position: absolute !important;
                    bottom: 100% !important;
                    left: 50% !important;
                    transform: translateX(-50%) translateY(-10px) !important;
                    background: rgba(0, 0, 0, 0.9) !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.3) !important;
                    border-radius: 15px !important;
                    padding: 0.75rem 1.25rem !important;
                    color: white !important;
                    font-family: 'Cal Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    font-size: 0.875rem !important;
                    font-weight: 500 !important;
                    white-space: nowrap !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    z-index: 1000000 !important;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
                }
                
                .opensocial-thinking-tray.show {
                    opacity: 1 !important;
                    transform: translateX(-50%) translateY(-5px) !important;
                }
                
                .opensocial-thinking-tray::after {
                    content: '' !important;
                    position: absolute !important;
                    top: 100% !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    border: 6px solid transparent !important;
                    border-top-color: rgba(0, 0, 0, 0.9) !important;
                }
                
                /* Thinking animation dots */
                .opensocial-thinking-dots {
                    display: inline-flex !important;
                    align-items: center !important;
                    margin-left: 0.5rem !important;
                }
                
                .opensocial-thinking-dots span {
                    width: 4px !important;
                    height: 4px !important;
                    background: rgba(255, 255, 255, 0.8) !important;
                    border-radius: 50% !important;
                    margin: 0 1px !important;
                    animation: opensocial-thinking-pulse 1.5s ease-in-out infinite !important;
                }
                
                .opensocial-thinking-dots span:nth-child(1) {
                    animation-delay: 0s !important;
                }
                
                .opensocial-thinking-dots span:nth-child(2) {
                    animation-delay: 0.2s !important;
                }
                
                .opensocial-thinking-dots span:nth-child(3) {
                    animation-delay: 0.4s !important;
                }
                
                .opensocial-chat-input {
                    flex: 1 !important;
                    background: transparent !important;
                    border: none !important;
                    outline: none !important;
                    color: white !important;
                    font-family: 'Cal Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    font-size: 0.875rem !important;
                    font-weight: 500 !important;
                    padding: 0 !important;
                    margin-right: 1rem !important;
                }
                
                .opensocial-chat-input::placeholder {
                    color: rgba(255, 255, 255, 0.7) !important;
                    font-family: 'Cal Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    font-weight: 600 !important;
                    transition: color 0.3s ease !important;
                }
                
                .opensocial-chat-container:hover .opensocial-chat-input::placeholder {
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                
                .opensocial-chat-input:focus::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                
                .opensocial-send-button {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 2rem !important;
                    height: 2rem !important;
                    background: rgba(255, 255, 255, 0.2) !important;
                    border: 1px solid rgba(255, 255, 255, 0.3) !important;
                    border-radius: 50% !important;
                    color: white !important;
                    cursor: pointer !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }
                
                .opensocial-send-button:hover {
                    background: rgba(255, 255, 255, 0.3) !important;
                    border-color: rgba(255, 255, 255, 0.6) !important;
                    transform: translateY(-1px) scale(1.1) !important;
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4) !important;
                }
                
                .opensocial-send-button:active {
                    transform: translateY(0) scale(1.05) !important;
                }
                
                /* Response bubble styles */
                .opensocial-response-bubble {
                    position: fixed !important;
                    bottom: 5rem !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    background: white !important;
                    color: #1f2937 !important;
                    padding: 0.75rem 1rem !important;
                    border-radius: 0.5rem !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                    z-index: 999999 !important;
                    font-family: 'Cal Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    font-size: 0.875rem !important;
                    font-weight: 500 !important;
                    opacity: 0 !important;
                    transition: opacity 0.3s ease !important;
                    pointer-events: none !important;
                    max-width: 300px !important;
                    text-align: center !important;
                }
                
                .opensocial-response-bubble.show {
                    opacity: 1 !important;
                }
                
                /* Animation keyframes */
                @keyframes opensocial-pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
                
                @keyframes opensocial-thinking-pulse {
                    0%, 80%, 100% {
                        transform: scale(0.8);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1.2);
                        opacity: 1;
                    }
                }
                
                .opensocial-typing {
                    animation: opensocial-pulse 1.5s ease-in-out infinite;
                }
                
                /* Responsive adjustments */
                @media (max-width: 640px) {
                    .opensocial-chat-container {
                        width: 280px !important;
                        padding: 0.5rem 1rem !important;
                    }
                    
                    .opensocial-chat-container:hover {
                        width: 320px !important;
                        height: 55px !important;
                    }
                    
                    .opensocial-chat-container.focused {
                        width: 340px !important;
                        height: 60px !important;
                    }
                    
                    #opensocial-chat-widget {
                        bottom: 0.5rem !important;
                    }
                    
                    .opensocial-initiative-text {
                        font-size: 1rem !important;
                        padding: 0 1rem !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .opensocial-chat-container {
                        width: 260px !important;
                    }
                    
                    .opensocial-chat-container:hover {
                        width: 300px !important;
                    }
                    
                    .opensocial-chat-container.focused {
                        width: 320px !important;
                    }
                }
                
                @media (max-width: 360px) {
                    .opensocial-chat-container {
                        width: 240px !important;
                    }
                    
                    .opensocial-chat-container:hover {
                        width: 280px !important;
                    }
                    
                    .opensocial-chat-container.focused {
                        width: 300px !important;
                    }
                }
            `;
            
            document.head.appendChild(style);
        }
        
        createInitiativeText() {
            // Create initiative text element
            this.initiativeText = document.createElement('div');
            this.initiativeText.className = 'opensocial-initiative-text';
            this.initiativeText.textContent = 'An OpenRockets Initiative.';
            
            // Add to page
            document.body.appendChild(this.initiativeText);
            
            // Auto-hide with folding animation after 2 seconds
            setTimeout(() => {
                this.initiativeText.classList.add('fold-out');
                setTimeout(() => {
                    if (this.initiativeText && this.initiativeText.parentNode) {
                        this.initiativeText.parentNode.removeChild(this.initiativeText);
                    }
                }, 600);
            }, 2000);
        }
        
        createChatWidget() {
            // Remove existing widget if present
            const existingWidget = document.getElementById('opensocial-chat-widget');
            if (existingWidget) {
                existingWidget.remove();
            }
            
            // Create main container
            this.chatContainer = document.createElement('div');
            this.chatContainer.id = 'opensocial-chat-widget';
            
            // Create chat wrapper
            const chatWrapper = document.createElement('div');
            chatWrapper.className = 'opensocial-chat-container';
            
            // Create input field
            this.chatInput = document.createElement('input');
            this.chatInput.type = 'text';
            this.chatInput.className = 'opensocial-chat-input';
            this.chatInput.placeholder = '';
            this.chatInput.autocomplete = 'off';
            this.chatInput.spellcheck = false;
            
            // Create send button
            this.sendButton = document.createElement('button');
            this.sendButton.className = 'opensocial-send-button';
            this.sendButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-send-fill" viewBox="0 0 16 16"><path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/></svg>';
            this.sendButton.type = 'button';
            this.sendButton.setAttribute('aria-label', 'Send message');
            
            // Assemble the widget
            chatWrapper.appendChild(this.chatInput);
            chatWrapper.appendChild(this.sendButton);
            this.chatContainer.appendChild(chatWrapper);
            
            // Inject into page
            document.body.appendChild(this.chatContainer);
        }
        
        setupEventListeners() {
            // Input focus events
            this.chatInput.addEventListener('focus', () => {
                this.stopTypewriterEffect();
                this.expandChat();
            });
            
            this.chatInput.addEventListener('blur', () => {
                if (!this.chatInput.value.trim()) {
                    this.collapseChat();
                    setTimeout(() => this.startTypewriterEffect(), 500);
                }
            });
            
            // Container hover events
            this.chatContainer.addEventListener('mouseenter', () => {
                this.expandChat();
            });
            
            this.chatContainer.addEventListener('mouseleave', () => {
                if (!this.chatInput.matches(':focus')) {
                    this.collapseChat();
                }
            });
            
            // Send button click
            this.sendButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSendMessage();
            });
            
            // Enter key press
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });
            
            // Prevent form submission if inside a form
            this.chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.stopPropagation();
                }
            });
        }
        
        expandChat() {
            this.isExpanded = true;
            const container = this.chatContainer.querySelector('.opensocial-chat-container');
            container.style.width = '400px';
            container.style.height = '60px';
        }
        
        collapseChat() {
            this.isExpanded = false;
            const container = this.chatContainer.querySelector('.opensocial-chat-container');
            container.style.width = '300px';
            container.style.height = '50px';
        }
        
        startTypewriterEffect() {
            if (this.isTyping) return;
            
            this.isTyping = true;
            this.currentCharIndex = 0;
            this.typeNextCharacter();
        }
        
        stopTypewriterEffect() {
            this.isTyping = false;
            if (this.typewriterTimeout) {
                clearTimeout(this.typewriterTimeout);
                this.typewriterTimeout = null;
            }
        }
        
        typeNextCharacter() {
            if (!this.isTyping) return;
            
            const currentText = this.placeholderTexts[this.currentTextIndex];
            
            if (this.currentCharIndex <= currentText.length) {
                this.chatInput.placeholder = currentText.substring(0, this.currentCharIndex);
                this.currentCharIndex++;
                
                // Variable typing speed for natural effect
                const typingSpeed = this.currentCharIndex === currentText.length + 1 ? 2000 : Math.random() * 80 + 60;
                this.typewriterTimeout = setTimeout(() => this.typeNextCharacter(), typingSpeed);
            } else {
                // Start erasing after pause
                this.typewriterTimeout = setTimeout(() => this.eraseText(), 1500);
            }
        }
        
        eraseText() {
            if (!this.isTyping) return;
            
            const currentText = this.placeholderTexts[this.currentTextIndex];
            
            if (this.currentCharIndex > 0) {
                this.currentCharIndex--;
                this.chatInput.placeholder = currentText.substring(0, this.currentCharIndex);
                this.typewriterTimeout = setTimeout(() => this.eraseText(), 30);
            } else {
                // Move to next text
                this.currentTextIndex = (this.currentTextIndex + 1) % this.placeholderTexts.length;
                this.typewriterTimeout = setTimeout(() => {
                    this.currentCharIndex = 0;
                    this.typeNextCharacter();
                }, 800);
            }
        }
        
        handleSendMessage() {
            const message = this.chatInput.value.trim();
            if (!message) return;
            
            // Clear input
            this.chatInput.value = '';
            
            // Process the message
            this.processMessage(message);
            
            // Blur input to trigger collapse
            this.chatInput.blur();
        }
        
        processMessage(message) {
            const lowerMessage = message.toLowerCase();
            
            // Smart navigation based on message content
            if (lowerMessage.includes('github') || lowerMessage.includes('repository') || lowerMessage.includes('repo')) {
                this.showResponse('Opening GitHub repository...');
                setTimeout(() => {
                    window.open('https://github.com/opensocial-lk', '_blank');
                }, 1000);
            } else if (lowerMessage.includes('why') && lowerMessage.includes('opensocial')) {
                this.showResponse('Scrolling to "Why OpenSocial" section...');
                this.scrollToSection('#why-opensocial');
            } else if (lowerMessage.includes('how') || lowerMessage.includes('works')) {
                this.showResponse('Showing how it works...');
                this.scrollToSection('#how-it-works');
            } else if (lowerMessage.includes('features')) {
                this.showResponse('Scrolling to features...');
                this.scrollToSection('#features');
            } else if (lowerMessage.includes('contribute') || lowerMessage.includes('start building')) {
                this.showResponse('Taking you to contribution section...');
                this.scrollToSection('#contribute');
            } else if (lowerMessage.includes('openrockets') || lowerMessage.includes('foundation')) {
                this.showResponse('OpenRockets is a Sri Lankan tech foundation empowering youth through open-source innovation!');
            } else if (lowerMessage.includes('winners') || lowerMessage.includes('receive') || lowerMessage.includes('prize')) {
                this.showResponse('Top 3 contributors get custom domains, recognition, and project ownership!');
            } else {
                this.showResponse(`Thanks for your question: "${message}". Check out our sections above for more info!`);
            }
        }
        
        scrollToSection(selector) {
            setTimeout(() => {
                const section = document.querySelector(selector);
                if (section) {
                    section.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 500);
        }
        
        showResponse(message) {
            // Remove existing response bubble
            const existingBubble = document.querySelector('.opensocial-response-bubble');
            if (existingBubble) {
                existingBubble.remove();
            }
            
            // Create response bubble
            const bubble = document.createElement('div');
            bubble.className = 'opensocial-response-bubble';
            bubble.textContent = message;
            
            // Add to page
            document.body.appendChild(bubble);
            
            // Show with animation
            setTimeout(() => bubble.classList.add('show'), 100);
            
            // Auto-remove after 4 seconds
            setTimeout(() => {
                bubble.classList.remove('show');
                setTimeout(() => {
                    if (bubble.parentNode) {
                        bubble.parentNode.removeChild(bubble);
                    }
                }, 300);
            }, 4000);
        }
        
        // Public method to destroy the widget
        destroy() {
            this.stopTypewriterEffect();
            
            if (this.chatContainer && this.chatContainer.parentNode) {
                this.chatContainer.parentNode.removeChild(this.chatContainer);
            }
            
            const styles = document.getElementById('opensocial-chat-styles');
            if (styles && styles.parentNode) {
                styles.parentNode.removeChild(styles);
            }
        }
    }
    
    // Auto-initialize the chat widget
    window.OpenSocialChat = new DynamicChatWidget();
    
    // Expose destroy method globally for cleanup if needed
    window.destroyOpenSocialChat = () => {
        if (window.OpenSocialChat) {
            window.OpenSocialChat.destroy();
            window.OpenSocialChat = null;
        }
    };
    
})();
