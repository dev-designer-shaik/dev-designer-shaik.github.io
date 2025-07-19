/**
 * DesignerShaik Documentation - Enhanced Interactive Features
 * Handles theme switching, navigation, Mermaid diagrams, and responsive behavior
 * UPDATED: Removed scrollable features and enhanced diamond shape handling
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

// ===== ENHANCED MERMAID INITIALIZATION WITH DIAMOND FIXES =====

function initMermaid() {
    if (typeof mermaid === 'undefined') {
        console.warn('Mermaid library not loaded');
        return;
    }

    const styles = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Enhanced theme CSS with better text visibility and smaller diamonds
    const themeCSS = `
        /* Node styling */
        g.node rect {
            fill: ${isDark ? '#334155' : '#e2e8f0'} !important;
            stroke: ${isDark ? '#60a5fa' : '#3b82f6'} !important;
            stroke-width: 1.5px !important;
            rx: 4px; ry: 4px;
        }
        
        /* Diamond/Decision node styling - MAKE 1/3 SMALLER */
        g.node polygon {
            transform: scale(0.33) !important;
            transform-origin: center !important;
            fill: ${isDark ? '#334155' : '#e2e8f0'} !important;
            stroke: ${isDark ? '#60a5fa' : '#3b82f6'} !important;
            stroke-width: 2px !important;
        }
        
        /* Additional diamond shape targeting */
        polygon[points*="40,0 80,40 40,80 0,40"],
        polygon[points*="50,0 100,50 50,100 0,50"] {
            transform: scale(0.33) !important;
            transform-origin: center !important;
        }
        
        /* Cluster styling */
        g.cluster rect {
            fill: ${isDark ? '#1e293b' : '#f8fafc'} !important;
            stroke: ${isDark ? '#94a3b8' : '#64748b'} !important;
            stroke-width: 1.5px !important;
            rx: 6px; ry: 6px;
        }
        
        /* Text styling - CRITICAL FIX */
        text, tspan {
            fill: ${isDark ? '#f1f5f9' : '#1e293b'} !important;
            font-family: 'Inter', sans-serif !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            stroke: none !important;
        }
        
        /* Node text specific */
        g.node text, g.node tspan {
            fill: ${isDark ? '#f1f5f9' : '#1e293b'} !important;
        }
        
        /* Class diagram text */
        g.classGroup text, g.classGroup tspan {
            fill: ${isDark ? '#f1f5f9' : '#1e293b'} !important;
            font-size: 11px !important;
        }
        
        /* Class title styling */
        g.classGroup .title, g.classGroup .classTitle {
            fill: ${isDark ? '#60a5fa' : '#3b82f6'} !important;
            font-size: 14px !important;
            font-weight: 700 !important;
        }
        
        /* Edge styling */
        path {
            stroke: ${isDark ? '#94a3b8' : '#64748b'} !important;
            stroke-width: 1.5px !important;
            fill: none !important;
        }
        
        /* Arrow markers */
        marker path {
            fill: ${isDark ? '#94a3b8' : '#64748b'} !important;
            stroke: ${isDark ? '#94a3b8' : '#64748b'} !important;
        }
        
        /* Entity box styling for ER diagrams */
        g.entityBox rect {
            fill: ${isDark ? '#334155' : '#f1f5f9'} !important;
            stroke: ${isDark ? '#60a5fa' : '#3b82f6'} !important;
        }
        
        g.entityBox text {
            fill: ${isDark ? '#f1f5f9' : '#1e293b'} !important;
        }
        
        /* Edge labels */
        g.edgeLabel text, g.edgeLabel tspan {
            fill: ${isDark ? '#cbd5e1' : '#475569'} !important;
            font-size: 10px !important;
        }
        
        /* Cluster labels */
        g.cluster text, g.cluster tspan {
            fill: ${isDark ? '#f1f5f9' : '#1e293b'} !important;
            font-weight: 600 !important;
            font-size: 13px !important;
        }
    `;

    const config = {
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
            darkMode: isDark,
            background: isDark ? '#0f172a' : '#ffffff',
            primaryColor: isDark ? '#60a5fa' : '#3b82f6',
            primaryTextColor: isDark ? '#f1f5f9' : '#1e293b',
            lineColor: isDark ? '#94a3b8' : '#64748b',
            secondaryColor: isDark ? '#334155' : '#e2e8f0',
            tertiaryColor: isDark ? '#1e293b' : '#f8fafc',
            primaryBorderColor: isDark ? '#60a5fa' : '#3b82f6',
            // Class diagram specific
            classText: isDark ? '#f1f5f9' : '#1e293b',
            // ER diagram specific
            attributeBackgroundColorOdd: isDark ? '#334155' : '#f1f5f9',
            attributeBackgroundColorEven: isDark ? '#1e293b' : '#e2e8f0',
        },
        flowchart: { 
            useMaxWidth: true, 
            htmlLabels: true, 
            curve: 'basis',
            padding: 15
        },
        class: {
            useMaxWidth: true,
            htmlLabels: true
        },
        er: {
            useMaxWidth: true,
            entityPadding: 15,
            fontSize: 12
        },
        sequence: { 
            useMaxWidth: true, 
            wrap: true,
            messageFontSize: 12,
            noteFontSize: 11
        },
        securityLevel: 'loose',
        themeCSS,
        maxTextSize: 50000,
        maxEdges: 500
    };

    mermaid.initialize(config);
    mermaidInitialized = true;
    renderAllMermaidDiagrams();
}

async function renderMermaidDiagram(element) {
    if (!mermaidInitialized || typeof mermaid === 'undefined') {
        console.warn('Mermaid not initialized');
        return;
    }

    try {
        let diagramText = element.textContent.trim();
        
        if (element.innerHTML.includes('<svg') || element.getAttribute('data-processed') === 'true') {
            return;
        }
        
        if (!diagramText || diagramText.length < 10) {
            console.warn("Empty or too short diagram text found");
            return;
        }

        if (!element.dataset.originalContent) {
            element.dataset.originalContent = diagramText;
        }
        
        // Check diagram type for special handling
        const isClassDiagram = diagramText.includes('classDiagram');
        const isERDiagram = diagramText.includes('erDiagram');
        
        const diagramId = element.id || `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Apply size constraints for different diagram types
        if (isClassDiagram) {
            // Make class diagrams more compact
            diagramText = optimizeClassDiagram(diagramText);
        }
        
        const { svg } = await mermaid.render(diagramId, diagramText);
        element.innerHTML = svg;
        element.setAttribute('data-processed', 'true');
        
        // Post-processing for responsive behavior
        const svgElement = element.querySelector('svg');
        if (svgElement) {
            // Set responsive attributes - NO MORE MAX-HEIGHT RESTRICTIONS
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.width = 'auto';
            
            // Apply diamond scaling fixes
            applyDiamondScaling(svgElement);
            
            // Force text color fix
            fixTextColors(svgElement);
        }
        
        console.log(`Successfully rendered diagram: ${diagramId}`);
        
    } catch (error) {
        console.error('Failed to render Mermaid diagram:', error);
        element.innerHTML = createErrorDisplay(error.message);
    }
}

