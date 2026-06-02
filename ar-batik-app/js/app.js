// Main Application Module
const App = {
    version: CONFIG.version || '1.0.0',
    initialized: false,
    
    initialize: function() {
        console.log(`%c[App] Initializing Batik AR Application v${this.version}`, 'color: #1a1a1a; font-weight: bold;');
        
        if (this.initialized) {
            console.warn('[App] Already initialized');
            return;
        }
        
        try {
            // Initialize all modules
            this.initializeModules();
            
            // Setup global error handling
            this.setupErrorHandling();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            this.initialized = true;
            console.log('[App] Application initialized successfully');
            
        } catch (error) {
            console.error('[App] Initialization error:', error);
            this.showErrorScreen(error);
        }
    },
    
    initializeModules: function() {
        console.log('[App] Initializing modules...');
        
        // Detector (PIR sensor simulation)
        if (typeof Detector !== 'undefined') {
            Detector.initialize();
            window.Detector = Detector;
        } else {
            console.warn('[App] Detector module not loaded');
        }
        
        // Color Analyzer
        if (typeof ColorAnalyzer !== 'undefined') {
            ColorAnalyzer.initialize();
            window.ColorAnalyzer = ColorAnalyzer;
        } else {
            console.warn('[App] ColorAnalyzer module not loaded');
        }
        
        // Body Tracker
        if (typeof BodyTracker !== 'undefined') {
            BodyTracker.initialize();
            window.BodyTracker = BodyTracker;
        } else {
            console.warn('[App] BodyTracker module not loaded');
        }
        
        // AR Renderer
        if (typeof ARRenderer !== 'undefined') {
            ARRenderer.initialize();
            window.ARRenderer = ARRenderer;
        } else {
            console.warn('[App] ARRenderer module not loaded');
        }
        
        // UI Controller
        if (typeof UIController !== 'undefined') {
            UIController.initialize();
            window.UIController = UIController;
        } else {
            console.warn('[App] UIController module not loaded');
        }
    },
    
    setupErrorHandling: function() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('[App] Uncaught error:', event.error);
        });
        
        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            console.error('[App] Unhandled promise rejection:', event.reason);
        });
    },
    
    setupPerformanceMonitoring: function() {
        // Monitor FPS
        let frames = 0;
        let lastTime = performance.now();
        
        const measureFPS = () => {
            frames++;
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;
            
            if (deltaTime >= 1000) {
                const fps = (frames / deltaTime) * 1000;
                this.currentFPS = Math.round(fps);
                frames = 0;
                lastTime = currentTime;
                
                // Log performance metrics every 5 seconds
                if (Math.random() < 0.05) {
                    console.log(`[App] Performance - FPS: ${this.currentFPS}, Memory: ${this.getMemoryUsage()}`);
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    },
    
    getMemoryUsage: function() {
        if (performance.memory) {
            const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
            const limit = Math.round(performance.memory.jsHeapSizeLimit / 1048576);
            return `${used}MB / ${limit}MB`;
        }
        return 'N/A';
    },
    
    showErrorScreen: function(error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #f8f8f8;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        errorDiv.innerHTML = `
            <div style="text-align: center; max-width: 500px; padding: 24px;">
                <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 12px; color: #c41e3a;">
                    Terjadi Kesalahan
                </h1>
                <p style="color: #666; margin-bottom: 24px;">
                    ${error.message}
                </p>
                <button onclick="location.reload()" style="
                    background: #1a1a1a;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    Muat Ulang Halaman
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    },
    
    // API Methods
    
    getCurrentState: function() {
        return window.UIController ? window.UIController.currentState : 'unknown';
    },
    
    getCurrentBatik: function() {
        return window.UIController ? window.UIController.currentBatikId : null;
    },
    
    getCurrentColor: function() {
        return window.ColorAnalyzer ? window.ColorAnalyzer.getColorCategory() : null;
    },
    
    getTrackingStatus: function() {
        if (!window.BodyTracker) return null;
        
        return {
            isTracking: window.BodyTracker.isTracking,
            quality: window.BodyTracker.getTrackingQuality(),
            isTracked: window.BodyTracker.isTracked()
        };
    },
    
    getSystemStatus: function() {
        return {
            version: this.version,
            initialized: this.initialized,
            state: this.getCurrentState(),
            currentBatik: this.getCurrentBatik(),
            currentColor: this.getCurrentColor(),
            tracking: this.getTrackingStatus(),
            fps: this.currentFPS || 0,
            memory: this.getMemoryUsage()
        };
    },
    
    // Debug mode (for development)
    enableDebugMode: function() {
        console.log('[App] Debug mode enabled');
        
        // Show system status every 10 seconds
        setInterval(() => {
            const status = this.getSystemStatus();
            console.table(status);
        }, 10000);
        
        // Expose to window for console access
        window.AppStatus = () => this.getSystemStatus();
        console.log('Use AppStatus() to check system status');
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.initialize();
        
        // Enable debug mode if in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            App.enableDebugMode();
        }
    });
} else {
    App.initialize();
}

// Expose App to global scope
window.App = App;