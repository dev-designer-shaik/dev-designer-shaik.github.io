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

// Build marker (helps verify the browser is loading the latest script.js)
window.__DSI_DOCS_BUILD = '2025-12-17.14';
console.debug('[Docs] Loaded script.js', window.__DSI_DOCS_BUILD);

// Mermaid (v10) will auto-render on DOMContentLoaded when startOnLoad is true.
// Disable that early so our theme config controls the output.
(() => {
    if (typeof window === 'undefined') return;
    if (!window.mermaid) return;
    if (window.__MERMAID_AUTOSTART_DISABLED) return;
    window.__MERMAID_AUTOSTART_DISABLED = true;
    try {
        window.mermaid.initialize({ startOnLoad: false });
    } catch {
        // ignore
    }
})();

function isElementVisible(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return false;

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

    // offsetParent is null for display:none ancestors; allow fixed-position elements.
    if (element.offsetParent === null && style.position !== 'fixed') return false;

    return true;
}

// ===== DOCS NAVIGATION CONFIG =====
const DOCS_SITEMAP = [
    {
        id: 'platform',
        title: 'Developer Hub',
        icon: '🏠',
        href: 'index.html',
        sections: [
            { id: 'platform-overview', label: 'Overview' },
            { id: 'ecosystem-architecture', label: 'Architecture' },
            { id: 'technology-stack', label: 'Tech Stack' },
            { id: 'getting-started', label: 'Getting Started' },
            { id: 'quick-reference', label: 'Quick Reference' },
            { id: 'api-endpoints', label: 'API Endpoints' },
            { id: 'troubleshooting', label: 'Troubleshooting' },
            { id: 'contributing', label: 'Contributing' }
        ]
    },
    {
        id: 'docker-system',
        title: 'Docker System',
        icon: '🐳',
        href: 'docker-system.html',
        sections: [
            { id: 'overview', label: 'Overview' },
            { id: 'architecture', label: 'Architecture' },
            { id: 'services', label: 'Services' },
            { id: 'workflows', label: 'Workflows' },
            { id: 'operations', label: 'Operations' }
        ]
    },
    {
        id: 'ai-ecosystem',
        title: 'AI Ecosystem',
        icon: '🤖',
        href: 'ai-ecosystem.html',
        sections: [
            { id: 'overview', label: 'Overview' },
            { id: 'architecture', label: 'Architecture' },
            { id: 'features', label: 'Features' },
            { id: 'installation', label: 'Installation' },
            { id: 'configuration', label: 'Configuration' },
            { id: 'connectors', label: 'MCP Connectors' },
            { id: 'workflows', label: 'Workflows' },
            { id: 'monitoring', label: 'Monitoring' },
            { id: 'troubleshooting', label: 'Troubleshooting' }
        ]
    },
    {
        id: 'frappe-mcp',
        title: 'Frappe MCP',
        icon: '📊',
        href: 'frappe-mcp.html',
        sections: [
            { id: 'overview', label: 'Overview' },
            { id: 'architecture', label: 'Architecture' },
            { id: 'features', label: 'Features' },
            { id: 'installation', label: 'Installation' },
            { id: 'tools', label: 'Tools' },
            { id: 'api', label: 'API Usage' },
            { id: 'security', label: 'Security' },
            { id: 'examples', label: 'Examples' },
            { id: 'troubleshooting', label: 'Troubleshooting' }
        ]
    },
    {
        id: 'idempiere-mcp',
        title: 'iDempiere MCP',
        icon: '💾',
        href: 'idempiere-mcp.html',
        sections: [
            { id: 'overview-tab', label: 'Overview' },
            { id: 'database-tab', label: 'Database' },
            { id: 'tools-tab', label: 'Tools' },
            { id: 'api-tab', label: 'API' },
            { id: 'deployment-tab', label: 'Deployment' }
        ]
    },
    {
        id: 'dsi-web',
        title: 'DSI WEB N',
        icon: '🌐',
        href: 'dsi-web.html',
        sections: [
            { id: 'overview', label: 'Overview' },
            { id: 'architecture', label: 'Architecture' },
            { id: 'components', label: 'Components' },
            { id: 'deployment', label: 'Deployment' },
            { id: 'cms-guide', label: 'CMS Guide' }
        ]
    }
];

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
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        } else {
            themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        }
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
        scheduleMermaidThemePasses();
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

    // Enhanced theme CSS with better text visibility.
    const themeCSS = `
        /* Node styling */
        g.node rect {
            fill: ${isDark ? '#334155' : '#e2e8f0'} !important;
            stroke: ${isDark ? '#60a5fa' : '#3b82f6'} !important;
            stroke-width: 1.5px !important;
            rx: 4px; ry: 4px;
        }
        
        /* Diamond/Decision node styling (sizing handled post-render in JS) */
        g.node polygon {
            fill: ${isDark ? '#334155' : '#e2e8f0'} !important;
            stroke: ${isDark ? '#60a5fa' : '#3b82f6'} !important;
            stroke-width: 2px !important;
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

        /* ===== SEQUENCE DIAGRAM THEME FIXES (readability in dark mode) ===== */
        rect.background {
            fill: ${isDark ? '#0f172a' : '#ffffff'} !important;
        }

        /* Participants / actor boxes */
        rect.actor,
        g.actor rect,
        .actor rect,
        .actor-man rect,
        .actor-female rect {
            fill: ${isDark ? '#334155' : '#e2e8f0'} !important;
            stroke: ${isDark ? '#60a5fa' : '#3b82f6'} !important;
            stroke-width: 1.5px !important;
        }

        text.actor,
        g.actor text,
        .actor text,
        .actor-man text,
        .actor-female text {
            fill: ${isDark ? '#f1f5f9' : '#1e293b'} !important;
            font-weight: 600 !important;
        }

        /* Lifelines and messages */
        .actor-line,
        .messageLine0,
        .messageLine1,
        .loopLine,
        .activation0,
        .activation1 {
            stroke: ${isDark ? '#cbd5e1' : '#64748b'} !important;
            stroke-width: ${isDark ? '1.8px' : '1.3px'} !important;
            opacity: ${isDark ? '0.95' : '1'} !important;
        }

        /* Make lifelines slightly accent-tinted for clarity */
        .actor-line {
            stroke: ${isDark ? '#60a5fa' : '#64748b'} !important;
            opacity: ${isDark ? '0.85' : '1'} !important;
        }

        /* Arrowheads in sequence diagrams */
        marker path,
        .messageLine0 marker path,
        .messageLine1 marker path {
            fill: ${isDark ? '#cbd5e1' : '#64748b'} !important;
            stroke: ${isDark ? '#cbd5e1' : '#64748b'} !important;
        }

        .messageText,
        .loopText,
        .noteText,
        .labelText,
        .sequenceNumber {
            fill: ${isDark ? '#f1f5f9' : '#1e293b'} !important;
        }

        /* Notes */
        rect.note,
        .note rect {
            fill: ${isDark ? '#1e293b' : '#f8fafc'} !important;
            stroke: ${isDark ? '#94a3b8' : '#64748b'} !important;
        }

        /* Loop/alt boxes */
        rect.labelBox,
        .labelBox {
            fill: ${isDark ? '#1e293b' : '#f8fafc'} !important;
            stroke: ${isDark ? '#94a3b8' : '#64748b'} !important;
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
            // Sequence diagram specific (prevents default light actor boxes in dark mode)
            actorBkg: isDark ? 'rgba(15,23,42,0)' : '#e2e8f0',
            actorBorder: isDark ? '#60a5fa' : '#3b82f6',
            actorTextColor: isDark ? '#f1f5f9' : '#1e293b',
            signalColor: isDark ? '#94a3b8' : '#64748b',
            signalWidth: isDark ? 2 : 1,
            signalTextColor: isDark ? '#f1f5f9' : '#1e293b',
            noteBkgColor: isDark ? 'rgba(30,41,59,0.40)' : '#f8fafc',
            noteTextColor: isDark ? '#f1f5f9' : '#1e293b',
            activationBkgColor: isDark ? 'rgba(30,41,59,0.40)' : '#f1f5f9',
            activationBorderColor: isDark ? '#94a3b8' : '#64748b',
            labelBoxBkgColor: isDark ? 'rgba(30,41,59,0.40)' : '#f8fafc',
            labelTextColor: isDark ? '#f1f5f9' : '#1e293b',
            sequenceNumberColor: isDark ? '#cbd5e1' : '#475569'
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
        if (!isElementVisible(element)) {
            return;
        }

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
            svgElement.style.width = '100%';
            svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            // Some Mermaid renderers omit viewBox; without it, `height:auto` can collapse.
            if (!svgElement.getAttribute('viewBox')) {
                const widthAttr = svgElement.getAttribute('width');
                const heightAttr = svgElement.getAttribute('height');
                const width = widthAttr ? Number.parseFloat(widthAttr) : NaN;
                const height = heightAttr ? Number.parseFloat(heightAttr) : NaN;

                if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
                    svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
                } else {
                    try {
                        const bbox = svgElement.getBBox();
                        if (bbox.width > 0 && bbox.height > 0) {
                            svgElement.setAttribute('viewBox', `0 0 ${bbox.width} ${bbox.height}`);
                        }
                    } catch {
                        // Ignore: browser may not be able to compute bbox immediately.
                    }
                }
            }
            
            // Apply diamond scaling fixes
            applyDiamondScaling(svgElement);

            // Apply targeted theming overrides for Mermaid-generated SVGs where Mermaid's internal
            // styles/presentation attributes win over page CSS (notably sequence diagrams in dark mode).
            applyMermaidThemeOverrides(svgElement);
        }
        
        console.log(`Successfully rendered diagram: ${diagramId}`);
        
    } catch (error) {
        console.error('Failed to render Mermaid diagram:', error);
        element.innerHTML = createErrorDisplay(error.message);
    }
}

function applyMermaidThemeOverrides(svgElement) {
    const isDark =
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches);
    if (!isDark) return;

    const hasSequenceMarkers = Boolean(
        svgElement.querySelector('rect.actor, .actor rect, .messageText, .actor-line, .messageLine0, .messageLine1')
    );
    if (!hasSequenceMarkers) return;

    const colors = {
        bg: '#0f172a',
        panel: 'rgba(30,41,59,0.40)',       // translucent panel on dark
        node: 'rgba(15,23,42,0.00)',        // transparent
        border: '#60a5fa',
        line: '#e2e8f0',
        lifeline: '#60a5fa',
        returnLine: '#cbd5e1',
        text: '#f1f5f9',
        muted: '#cbd5e1'
    };

    const setProp = (nodes, prop, value) => {
        nodes.forEach(node => node.style.setProperty(prop, value, 'important'));
    };

    const setAttrAndStyle = (nodes, attr, value) => {
        nodes.forEach(node => {
            try {
                node.setAttribute(attr, value);
            } catch {
                // ignore
            }
            node.style.setProperty(attr, value, 'important');
        });
    };

    // Background
    setAttrAndStyle(Array.from(svgElement.querySelectorAll('rect.background')), 'fill', colors.bg);

    // Actor/participant boxes
    const actorRects = Array.from(svgElement.querySelectorAll('rect.actor, g.actor rect, .actor rect, .actor-man rect, .actor-female rect'));
    setAttrAndStyle(actorRects, 'fill', colors.node);
    setAttrAndStyle(actorRects, 'stroke', colors.border);
    setProp(Array.from(svgElement.querySelectorAll('text.actor, g.actor text, .actor text, .actor-man text, .actor-female text')), 'fill', colors.text);

    // Notes and label/loop boxes
    const noteRects = Array.from(svgElement.querySelectorAll('rect.note, .note rect, rect.labelBox, .labelBox rect, rect.labelBox, .labelBox'));
    setAttrAndStyle(noteRects, 'fill', colors.panel);
    setAttrAndStyle(noteRects, 'stroke', colors.line);

    // Lifelines/messages/activations
    // Messages:
    // - `.messageLine0` is typically solid "call" arrows.
    // - `.messageLine1` is typically dashed "return" arrows.
    // - `.loopLine` is used for alt/loop/opt box borders.
    const callLines = Array.from(svgElement.querySelectorAll('.messageLine0'));
    setAttrAndStyle(callLines, 'stroke', colors.line);
    callLines.forEach(line => {
        line.style.setProperty('stroke-width', '2.0px', 'important');
        line.style.setProperty('stroke-dasharray', '0', 'important');
        line.style.setProperty('stroke-linecap', 'round', 'important');
    });

    const returnLines = Array.from(svgElement.querySelectorAll('.messageLine1'));
    setAttrAndStyle(returnLines, 'stroke', colors.returnLine);
    returnLines.forEach(line => {
        line.style.setProperty('stroke-width', '1.7px', 'important');
        line.style.setProperty('stroke-dasharray', '6 4', 'important');
        line.style.setProperty('stroke-linecap', 'round', 'important');
    });

    const loopLines = Array.from(svgElement.querySelectorAll('.loopLine'));
    setAttrAndStyle(loopLines, 'stroke', colors.returnLine);
    loopLines.forEach(line => {
        line.style.setProperty('stroke-width', '1.6px', 'important');
        line.style.setProperty('stroke-dasharray', '3 3', 'important');
    });

    const lifelines = Array.from(svgElement.querySelectorAll('.actor-line'));
    setAttrAndStyle(lifelines, 'stroke', colors.lifeline);
    lifelines.forEach(line => {
        line.style.setProperty('stroke-width', '1.6px', 'important');
        line.style.setProperty('opacity', '0.75', 'important');
    });
    // If actor boxes are transparent, lifelines will show "through" them.
    // Add background cutouts inside actor boxes to hide the lifeline without changing the box transparency.
    addSequenceActorCutouts(svgElement, colors.bg);

    const activations = Array.from(svgElement.querySelectorAll('.activation0, .activation1'));
    setAttrAndStyle(activations, 'fill', colors.panel);
    setAttrAndStyle(activations, 'stroke', colors.line);
    activations.forEach(act => act.style.setProperty('stroke-width', '1.4px', 'important'));

    // Arrowheads
    const markerPaths = Array.from(svgElement.querySelectorAll('marker path'));
    markerPaths.forEach(path => {
        // Prefer the stroke color of the parent line if available.
        const parent = path.closest('marker')?.parentElement;
        const stroke = parent?.getAttribute?.('stroke') || colors.line;
        path.setAttribute('fill', stroke);
        path.setAttribute('stroke', stroke);
        path.style.setProperty('fill', stroke, 'important');
        path.style.setProperty('stroke', stroke, 'important');
    });

    // Text inside diagram
    setProp(Array.from(svgElement.querySelectorAll('.messageText, .loopText, .noteText, .labelText, .sequenceNumber')), 'fill', colors.text);
    setProp(Array.from(svgElement.querySelectorAll('.edgeLabel text, .edgeLabel tspan')), 'fill', colors.muted);

    svgElement.setAttribute('data-mermaid-themed', 'dark-sequence-transparent');
    console.debug('[Mermaid] Applied dark sequence theming override', {
        actors: svgElement.querySelectorAll('rect.actor, .actor rect, g.actor rect').length
    });
}

function addSequenceActorCutouts(svgElement, bgFill) {
    const ns = 'http://www.w3.org/2000/svg';

    const actorRects = Array.from(
        svgElement.querySelectorAll('rect.actor, g.actor rect, .actor rect, .actor-man rect, .actor-female rect')
    ).filter(rect => rect instanceof SVGRectElement);

    if (actorRects.length === 0) return;

    // Avoid duplicating cutouts on repeated theme passes.
    if (svgElement.querySelector('rect[data-seq-cutout="true"]')) return;

    actorRects.forEach(rect => {
        const parent = rect.parentNode;
        if (!parent) return;

        const cutout = document.createElementNS(ns, 'rect');
        cutout.setAttribute('data-seq-cutout', 'true');
        cutout.setAttribute('x', rect.getAttribute('x') || '0');
        cutout.setAttribute('y', rect.getAttribute('y') || '0');
        cutout.setAttribute('width', rect.getAttribute('width') || '0');
        cutout.setAttribute('height', rect.getAttribute('height') || '0');

        // Respect rounded corners if present.
        const rx = rect.getAttribute('rx');
        const ry = rect.getAttribute('ry');
        if (rx) cutout.setAttribute('rx', rx);
        if (ry) cutout.setAttribute('ry', ry);

        cutout.setAttribute('fill', bgFill);
        cutout.setAttribute('stroke', 'none');
        cutout.style.pointerEvents = 'none';

        // Place the cutout above the lifeline but beneath the actor border/text.
        parent.insertBefore(cutout, rect);
    });
}

function scheduleMermaidThemePasses() {
    const passes = [0, 200, 800, 1600];
    passes.forEach(delay => {
        setTimeout(() => {
            document.querySelectorAll('.mermaid svg').forEach(svg => applyMermaidThemeOverrides(svg));
        }, delay);
    });
}

function applyDiamondScaling(svgElement) {
    const DIAMOND_SCALE = 0.67; // ~ "1/3 smaller" (2/3 size)

    function parsePoints(pointsStr) {
        if (!pointsStr) return [];
        return pointsStr
            .trim()
            .split(/\s+/)
            .map(pair => pair.split(',').map(value => Number(value)))
            .filter(pair => pair.length === 2 && Number.isFinite(pair[0]) && Number.isFinite(pair[1]));
    }

    function distance(a, b) {
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    function isDiamond(points) {
        if (points.length !== 4) return false;

        const xs = points.map(p => p[0]);
        const ys = points.map(p => p[1]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const width = maxX - minX;
        const height = maxY - minY;
        if (width <= 0 || height <= 0) return false;

        const aspect = width / height;
        if (aspect < 0.75 || aspect > 1.25) return false;

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const tol = Math.max(2, Math.max(width, height) * 0.06);
        const targets = [
            [centerX, minY], // top
            [maxX, centerY], // right
            [centerX, maxY], // bottom
            [minX, centerY]  // left
        ];

        return targets.every(target => points.some(point => distance(point, target) <= tol));
    }

    function scaleAroundCenter(polygon, scale) {
        const bbox = polygon.getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;

        const existing = (polygon.getAttribute('transform') || '').trim();
        const transform = `translate(${centerX} ${centerY}) scale(${scale}) translate(${-centerX} ${-centerY})`;
        polygon.setAttribute('transform', existing ? `${existing} ${transform}` : transform);
    }

    // Only inspect polygons that belong to actual nodes (avoid markers and other internal shapes).
    const nodePolygons = svgElement.querySelectorAll('g.node polygon');
    nodePolygons.forEach(polygon => {
        const points = parsePoints(polygon.getAttribute('points'));
        if (!isDiamond(points)) return;
        scaleAroundCenter(polygon, DIAMOND_SCALE);
    });
}

function setupMermaidThemingObserver() {
    // Catch any Mermaid-rendered SVGs inserted outside our render path (or re-rendered by other scripts).
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (!(node instanceof Element)) continue;

                if (node.tagName === 'svg') {
                    applyMermaidThemeOverrides(node);
                    continue;
                }

                const svg = node.querySelector?.('.mermaid svg') || node.querySelector?.('svg');
                if (svg) applyMermaidThemeOverrides(svg);
            }
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
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

async function renderVisibleMermaidDiagrams() {
    const diagrams = document.querySelectorAll('.mermaid');
    for (const diagram of diagrams) {
        if (!isElementVisible(diagram)) continue;
        await renderMermaidDiagram(diagram);
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

async function renderAllMermaidDiagrams() {
    const diagrams = document.querySelectorAll('.mermaid');
    console.log(`Found ${diagrams.length} Mermaid diagrams to render`);
    
    for (const diagram of diagrams) {
        if (!isElementVisible(diagram)) {
            continue;
        }
        await renderMermaidDiagram(diagram);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Ensure post-render overrides are applied even if a diagram was rendered elsewhere.
    document.querySelectorAll('.mermaid svg').forEach(svg => applyMermaidThemeOverrides(svg));
    
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
window.renderVisibleMermaidDiagrams = renderVisibleMermaidDiagrams;

// ===== NAVIGATION MANAGEMENT =====
function getCurrentPageKey() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const normalized = currentPath === '' ? 'index.html' : currentPath;
    return normalized;
}

function buildSidebarTree() {
    const container = document.getElementById('navTree');
    if (!container) return;

    const currentPage = getCurrentPageKey();
    const currentEntry = DOCS_SITEMAP.find(entry => entry.href === currentPage) || DOCS_SITEMAP[0];

    const groupsHtml = DOCS_SITEMAP.map(entry => {
        const openAttr = entry.id === currentEntry.id ? ' open' : '';
        const linksHtml = entry.sections.map(section => {
            const href = `${entry.href}#${section.id}`;
            return `<li><a href="${href}">${section.label}<span class="nav-badge">#${section.id}</span></a></li>`;
        }).join('');

        return `
<details class="nav-group" data-repo="${entry.id}"${openAttr}>
  <summary>
    <span class="nav-group__icon">${entry.icon}</span>
    <span class="nav-group__title">${entry.title}</span>
    <span class="nav-group__chevron">▾</span>
  </summary>
  <ul class="nav-group__links">${linksHtml}</ul>
</details>`;
    }).join('');

    container.innerHTML = groupsHtml;
}