function applyDiamondScaling(svgElement) {
    // Find and scale diamond shapes to 1/3 size
    const diamonds = svgElement.querySelectorAll('polygon');
    diamonds.forEach(diamond => {
        const points = diamond.getAttribute('points');
        // Check if it's a diamond shape (common diamond point patterns)
        if (points && (
            points.includes('40,0 80,40 40,80 0,40') || 
            points.includes('50,0 100,50 50,100 0,50') ||
            points.match(/\d+,0\s+\d+,\d+\s+\d+,\d+\s+0,\d+/)
        )) {
            diamond.style.transform = 'scale(0.33)';
            diamond.style.transformOrigin = 'center';
        }
    });

    // Also target decision nodes by class or id
    const decisionNodes = svgElement.querySelectorAll('g[class*="diamond"], g[id*="diamond"], g[class*="decision"], g[id*="decision"]');
    decisionNodes.forEach(node => {
        const polygons = node.querySelectorAll('polygon');
        polygons.forEach(polygon => {
            polygon.style.transform = 'scale(0.33)';
            polygon.style.transformOrigin = 'center';
        });
    });
}

function optimizeClassDiagram(diagramText) {
    // Optimize class diagram for better display
    return diagramText
        .replace(/\+str productName/g, "+str prodName")
        .replace(/\+str sku/g, "+str sku")
        .replace(/\+text description/g, "+text desc")
        .replace(/\+str\[\] tags/g, "+str[] tags")
        .replace(/\+str\[\] colors/g, "+str[] colors")
        .replace(/\+num qualityScore/g, "+num quality");
}

function fixTextColors(svgElement) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    
    // Fix all text elements
    const textElements = svgElement.querySelectorAll('text, tspan');
    textElements.forEach(textEl => {
        textEl.style.fill = textColor;
        textEl.style.stroke = 'none';
    });
    
    // Fix node text specifically
    const nodeTexts = svgElement.querySelectorAll('g.node text, g.node tspan');
    nodeTexts.forEach(textEl => {
        textEl.style.fill = textColor;
    });
    
    // Fix class diagram text
    const classTexts = svgElement.querySelectorAll('g.classGroup text, g.classGroup tspan');
    classTexts.forEach(textEl => {
        textEl.style.fill = textColor;
    });
    
    // Fix cluster text
    const clusterTexts = svgElement.querySelectorAll('g.cluster text, g.cluster tspan');
    clusterTexts.forEach(textEl => {
        textEl.style.fill = textColor;
        textEl.style.fontWeight = '600';
    });
    const nodeLabels = svgElement.querySelectorAll('.nodeLabel, .nodeLabel text, .nodeLabel tspan');
