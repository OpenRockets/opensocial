/**
 * OpenSocial Dynamic Chat Widget with Gemini AI Integration
 * Self-contained chat interface that injects itself into any page
 * No HTML modifications required - just include this script
 */

// Context information for AI responses
var information = "📘 OpenRockets OpenSocial – Community Contribution InitiativeOverview: OpenSocial is an open-source social media platform initiative by the OpenRockets Software Foundation (Sri Lanka). It welcomes developers, freelancers, students, and enthusiasts across Sri Lanka to collaboratively build a new social platform through GitHub.How It Works:Contributors work together via the GitHub repository: github.com/OpenRockets/opensocial Once 100 contributors are reached, the competition phase closes—regardless of project completion status.A panel will then select 3 top contributors based on the value and impact of their contributions.Rewards for Winners:Full ownership of the project repository.Custom domain name of your choice (minimum 5 letters).Media recognition through a national news platform.Why Join: This project is not just coding—it's a Sri Lankan milestone in:Open source collaborationProject-based learningGamified contribution cultureContact:📞 +94 711 112 207📧 official@openrockets.me📱 Social Media:Instagram: instagram.com/openrocketsX (Twitter): x.com/openrockets.";

// Gemini AI Configuration
const GEMINI_CONFIG = {
    apiKey: 'AIzaSyBWYYuYVpPX_5pKnTtGA2jqRKAQAtb0feY',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    context: information,
    systemPrompt: `You are an AI assistant for OpenSocial, Sri Lanka's first open-source social media platform by OpenRockets. 

Context Information: ${information}

Instructions:
- Only provide answers based on the context information provided above
- Be helpful, friendly, and encouraging about contributing to OpenSocial
- Keep responses concise and engaging (max 200 characters)
- If asked about something not in the context, politely redirect to the available information
- Use emojis sparingly but appropriately
- Focus on encouraging participation and contributions
- Always mention relevant details from the context when answering
- When mentioning URLs, write them as complete clickable links (e.g., https://github.com/OpenRockets/opensocial)
- Use **bold** for important words or phrases
- Use *italic* for emphasis
- Format contact information clearly with proper links
- Make GitHub repositories, social media links, and contact details clickable`
};

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
            console.log('Chat widget: Starting initialization...');
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            } else {
                this.init();
            }
        }
        
        init() {
            console.log('Chat widget: DOM ready, initializing...');
            this.injectStyles();
            this.createInitiativeText();
            this.createChatWidget();
            this.setupEventListeners();
            this.startTypewriterEffect();
            console.log('Chat widget: Initialization complete!');
        }
        
        // Gemini AI Integration
        async callGeminiAPI(message) {
            try {
                const requestBody = {
                    contents: [{
                        parts: [{
                            text: `${GEMINI_CONFIG.systemPrompt}

User Question: ${message}

Please provide a helpful response based only on the context information provided.`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 200,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                };

                const response = await fetch(`${GEMINI_CONFIG.apiUrl}?key=${GEMINI_CONFIG.apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                    const rawResponse = data.candidates[0].content.parts[0].text;
                    return this.formatResponse(rawResponse);
                } else {
                    throw new Error('Invalid response format from Gemini API');
                }
            } catch (error) {
                console.error('Gemini API Error:', error);
                return this.getFallbackResponse(message);
            }
        }

        // Format response with HTML links and text styling
        formatResponse(text) {
            if (!text) return text;
            
            // First convert markdown-style formatting to HTML (including markdown links)
            let formattedText = this.convertMarkdownToHtml(text);
            
            // Then convert any remaining plain URLs to clickable links
            formattedText = this.convertUrlsToLinks(formattedText);
            
            return formattedText;
        }
        
        // Convert URLs to HTML links with proper display text
        convertUrlsToLinks(text) {
            // Enhanced URL regex to catch various URL formats, but not inside HTML tags
            const urlRegex = /(?![^<]*>)(https?:\/\/[^\s<>]+|www\.[^\s<>]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<>]*)?|github\.com\/[^\s<>]+|instagram\.com\/[^\s<>]+|x\.com\/[^\s<>]+|twitter\.com\/[^\s<>]+)(?![^<]*<\/a>)/gi;
            
            return text.replace(urlRegex, (url) => {
                let fullUrl = url;
                let displayText = '';
                
                // Add https:// if missing
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    fullUrl = 'https://' + url;
                }
                
                // Clean up URL (remove trailing punctuation)
                const cleanUrl = fullUrl.replace(/[.,;:]$/, '');
                
                // Generate appropriate display text based on URL
                if (cleanUrl.includes('github.com/OpenRockets/opensocial')) {
                    displayText = 'GitHub';
                } else if (cleanUrl.includes('github.com')) {
                    displayText = 'GitHub';
                } else if (cleanUrl.includes('instagram.com/openrockets')) {
                    displayText = 'Instagram';
                } else if (cleanUrl.includes('instagram.com')) {
                    displayText = 'Instagram';
                } else if (cleanUrl.includes('x.com/openrockets') || cleanUrl.includes('twitter.com/openrockets')) {
                    displayText = 'X (Twitter)';
                } else if (cleanUrl.includes('x.com') || cleanUrl.includes('twitter.com')) {
                    displayText = 'X (Twitter)';
                } else if (cleanUrl.includes('openrockets.me')) {
                    displayText = 'OpenRockets';
                } else {
                    // For other URLs, use domain name as display text
                    try {
                        const urlObj = new URL(cleanUrl);
                        const domain = urlObj.hostname.replace('www.', '');
                        const domainParts = domain.split('.');
                        const mainDomain = domainParts.length > 1 ? domainParts[0] : domain;
                        displayText = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
                    } catch (e) {
                        // Fallback if URL parsing fails
                        const domain = cleanUrl.replace(/https?:\/\//, '').replace(/www\./, '').split('/')[0];
                        displayText = domain.charAt(0).toUpperCase() + domain.slice(1);
                    }
                }
                
                return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline; font-weight: 500;">${displayText}</a>`;
            });
        }
        
        // Convert markdown-style formatting to HTML
        convertMarkdownToHtml(text) {
            // Markdown links: [text](url) -> <a href="url">text</a>
            text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
                // Clean up URL (remove trailing punctuation)
                const cleanUrl = url.replace(/[.,;:]$/, '');
                
                // Determine display text based on URL or use provided text
                let displayText = linkText;
                
                if (cleanUrl.includes('github.com/OpenRockets/opensocial')) {
                    displayText = 'GitHub';
                } else if (cleanUrl.includes('github.com')) {
                    displayText = 'GitHub';
                } else if (cleanUrl.includes('instagram.com/openrockets')) {
                    displayText = 'Instagram';
                } else if (cleanUrl.includes('instagram.com')) {
                    displayText = 'Instagram';
                } else if (cleanUrl.includes('x.com/openrockets') || cleanUrl.includes('twitter.com/openrockets')) {
                    displayText = 'X (Twitter)';
                } else if (cleanUrl.includes('x.com') || cleanUrl.includes('twitter.com')) {
                    displayText = 'X (Twitter)';
                } else if (cleanUrl.includes('openrockets.me')) {
                    displayText = 'OpenRockets';
                }
                
                return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline; font-weight: 500;">${displayText}</a>`;
            });
            
            // Bold text: **text** -> <strong>text</strong>
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #fbbf24;">$1</strong>');
            
            // Italic text: *text* -> <em>text</em>
            text = text.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #a78bfa;">$1</em>');
            
            // Phone numbers: make them clickable
            text = text.replace(/(\+\d{1,3}\s?\d{3}\s?\d{3}\s?\d{3})/g, '<a href="tel:$1" style="color: #34d399; text-decoration: underline;">$1</a>');
            
            // Email addresses: make them clickable
            text = text.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" style="color: #34d399; text-decoration: underline;">$1</a>');
            
            return text;
        }

        getFallbackResponse(message) {
            const lowerMessage = message.toLowerCase();
            
            // Enhanced navigation handling
            this.handleQueryNavigation(message);
            
            // Fallback responses based on context information with HTML formatting
            if (lowerMessage.includes('github') || lowerMessage.includes('repository') || lowerMessage.includes('repo')) {
                return `Check out our **GitHub repository** at <a href="https://github.com/OpenRockets/opensocial" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline; font-weight: 500;">github.com/OpenRockets/opensocial</a> for the latest code! 🚀`;
            } else if (lowerMessage.includes('why') && lowerMessage.includes('opensocial')) {
                return "**OpenSocial** is *Sri Lanka's first* open-source social media platform! Your contribution could **change the game**. 💻✨";
            } else if (lowerMessage.includes('openrockets') || lowerMessage.includes('foundation')) {
                return "**OpenRockets** is building the future together! Follow us at <a href=\"https://instagram.com/openrockets\" target=\"_blank\" style=\"color: #60a5fa; text-decoration: underline;\">instagram.com/openrockets</a> 🇱🇰";
            } else if (lowerMessage.includes('winners') || lowerMessage.includes('receive') || lowerMessage.includes('prize')) {
                return "Top contributors get **real recognition**, *custom domain names*, and **media features**! Way beyond just 'thanks.' 🎯💥";
            } else if (lowerMessage.includes('contribute') || lowerMessage.includes('start')) {
                return "Your **first GitHub contribution** could *change the game*! Whether you're in school, uni, or just starting out. 🚀";
            } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
                return `**Contact us:** <a href="tel:+94711112207" style="color: #34d399; text-decoration: underline;">+94 711 112 207</a> or <a href="mailto:official@openrockets.me" style="color: #34d399; text-decoration: underline;">official@openrockets.me</a> 📞📧`;
            } else {
                return "This is your **chance** to be part of *tech history* in **Sri Lanka**! Check the sections above for more info. 💚";
            }
        }
        
        // Enhanced navigation functionality from app_temp.js
        handleQueryNavigation(query) {
            const queryLower = query.toLowerCase();
            
            // Navigate to relevant sections based on query
            if (queryLower.includes('github')) {
                setTimeout(() => {
                    window.open('https://github.com/OpenRockets/opensocial', '_blank');
                }, 1000);
            } else if (queryLower.includes('why opensocial')) {
                setTimeout(() => {
                    document.querySelector('#why-opensocial')?.scrollIntoView({ behavior: 'smooth' });
                }, 1000);
            } else if (queryLower.includes('features')) {
                setTimeout(() => {
                    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
                }, 1000);
            } else if (queryLower.includes('contribute')) {
                setTimeout(() => {
                    document.querySelector('#contribute')?.scrollIntoView({ behavior: 'smooth' });
                }, 1000);
            } else if (queryLower.includes('how it works')) {
                setTimeout(() => {
                    document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }, 1000);
            } else if (queryLower.includes('instagram') || queryLower.includes('social')) {
                setTimeout(() => {
                    window.open('https://instagram.com/openrockets', '_blank');
                }, 1000);
            } else if (queryLower.includes('twitter') || queryLower.includes('x.com')) {
                setTimeout(() => {
                    window.open('https://x.com/openrockets', '_blank');
                }, 1000);
            }
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
                    bottom: 2rem !important;
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
                    margin-bottom:2rem;
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
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    background: rgba(0, 0, 0, 0.85) !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    z-index: 10000000 !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                
                .opensocial-thinking-tray.show {
                    opacity: 1 !important;
                    pointer-events: auto !important;
                }
                
                /* The actual response box */
                .opensocial-response-box {
                    background: linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 20px !important;
                    padding: 2rem 2.5rem !important;
                    color: white !important;
                    font-family: 'Cal Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    font-size: 1.1rem !important;
                    font-weight: 500 !important;
                    line-height: 1.7 !important;
                    max-width: 600px !important;
                    min-width: 400px !important;
                    max-height: 80vh !important;
                    overflow-y: auto !important;
                    box-shadow: 
                        0 25px 50px -12px rgba(0, 0, 0, 0.8), 
                        0 0 0 1px rgba(255, 255, 255, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
                    text-align: left !important;
                    position: relative !important;
                }
                
                /* Close button for the overlay */
                .opensocial-close-btn {
                    position: absolute !important;
                    top: 1rem !important;
                    right: 1rem !important;
                    width: 32px !important;
                    height: 32px !important;
                    border: none !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-radius: 50% !important;
                    color: rgba(255, 255, 255, 0.8) !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    transition: all 0.3s ease !important;
                    font-size: 18px !important;
                    line-height: 1 !important;
                }
                
                .opensocial-close-btn:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    transform: scale(1.1) !important;
                }
                
                /* Thinking dots container for the overlay */
                .opensocial-thinking-content {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    color: white !important;
                    font-family: 'Cal Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    font-size: 1.2rem !important;
                    font-weight: 500 !important;
                }
                
                .opensocial-thinking-tray.show {
                    opacity: 1 !important;
                    pointer-events: auto !important;
                }
                
                /* Responsive response box adjustments */
                @media (max-width: 640px) {
                    .opensocial-response-box {
                        max-width: 90vw !important;
                        min-width: 320px !important;
                        padding: 1.5rem 1.75rem !important;
                        font-size: 1rem !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .opensocial-response-box {
                        max-width: 95vw !important;
                        min-width: 280px !important;
                        padding: 1.25rem 1.5rem !important;
                        font-size: 0.95rem !important;
                    }
                }
                
                @media (max-width: 360px) {
                    .opensocial-response-box {
                        max-width: 98vw !important;
                        min-width: 260px !important;
                        padding: 1rem 1.25rem !important;
                        font-size: 0.9rem !important;
                    }
                }
                
                .opensocial-thinking-tray.show {
                    opacity: 1 !important;
                    pointer-events: auto !important;
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
                    transition:100ms;
                    letter-spacing: 0.05em !important;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
                }
                
                .opensocial-initiative-text .initiative-content {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 0.5rem !important;
                }
                
                .opensocial-initiative-text .initiative-logo {
                    height: 10rem !important;
                    width: 10rem  !important;
                    object-fit: contain !important;
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
                    min-width: 2rem !important;
                    min-height: 2rem !important;
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
                
                /* Enhanced animations from app_temp.js */
                @keyframes opensocial-fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes opensocial-fade-out {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                }
                
                @keyframes opensocial-scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .opensocial-animate-in {
                    animation: opensocial-scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .opensocial-animate-out {
                    animation: opensocial-fade-out 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
                    
                    .opensocial-initiative-text .initiative-logo {
                        height: 1.5rem !important;
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
            this.initiativeText.innerHTML = `
                <div class="initiative-content">
                    <img src="assets/temporary-assets/OPENROCKETS-f-edu.png" 
                         class="initiative-logo" 
                         alt="OpenRockets" 
                         onload="this.style.opacity='1'" 
                         style="opacity:0; transition: opacity 0.3s ease;">
                </div>
            `;
            
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
            console.log('Creating chat widget...');
            
            // Remove existing widget if present
            const existingWidget = document.getElementById('opensocial-chat-widget');
            if (existingWidget) {
                existingWidget.remove();
                console.log('Removed existing widget');
            }
            
            // Create main container
            this.chatContainer = document.createElement('div');
            this.chatContainer.id = 'opensocial-chat-widget';
            console.log('Created main container:', this.chatContainer);
            
            // Create thinking tray overlay
            this.thinkingTray = document.createElement('div');
            this.thinkingTray.className = 'opensocial-thinking-tray';
            this.thinkingTray.innerHTML = `
                <div class="opensocial-thinking-content">
                    Thinking
                    <div class="opensocial-thinking-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            console.log('Created thinking tray overlay');
            
            // Create chat wrapper
            const chatWrapper = document.createElement('div');
            chatWrapper.className = 'opensocial-chat-container';
            console.log('Created chat wrapper');
            
            // Create input field
            this.chatInput = document.createElement('input');
            this.chatInput.type = 'text';
            this.chatInput.className = 'opensocial-chat-input';
            this.chatInput.placeholder = '';
            this.chatInput.autocomplete = 'off';
            this.chatInput.spellcheck = false;
            console.log('Created input field');
            
            // Create send button
            this.sendButton = document.createElement('button');
            this.sendButton.className = 'opensocial-send-button';
            this.sendButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-send-fill" viewBox="0 0 16 16"><path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/></svg>';
            this.sendButton.type = 'button';
            this.sendButton.setAttribute('aria-label', 'Send message');
            console.log('Created send button');
            
            // Assemble the widget (thinking tray is separate overlay)
            chatWrapper.appendChild(this.chatInput);
            chatWrapper.appendChild(this.sendButton);
            this.chatContainer.appendChild(chatWrapper);
            console.log('Assembled widget components');
            
            // Inject into page
            document.body.appendChild(this.chatContainer);
            document.body.appendChild(this.thinkingTray); // Add thinking tray as separate overlay
            console.log('Chat widget injected into page! Container:', this.chatContainer);
            
            // Verify it was added
            const addedWidget = document.getElementById('opensocial-chat-widget');
            if (addedWidget) {
                console.log('✅ Widget successfully added to DOM!');
            } else {
                console.log('❌ Widget NOT found in DOM after injection!');
            }
        }
        
        setupEventListeners() {
            const chatWrapper = this.chatContainer.querySelector('.opensocial-chat-container');
            
            // Input focus events
            this.chatInput.addEventListener('focus', () => {
                this.stopTypewriterEffect();
                this.expandChat();
                chatWrapper.classList.add('focused');
            });
            
            this.chatInput.addEventListener('blur', () => {
                chatWrapper.classList.remove('focused');
                if (!this.chatInput.value.trim()) {
                    this.collapseChat();
                    setTimeout(() => this.startTypewriterEffect(), 500);
                }
            });
            
            // Container hover events
            this.chatContainer.addEventListener('mouseenter', () => {
                if (!this.isThinking) {
                    this.expandChat();
                }
            });
            
            this.chatContainer.addEventListener('mouseleave', () => {
                if (!this.chatInput.matches(':focus') && !this.isThinking) {
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
            
            // Touch events for mobile responsiveness
            this.chatContainer.addEventListener('touchstart', () => {
                this.expandChat();
            }, { passive: true });
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
        
        showThinking() {
            this.isThinking = true;
            this.thinkingTray.innerHTML = `
                <div class="opensocial-thinking-content">
                    Thinking
                    <div class="opensocial-thinking-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            this.thinkingTray.classList.add('show');
        }
        
        hideThinking() {
            this.isThinking = false;
            
            // Add exit animation
            const responseBox = this.thinkingTray.querySelector('.opensocial-response-box');
            if (responseBox) {
                responseBox.classList.add('opensocial-animate-out');
                setTimeout(() => {
                    this.thinkingTray.classList.remove('show');
                }, 300);
            } else {
                this.thinkingTray.classList.remove('show');
            }
        }
        
        showThinkingResponse(message) {
            this.isThinking = true;
            
            // Show quick notification for navigation actions
            this.showQuickNotification(message);
            
            // Create the response box with close button
            this.thinkingTray.innerHTML = `
                <div class="opensocial-response-box opensocial-animate-in">
                    <button class="opensocial-close-btn" onclick="window.OpenSocialChat.hideThinking()">×</button>
                    <div>${message}</div>
                </div>
            `;
            this.thinkingTray.classList.add('show');
            
            // Add click outside to close
            this.thinkingTray.addEventListener('click', (e) => {
                if (e.target === this.thinkingTray) {
                    this.hideThinking();
                }
            });
        }
        
        // Quick notification system from app_temp.js
        showQuickNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'opensocial-quick-notification';
            notification.style.cssText = `
                position: fixed !important;
                bottom: 8rem !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                background: rgba(99, 102, 241, 0.95) !important;
                color: white !important;
                padding: 0.75rem 1.5rem !important;
                border-radius: 10px !important;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
                z-index: 9999999 !important;
                font-family: 'Cal Sans', 'Inter', sans-serif !important;
                font-size: 0.875rem !important;
                font-weight: 500 !important;
                opacity: 0 !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                pointer-events: none !important;
                max-width: 300px !important;
                text-align: center !important;
            `;
            
            // Set notification text based on message content
            const lowerMessage = message.toLowerCase();
            if (lowerMessage.includes('github')) {
                notification.textContent = '🚀 Opening GitHub repository...';
            } else if (lowerMessage.includes('scroll') || lowerMessage.includes('section')) {
                notification.textContent = '📍 Navigating to section...';
            } else {
                notification.textContent = '💬 Response ready!';
            }
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(-50%) translateY(-5px)';
            }, 100);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(-50%) translateY(5px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 3000);
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
        
        async handleSendMessage() {
            const message = this.chatInput.value.trim();
            if (!message) return;
            
            // Show thinking animation
            this.showThinking();
            
            // Clear input
            this.chatInput.value = '';
            
            try {
                // Call Gemini API for intelligent response
                const aiResponse = await this.callGeminiAPI(message);
                this.showThinkingResponse(aiResponse);
                this.chatInput.blur();
            } catch (error) {
                console.error('Error getting AI response:', error);
                // Fall back to basic response
                this.processMessageFallback(message);
                this.chatInput.blur();
            }
        }
        
        processMessageFallback(message) {
            const response = this.getFallbackResponse(message);
            const formattedResponse = this.formatResponse(response);
            this.showThinkingResponse(formattedResponse);
        }
        
        // Public method to destroy the widget
        destroy() {
            this.stopTypewriterEffect();
            
            // Remove main chat container
            if (this.chatContainer && this.chatContainer.parentNode) {
                this.chatContainer.parentNode.removeChild(this.chatContainer);
            }
            
            // Remove thinking tray overlay
            if (this.thinkingTray && this.thinkingTray.parentNode) {
                this.thinkingTray.parentNode.removeChild(this.thinkingTray);
            }
            
            // Remove initiative text if still present
            if (this.initiativeText && this.initiativeText.parentNode) {
                this.initiativeText.parentNode.removeChild(this.initiativeText);
            }
            
            // Remove injected styles
            const styles = document.getElementById('opensocial-chat-styles');
            if (styles && styles.parentNode) {
                styles.parentNode.removeChild(styles);
            }
            
            // Remove any quick notifications
            const notifications = document.querySelectorAll('.opensocial-quick-notification');
            notifications.forEach(notification => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            });
            
            // Clear any running timeouts
            if (this.typewriterTimeout) {
                clearTimeout(this.typewriterTimeout);
                this.typewriterTimeout = null;
            }
        }
    }
    
    // Auto-initialize the chat widget
    console.log('OpenSocial Chat Widget script loaded!');
    window.OpenSocialChat = new DynamicChatWidget();
    
    // Expose destroy method globally for cleanup if needed
    window.destroyOpenSocialChat = () => {
        if (window.OpenSocialChat) {
            window.OpenSocialChat.destroy();
            window.OpenSocialChat = null;
        }
    };
    
})();

console.log('OpenSocial Chat Widget script execution complete!');