function buildPageTabs() {
    const tabs = document.getElementById('pageTabs');
    if (!tabs) return;

    const currentPage = getCurrentPageKey();
    const entry = DOCS_SITEMAP.find(item => item.href === currentPage);
    if (!entry) {
        tabs.innerHTML = '';
        return;
    }

    tabs.innerHTML = entry.sections
        .map(section => `<a class="page-tab" href="#${section.id}">${section.label}</a>`)
        .join('');
}

function syncActiveNavigation(sectionId) {
    const currentUrl = new URL(window.location.href);
    const currentPath = currentUrl.pathname.replace(/\/+$/, '');
    const targetHash = sectionId ? `#${sectionId}` : currentUrl.hash;

    const allLinks = document.querySelectorAll('.nav-tree a, .page-tabs a');
    allLinks.forEach(link => link.classList.remove('active'));

    allLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (!href) return;
        const linkUrl = new URL(href, window.location.href);
        const linkPath = linkUrl.pathname.replace(/\/+$/, '');
        const linkHash = linkUrl.hash || '';

        if (linkPath === currentPath && linkHash === targetHash) {
            link.classList.add('active');
        }
    });
}

function initializeSectionObserver() {
    const currentPage = getCurrentPageKey();
    const entry = DOCS_SITEMAP.find(item => item.href === currentPage);
    if (!entry) return;

    const sectionEls = entry.sections
        .map(section => document.getElementById(section.id))
        .filter(Boolean);

    if (!sectionEls.length) {
        syncActiveNavigation(null);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
            syncActiveNavigation(visible.target.id);
        }
    }, { rootMargin: '-15% 0px -75% 0px', threshold: [0.01, 0.1, 0.2] });

    sectionEls.forEach(el => observer.observe(el));
}