nodeLabels.forEach(textEl => {
    textEl.style.fill = textColor;
    textEl.style.color = textColor;
});

// Fix decision/diamond node labels
const decisionLabels = svgElement.querySelectorAll('g[class*="decision"] .nodeLabel, g[class*="diamond"] .nodeLabel, g.node .nodeLabel');
decisionLabels.forEach(textEl => {
    textEl.style.fill = textColor;
    textEl.style.color = textColor;
});
}

function createErrorDisplay(errorMessage) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return `
        <div style="
            padding: 2rem; 
            text-align: center; 
            color: ${isDark ? '#f87171' : '#dc2626'}; 
            border: 1px solid ${isDark ? '#f87171' : '#dc2626'}; 
            border-radius: 8px; 
            background-color: ${isDark ? '#1e293b' : '#fef2f2'};
        ">
            <p style="margin: 0 0 0.5rem 0;"><strong>⚠️ Diagram Rendering Error</strong></p>
            <p style="font-size: 0.875rem; margin: 0; color: ${isDark ? '#cbd5e1' : '#6b7280'};">
                Unable to render this diagram. Please check the syntax.
            </p>
            <details style="margin-top: 1rem; text-align: left;">
                <summary style="cursor: pointer; font-size: 0.75rem;">Error Details</summary>
                <pre style="
                    font-size: 0.75rem; 
                    margin-top: 0.5rem; 
                    padding: 0.5rem; 
                    background: ${isDark ? '#0f172a' : '#f9fafb'}; 
                    border-radius: 4px;
                    overflow: auto;
                ">${errorMessage}</pre>
            </details>
        </div>
    `;
}

async function renderAllMermaidDiagrams() {
    const diagrams = document.querySelectorAll('.mermaid');
    console.log(`Found ${diagrams.length} Mermaid diagrams to render`);
    
    for (const diagram of diagrams) {
        await renderMermaidDiagram(diagram);
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
        
        mermaidInitialized = false;
        
        const diagrams = document.querySelectorAll('.mermaid');
        diagrams.forEach(diagram => {
            if (diagram.dataset.originalContent) {
                diagram.innerHTML = diagram.dataset.originalContent;
                diagram.removeAttribute('data-processed');
                // No more scrollable class removal needed
            }
        });
        
        setTimeout(() => {
            initMermaid();
        }, 100);
        
    } catch (error) {
        console.error('Failed to reinitialize Mermaid:', error);
    }
}

// Export functions for use in main script
window.initMermaid = initMermaid;
window.reinitializeMermaid = reinitializeMermaid;

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

// ===== COLLAPSIBLE CODE BLOCKS =====
function initializeCollapsibleCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.code-block.collapsible');
    
    codeBlocks.forEach(block => {
        const header = block.querySelector('.code-header');
        const content = block.querySelector('.code-content');
        const toggle = block.querySelector('.code-toggle');
        
        if (!header || !content || !toggle) return;
        
        // Set initial state (collapsed)
        content.classList.remove('expanded');
        toggle.textContent = '▼';
        
        // Add click event listener
        header.addEventListener('click', () => {
            const isExpanded = content.classList.contains('expanded');
            
            if (isExpanded) {
                // Collapse
                content.classList.remove('expanded');
                toggle.textContent = '▼';
                toggle.setAttribute('aria-label', 'Expand code block');
            } else {
                // Expand
                content.classList.add('expanded');
                toggle.textContent = '▲';
                toggle.setAttribute('aria-label', 'Collapse code block');
            }
        });
        
        // Keyboard accessibility
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.click();
            }
        });
        
        // Make header focusable
        header.setAttribute('tabindex', '0');
        header.setAttribute('role', 'button');
        header.setAttribute('aria-expanded', 'false');
        
        // Update aria-expanded when toggled
        const observer = new MutationObserver(() => {
            const isExpanded = content.classList.contains('expanded');
            header.setAttribute('aria-expanded', isExpanded.toString());
        });
        
        observer.observe(content, { attributes: true, attributeFilter: ['class'] });
    });
    
    console.log(`Initialized ${codeBlocks.length} collapsible code blocks`);
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
        initializeCollapsibleCodeBlocks();
        
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
