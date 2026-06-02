// Color Analysis Module
const ColorAnalyzer = {
    isAnalyzing: false,
    currentColorCategory: null,
    analysisConfidence: 0,
    
    initialize: function() {
        console.log('[ColorAnalyzer] Initialized');
    },
    
    startAnalysis: function() {
        if (this.isAnalyzing) {
            console.log('[ColorAnalyzer] Analysis already in progress');
            return;
        }
        
        this.isAnalyzing = true;
        console.log('[ColorAnalyzer] Starting personal color analysis');
        
        // Show loading indicator
        if (window.UIController) {
            window.UIController.showLoadingIndicator();
        }
        
        // Simulate face detection and color analysis
        // In production, this would use FaRL for face parsing and ResNet18 for classification
        setTimeout(() => {
            this.performAnalysis();
        }, 1500);
    },
    
    performAnalysis: function() {
        try {
            const video = document.getElementById('cameraFeed');
            
            if (!video || !video.srcObject) {
                console.warn('[ColorAnalyzer] Camera feed not available');
                this.endAnalysis(false);
                return;
            }
            
            // Simulate face detection from video frame
            // Extract skin tone and classify into season
            const colorCategory = this.classifySkinTone();
            
            this.currentColorCategory = colorCategory.id;
            this.analysisConfidence = colorCategory.confidence;
            
            console.log(`[ColorAnalyzer] Analysis complete: ${colorCategory.name} (${colorCategory.confidence * 100}%)`);
            
            // Trigger UI update
            if (window.UIController) {
                window.UIController.displayColorAnalysisResult(colorCategory);
            }
            
            // Dispatch event
            const event = new CustomEvent('colorAnalysisComplete', {
                detail: {
                    colorCategory: colorCategory.id,
                    confidence: colorCategory.confidence
                }
            });
            document.dispatchEvent(event);
            
            this.endAnalysis(true);
        } catch (error) {
            console.error('[ColorAnalyzer] Error during analysis:', error);
            this.endAnalysis(false);
        }
    },
    
    classifySkinTone: function() {
        // Simulate AI classification
        // In production, this would use FaRL face parsing and ResNet18
        
        const categories = [
            { id: 'spring', name: 'Spring', confidence: 0.25 },
            { id: 'summer', name: 'Summer', confidence: 0.30 },
            { id: 'autumn', name: 'Autumn', confidence: 0.35 },
            { id: 'winter', name: 'Winter', confidence: 0.10 }
        ];
        
        // Random selection with weighted probabilities
        const random = Math.random();
        let sum = 0;
        
        for (let category of categories) {
            sum += category.confidence;
            if (random <= sum) {
                // Add some confidence variance
                category.confidence = Math.min(0.99, 0.75 + Math.random() * 0.24);
                return category;
            }
        }
        
        return categories[0];
    },
    
    endAnalysis: function(success) {
        this.isAnalyzing = false;
        
        // Hide loading indicator
        if (window.UIController) {
            window.UIController.hideLoadingIndicator();
        }
        
        if (!success) {
            if (window.UIController) {
                window.UIController.showToast('Analisis gagal. Silakan coba lagi.');
            }
        }
        
        // Reset detector timeout to keep system active
        if (window.Detector) {
            window.Detector.resetTimeout();
        }
    },
    
    getColorCategory: function() {
        if (!this.currentColorCategory) {
            return null;
        }
        return CONFIG.getColorById(this.currentColorCategory);
    },
    
    getRecommendedBatiks: function() {
        if (!this.currentColorCategory) {
            return CONFIG.batikCollections;
        }
        
        // Return batiks matching the color category
        return CONFIG.batikCollections.filter(batik => 
            batik.colorCategory === this.currentColorCategory
        );
    },
    
    reset: function() {
        this.currentColorCategory = null;
        this.analysisConfidence = 0;
        console.log('[ColorAnalyzer] Reset');
    }
};

// Initialize when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ColorAnalyzer.initialize();
    });
} else {
    ColorAnalyzer.initialize();
}

// Expose to global scope
window.ColorAnalyzer = ColorAnalyzer;