function initializeNavigation() {
    const navCollapseBtn = document.getElementById('navCollapseBtn');
    const sidebarNav = document.getElementById('sidebarNav');
    const sidebarToggle = document.getElementById('sidebarToggle');

    buildSidebarTree();
    buildPageTabs();
    
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
    const navLinks = document.querySelectorAll('.nav-tree a, .page-tabs a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMobile && sidebarNav) {
                sidebarNav.classList.remove('mobile-open');
            }
        });
    });
    
    // Highlight current section in navigation
    syncActiveNavigation(null);
    initializeSectionObserver();

    window.addEventListener('hashchange', () => syncActiveNavigation(null));
}
// Legacy functions removed: navigation is now driven by DOCS_SITEMAP + observers.

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

// ===== SEARCH (CLIENT-SIDE) =====
function initializeSearch() {
    const searchToggle =
        document.getElementById('searchToggle') ||
        document.getElementById('searchBtn') ||
        document.getElementById('searchToggleBtn');

    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchToggle || !searchContainer || !searchInput || !searchResults) return;

    function setOpen(isOpen) {
        searchContainer.classList.toggle('active', isOpen);
        if (isOpen) {
            searchInput.focus();
        } else {
            searchInput.value = '';
            searchResults.innerHTML = '';
        }
    }

    searchToggle.addEventListener('click', () => {
        setOpen(!searchContainer.classList.contains('active'));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
            setOpen(false);
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            setOpen(true);
        }
    });

    const index = [];
    const currentPage = getCurrentPageKey();
    const entry = DOCS_SITEMAP.find(item => item.href === currentPage);

    if (entry) {
        entry.sections.forEach(section => {
            const el = document.getElementById(section.id);
            if (!el) return;
            const heading = el.querySelector('h1,h2,h3')?.textContent?.trim() || section.label;
            index.push({
                title: heading,
                href: `#${section.id}`,
                subtitle: entry.title
            });
        });
    }

    DOCS_SITEMAP.forEach(item => {
        if (item.href === currentPage) return;
        index.push({
            title: item.title,
            href: item.href,
            subtitle: 'Repository'
        });
    });

    function renderResults(results) {
        if (!results.length) {
            searchResults.innerHTML = '<div class="search-result-item">No results</div>';
            return;
        }

        searchResults.innerHTML = results.slice(0, 12).map(r => `
            <a class="search-result-item" href="${r.href}">
                <div class="search-result-title">${escapeHtml(r.title)}</div>
                <div class="search-result-subtitle">${escapeHtml(r.subtitle)}</div>
            </a>
        `).join('');
    }

    function escapeHtml(text) {
        return String(text)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            searchResults.innerHTML = '';
            return;
        }

        const results = index
            .map(item => {
                const hay = `${item.title} ${item.subtitle}`.toLowerCase();
                const score = hay.includes(query) ? 1 : 0;
                return { ...item, score };
            })
            .filter(r => r.score > 0);

        renderResults(results);
    });

    searchResults.addEventListener('click', () => setOpen(false));
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

