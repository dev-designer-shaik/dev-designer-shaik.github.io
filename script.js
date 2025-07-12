/**
 * DesignerShaik Documentation - Enhanced Interactive Features
 * Handles theme switching, navigation, Mermaid diagrams, and responsive behavior
 */

// ===== GLOBAL VARIABLES =====
let currentTheme = 'light';
let mermaidInitialized = false;
let isNavCollapsed = false;
let isMobile = false;

// ===== THEME MANAGEMENT =====
function initializeTheme() {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    applyTheme(currentTheme);
    updateThemeToggleIcon();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            currentTheme = e.matches ? 'dark' : 'light';
            applyTheme(currentTheme);
            updateThemeToggleIcon();
            reinitializeMermaid();
        }
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
    }
}

function updateThemeToggleIcon() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', `Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} theme`);
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    updateThemeToggleIcon();
    localStorage.setItem('theme', newTheme);
    
    // Reinitialize Mermaid with new theme
    setTimeout(() => {
        reinitializeMermaid();
    }, 100);
}

// ===== MERMAID DIAGRAM MANAGEMENT =====
function initMermaid() {
    if (typeof mermaid === 'undefined') {
        console.warn('Mermaid library not loaded');
        return;
    }

    try {
        // Configure Mermaid with theme-aware settings
        const config = {
            startOnLoad: false,
            theme: currentTheme === 'dark' ? 'dark' : 'default',
            themeVariables: {
                primaryColor: currentTheme === 'dark' ? '#60a5fa' : '#3b82f6',
                primaryTextColor: currentTheme === 'dark' ? '#f1f5f9' : '#1e293b',
                primaryBorderColor: currentTheme === 'dark' ? '#475569' : '#cbd5e1',
                lineColor: currentTheme === 'dark' ? '#94a3b8' : '#64748b',
                secondaryColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                tertiaryColor: currentTheme === 'dark' ? '#334155' : '#e2e8f0',
                background: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
                mainBkg: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
                secondBkg: currentTheme === 'dark' ? '#334155' : '#e2e8f0',
                tertiaryBkg: currentTheme === 'dark' ? '#475569' : '#cbd5e1'
            },
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            },
            sequence: {
                useMaxWidth: true,
                wrap: true
            },
            gantt: {
                useMaxWidth: true
            },
            journey: {
                useMaxWidth: true
            },
            timeline: {
                useMaxWidth: true
            },
            gitgraph: {
                useMaxWidth: true
            },
            c4: {
                useMaxWidth: true
            },
            sankey: {
                useMaxWidth: true
            },
            xyChart: {
                useMaxWidth: true
            },
            packet: {
                useMaxWidth: true
            },
            securityLevel: 'loose',
            deterministicIds: true,
            deterministicIDSeed: 'designershaik-docs'
        };

        mermaid.initialize(config);
        mermaidInitialized = true;
        console.log('Mermaid initialized successfully');
        renderAllMermaidDiagrams();
    } catch (error) {
        console.error('Failed to initialize Mermaid:', error);
    }
}

async function renderMermaidDiagram(element) {
    if (!mermaidInitialized || typeof mermaid === 'undefined') {
        console.warn('Mermaid not initialized');
        return;
    }

    try {
        // Get the diagram text content
        let diagramText = element.textContent.trim();
        
        // Skip if already processed (contains SVG)
        if (element.innerHTML.includes('<svg') || element.getAttribute('data-processed') === 'true') {
            return;
        }
        
        // Skip if no content
        if (!diagramText || diagramText.length < 10) {
            console.warn("Empty or too short diagram text found");
            return;
        }

        // Store original text content if not already stored
        if (!element.dataset.originalContent) {
            element.dataset.originalContent = diagramText;
        }
        
        // Generate unique ID for the diagram
        const diagramId = element.id || `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(diagramId, diagramText);
        element.innerHTML = svg;
        element.setAttribute('data-processed', 'true');
        
        // Add responsive behavior
        const svgElement = element.querySelector('svg');
        if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
        }
        
        console.log(`Successfully rendered diagram: ${diagramId}`);
        
    } catch (error) {
        console.error('Failed to render Mermaid diagram:', error);
        element.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--error-color); border: 1px solid var(--error-color); border-radius: 8px; background-color: var(--bg-tertiary);">
                <p><strong>Diagram Rendering Error</strong></p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Unable to render this diagram. Please check the syntax.</p>
            </div>
        `;
    }
}

