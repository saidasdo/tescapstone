// User Presence Detector Module
const Detector = {
    isDetected: false,
    detectionTimeout: null,
    allowAutoTrigger: true,
    
    initialize: function() {
        console.log('[Detector] Initialized');
        // Simulate PIR sensor detection
        this.simulatePIRDetection();
    },
    
    simulatePIRDetection: function() {
        // In production, this would connect to ESP32 via USB or WebSocket
        // For prototype, we'll simulate detection on user interaction
        
        // Auto-detect after 2 seconds on page load (prototype mode)
        setTimeout(() => {
            if (!this.isDetected && this.allowAutoTrigger) {
                console.log('[Detector] Auto-triggering after 2 seconds');
                this.onDetectionTriggered();
            }
        }, 2000);
        
        // Allow manual trigger with click or touch
        const triggerDetection = () => {
            if (!this.isDetected) {
                console.log('[Detector] Manual trigger by user interaction');
                this.onDetectionTriggered();
            }
        };
        
        document.addEventListener('click', triggerDetection);
        document.addEventListener('touchstart', triggerDetection);
        
        // Also trigger on standby screen click
        const standbyScreen = document.getElementById('standbyScreen');
        if (standbyScreen) {
            standbyScreen.addEventListener('click', triggerDetection);
            standbyScreen.addEventListener('touchstart', triggerDetection);
        }
    },
    
    onDetectionTriggered: function() {
        console.log('[Detector] Visitor detected');
        if (this.isDetected) {
            console.log('[Detector] Already detected, skipping');
            return;
        }
        
        this.isDetected = true;
        
        // Dispatch custom event
        const event = new CustomEvent('visitorDetected', {
            detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(event);
        
        // Notify UI
        if (window.UIController) {
            window.UIController.transitionToMainScreen();
        }
        
        // Reset detection after timeout (visitor left)
        this.setStandbyTimeout();
    },
    
    setStandbyTimeout: function() {
        clearTimeout(this.detectionTimeout);
        this.detectionTimeout = setTimeout(() => {
            this.resetToStandby();
        }, CONFIG.ui.standbyTimeout);
    },
    
    resetToStandby: function() {
        console.log('[Detector] No activity detected, returning to standby');
        this.isDetected = false;
        
        // Disable auto-trigger for 1.5 seconds to prevent immediate re-trigger
        this.allowAutoTrigger = false;
        setTimeout(() => {
            this.allowAutoTrigger = true;
            console.log('[Detector] Auto-trigger re-enabled');
        }, 1500);
        
        const event = new CustomEvent('returnToStandby', {
            detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(event);
        
        if (window.UIController) {
            window.UIController.transitionToStandby();
        }
    },
    
    resetTimeout: function() {
        // Called when user is actively interacting
        if (this.isDetected) {
            this.setStandbyTimeout();
        }
    },
    
    // Simulate distance sensor
    getDistance: function() {
        // In real setup, this would return actual sensor distance
        // Returns value between 0-300 cm
        return Math.random() * 300;
    },
    
    // Check if visitor is in ideal range (1-3 meters)
    isInIdealRange: function() {
        const distance = this.getDistance();
        return distance >= 100 && distance <= 300;
    }
};

// Initialize detector when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Detector.initialize();
    });
} else {
    Detector.initialize();
}

// Expose to global scope
window.Detector = Detector;