// ===== COPY-TO-CLIPBOARD =====
async function copyCode(target) {
    let codeEl = null;

    if (typeof target === 'string') {
        codeEl = document.getElementById(target);
    } else if (target && target instanceof HTMLElement) {
        const header = target.closest('.code-header');
        const block = target.closest('.code-block') || target.closest('.reference-card') || target.closest('.endpoint-group');
        const fromHeader = header?.nextElementSibling?.querySelector?.('code') || header?.parentElement?.querySelector?.('pre code');
        const fromBlock = block?.querySelector?.('pre code');
        codeEl = fromHeader || fromBlock || null;
    }

    const text = codeEl?.textContent;
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    }

    if (target && target instanceof HTMLElement) {
        const btn = target;
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        setTimeout(() => (btn.innerHTML = original), 1200);
    }
}

function activateTabForHash(hash) {
    const targetId = (hash || window.location.hash || '').replace(/^#/, '');
    if (!targetId) return false;

    const direct = document.getElementById(targetId);
    const pane = (direct?.closest?.('.tab-pane')) || document.querySelector(`.tab-pane#${CSS.escape(targetId)}`);
    if (!pane) return false;

    const tabContent = pane.closest('.tab-content') || pane.parentElement;
    const tabButtons = tabContent?.closest?.('.getting-started-tabs')?.querySelectorAll?.('.tab-btn') || document.querySelectorAll('.tab-btn');

    // Update tab panes within this tab group.
    tabContent?.querySelectorAll?.('.tab-pane')?.forEach(p => p.classList.remove('active'));
    pane.classList.add('active');

    // Update buttons (by data-tab -> pane id).
    tabButtons?.forEach(btn => {
        const isActive = btn instanceof Element && btn.getAttribute('data-tab') === pane.id;
        btn.classList.toggle('active', isActive);
    });

    // Hide big hero sections for non-overview tabs to avoid large "gap" before content.
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const isOverview =
            pane.id === 'overview' ||
            pane.id === 'platform-overview' ||
            pane.id.startsWith('overview');
        heroSection.classList.toggle('is-hidden', !isOverview);
    }

    // Ensure the activated content is in view (hash scroll may have happened while hidden).
    setTimeout(() => {
        try {
            pane.scrollIntoView({ block: 'start', behavior: 'instant' });
        } catch {
            // ignore
        }
        renderVisibleMermaidDiagrams();
        scheduleMermaidThemePasses();
    }, 50);

    return true;
}