async function renderAllMermaidDiagrams() {
    const diagrams = document.querySelectorAll('.mermaid');
    console.log(`Found ${diagrams.length} Mermaid diagrams to render`);
    
    for (const diagram of diagrams) {
        await renderMermaidDiagram(diagram);
        // Small delay between diagrams to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('All Mermaid diagrams processed');
}

function reinitializeMermaid() {
    if (typeof mermaid === 'undefined') {
        console.warn('Mermaid library not available for reinitialization');
        return;
    }

    try {
        console.log('Reinitializing Mermaid...');
        
        // Reset Mermaid
        mermaidInitialized = false;
        
        // Clear all existing diagrams and restore original content
        const diagrams = document.querySelectorAll('.mermaid');
        diagrams.forEach(diagram => {
            if (diagram.dataset.originalContent) {
                diagram.innerHTML = diagram.dataset.originalContent;
                diagram.removeAttribute('data-processed');
            }
        });
        
        // Reinitialize with new theme
        setTimeout(() => {
            initMermaid();
        }, 100);
        
    } catch (error) {
        console.error('Failed to reinitialize Mermaid:', error);
    }
}

// ===== NAVIGATION MANAGEMENT =====
function initializeNavigation() {
    const navCollapseBtn = document.getElementById('navCollapseBtn');
    const sidebarNav = document.getElementById('sidebarNav');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    // Load saved navigation state
    const savedNavState = localStorage.getItem('navCollapsed');
    isNavCollapsed = savedNavState === 'true';
    
    if (isNavCollapsed && sidebarNav) {
        sidebarNav.classList.add('collapsed');
    }
    
    // Navigation collapse/expand
    if (navCollapseBtn && sidebarNav) {
        navCollapseBtn.addEventListener('click', () => {
            isNavCollapsed = !isNavCollapsed;
            sidebarNav.classList.toggle('collapsed', isNavCollapsed);
            localStorage.setItem('navCollapsed', isNavCollapsed.toString());
        });
    }
    
    // Mobile sidebar toggle
    if (sidebarToggle && sidebarNav) {
        sidebarToggle.addEventListener('click', () => {
            sidebarNav.classList.toggle('mobile-open');
        });
    }
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
        if (isMobile && sidebarNav && !sidebarNav.contains(e.target) && !sidebarToggle?.contains(e.target)) {
            sidebarNav.classList.remove('mobile-open');
        }
    });
    
    // Handle navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
            
            // Close mobile nav after clicking a link
            if (isMobile && sidebarNav) {
                sidebarNav.classList.remove('mobile-open');
            }
        });
    });
    
    // Highlight current section in navigation
    updateActiveNavigation();
}

function updateActiveNavigation() {
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -70% 0px'
    });
    
    sections.forEach(section => observer.observe(section));
}

// ===== RESPONSIVE BEHAVIOR =====
function handleResize() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;
    
    if (wasMobile !== isMobile) {
        const sidebarNav = document.getElementById('sidebarNav');
        if (sidebarNav) {
            if (!isMobile) {
                // Desktop: remove mobile-open class
                sidebarNav.classList.remove('mobile-open');
            }
        }
    }
}

// ===== BACK TO TOP FUNCTIONALITY =====
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    // Show/hide back to top button based on scroll position
    function toggleBackToTopVisibility() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    
    // Smooth scroll to top
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Throttled scroll listener
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(toggleBackToTopVisibility, 10);
    });
    
    // Initial check
    toggleBackToTopVisibility();
}

// ===== PERFORMANCE MONITORING =====
function initializePerformanceMonitoring() {
    // Monitor page visibility for performance optimization
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('Page hidden - pausing non-essential operations');
        } else {
            console.log('Page visible - resuming operations');
        }
    });
    
    // Monitor performance metrics
    if ('performance' in window && 'PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'navigation') {
                        console.log('Navigation timing:', {
                            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                            loadComplete: entry.loadEventEnd - entry.loadEventStart
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['navigation'] });
        } catch (error) {
            console.warn('Performance monitoring not available:', error);
        }
    }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
function initializeAccessibility() {
    // Keyboard navigation for theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }
    
    // Keyboard navigation for navigation collapse
    const navCollapseBtn = document.getElementById('navCollapseBtn');
    if (navCollapseBtn) {
        navCollapseBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navCollapseBtn.click();
            }
        });
    }
    
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--accent-primary);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1001;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ===== ERROR HANDLING =====
function setupErrorHandling() {
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        
        // If it's a Mermaid-related error, try to recover
        if (e.error && e.error.message && e.error.message.includes('mermaid')) {
            console.log('Mermaid error detected, attempting recovery...');
            setTimeout(() => {
                reinitializeMermaid();
            }, 1000);
        }
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        
        // If it's a Mermaid-related promise rejection, try to recover
        if (e.reason && e.reason.toString().includes('mermaid')) {
            console.log('Mermaid promise rejection detected, attempting recovery...');
            setTimeout(() => {
                reinitializeMermaid();
            }, 1000);
        }
    });
}

// ===== INITIALIZATION =====
function initializeApp() {
    console.log('Initializing DesignerShaik Documentation...');
    
    try {
        // Core initialization
        initializeTheme();
        initializeNavigation();
        initializeBackToTop();
        initializeAccessibility();
        initializePerformanceMonitoring();
        setupErrorHandling();
        
        // Mermaid initialization with delay to ensure DOM is ready
        setTimeout(() => {
            initMermaid();
        }, 300);
        
        // Event listeners
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        // Resize handler
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        
        console.log('DesignerShaik Documentation initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

// ===== DOM READY =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeTheme,
        toggleTheme,
        initMermaid,
        reinitializeMermaid,
        initializeNavigation
    };
}