// ===== INITIALIZATION =====
function initializeApp() {
    console.log('Initializing DesignerShaik Documentation...');
    
    try {
        // Core initialization
        initializeTheme();
        initializeNavigation();
        initializeBackToTop();
        initializeSearch();
        initializeAccessibility();
        initializePerformanceMonitoring();
        setupErrorHandling();
        initializeCollapsibleCodeBlocks();
        setupMermaidThemingObserver();
        
        // Mermaid initialization (do not delay; avoid default-theme auto-render).
        initMermaid();
        scheduleMermaidThemePasses();
        activateTabForHash(window.location.hash);

        // Re-render Mermaid diagrams when tabs/panels reveal hidden content.
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;

            const tabClick = target.closest?.('.tab-btn,[data-tab],.nav-section-toggle');
            if (!tabClick) return;

            setTimeout(() => {
                renderVisibleMermaidDiagrams();
                scheduleMermaidThemePasses();
            }, 80);
        });

        window.addEventListener('hashchange', () => {
            activateTabForHash(window.location.hash);
        });
        
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

// ===== GLOBALS FOR INLINE HANDLERS (LEGACY) =====
window.copyCode = copyCode;
window.toggleTheme = toggleTheme;
window.toggleSearch = () => {
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    if (!searchContainer || !searchInput) return;
    searchContainer.classList.toggle('active');
    if (searchContainer.classList.contains('active')) searchInput.focus();
};
