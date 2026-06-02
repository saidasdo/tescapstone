// Test Suite for Batik AR Application
// Usage: Include in console during development

const TestSuite = {
    results: [],
    
    // Test 1: Module Initialization
    testModuleInitialization: function() {
        console.log('\n%c=== Test 1: Module Initialization ===', 'color: blue; font-weight: bold;');
        
        const checks = [
            { name: 'Config', pass: typeof CONFIG !== 'undefined' },
            { name: 'Detector', pass: typeof Detector !== 'undefined' },
            { name: 'ColorAnalyzer', pass: typeof ColorAnalyzer !== 'undefined' },
            { name: 'BodyTracker', pass: typeof BodyTracker !== 'undefined' },
            { name: 'ARRenderer', pass: typeof ARRenderer !== 'undefined' },
            { name: 'UIController', pass: typeof UIController !== 'undefined' },
            { name: 'App', pass: typeof App !== 'undefined' }
        ];
        
        checks.forEach(check => {
            console.log(`${check.pass ? '[PASS]' : '[FAIL]'} ${check.name}`);
            this.results.push(check);
        });
        
        return checks.every(c => c.pass);
    },
    
    // Test 2: Configuration
    testConfiguration: function() {
        console.log('\n%c=== Test 2: Configuration ===', 'color: blue; font-weight: bold;');
        
        const checks = [
            { name: 'Batik Collections', pass: CONFIG.batikCollections.length > 0 },
            { name: 'Personal Colors', pass: Object.keys(CONFIG.personalColors).length === 4 },
            { name: 'Camera Config', pass: CONFIG.camera.width > 0 && CONFIG.camera.height > 0 }
        ];
        
        checks.forEach(check => {
            console.log(`${check.pass ? '[PASS]' : '[FAIL]'} ${check.name}`);
            if (check.pass && check.name === 'Batik Collections') {
                console.log(`   Found ${CONFIG.batikCollections.length} batik collections`);
            }
        });
        
        return checks.every(c => c.pass);
    },
    
    // Test 3: DOM Elements
    testDOMElements: function() {
        console.log('\n%c=== Test 3: DOM Elements ===', 'color: blue; font-weight: bold;');
        
        const elements = [
            'standbyScreen', 'mainScreen', 'cameraFeed', 'arCanvas',
            'btnAnalyzeColor', 'btnExit', 'btnHelp', 'batikCarousel',
            'colorAnalysisResult', 'batikInfoSection'
        ];
        
        let allPresent = true;
        elements.forEach(id => {
            const present = document.getElementById(id) !== null;
            console.log(`${present ? '[PASS]' : '[FAIL]'} #${id}`);
            if (!present) allPresent = false;
        });
        
        return allPresent;
    },
    
    // Test 4: Detector Functionality
    testDetector: function() {
        console.log('\n%c=== Test 4: Detector Functionality ===', 'color: blue; font-weight: bold;');
        
        console.log(`[INFO] Current detection status: ${Detector.isDetected ? 'DETECTED' : 'NOT DETECTED'}`);
        console.log(`[INFO] Distance range: ${Detector.isInIdealRange() ? 'IDEAL' : 'OUT OF RANGE'}`);
        
        // Simulate detection trigger
        console.log('[INFO] Simulating visitor detection...');
        Detector.onDetectionTriggered();
        
        const detected = Detector.isDetected;
        console.log(`${detected ? '[PASS]' : '[FAIL]'} Detection triggered`);
        
        return detected;
    },
    
    // Test 5: Color Analyzer
    testColorAnalyzer: function() {
        console.log('\n%c=== Test 5: Color Analyzer ===', 'color: blue; font-weight: bold;');
        
        console.log('[INFO] Starting color analysis...');
        ColorAnalyzer.startAnalysis();
        
        // Wait for analysis to complete
        setTimeout(() => {
            const color = ColorAnalyzer.getColorCategory();
            const pass = color !== null;
            console.log(`${pass ? '[PASS]' : '[FAIL]'} Color analysis completed`);
            if (pass) {
                console.log(`   Color: ${color.name} (${color.hexColor})`);
                console.log(`   Confidence: ${(ColorAnalyzer.analysisConfidence * 100).toFixed(1)}%`);
            }
        }, 2000);
        
        return true; // Async test
    },
    
    // Test 6: Body Tracker
    testBodyTracker: function() {
        console.log('\n%c=== Test 6: Body Tracker ===', 'color: blue; font-weight: bold;');
        
        console.log('[INFO] Starting body tracking...');
        BodyTracker.startTracking();
        
        setTimeout(() => {
            const quality = BodyTracker.getTrackingQuality();
            const isTracked = BodyTracker.isTracked();
            
            console.log(`[${isTracked ? 'PASS' : 'INFO'}] Tracking quality: ${(quality * 100).toFixed(1)}%`);
            console.log(`[${isTracked ? 'PASS' : 'INFO'}] Is tracked: ${isTracked}`);
            
            const landmarks = BodyTracker.getLandmarks();
            if (landmarks) {
                console.log(`   Torso center: ${landmarks.leftShoulder.x.toFixed(2)}, ${landmarks.leftShoulder.y.toFixed(2)}`);
                console.log(`   Shoulder width: ${BodyTracker.getShoulderWidth().toFixed(3)}`);
            }
        }, 1000);
        
        return true; // Async test
    },
    
    // Test 7: AR Renderer
    testARRenderer: function() {
        console.log('\n%c=== Test 7: AR Renderer ===', 'color: blue; font-weight: bold;');
        
        const batikId = CONFIG.batikCollections[0].id;
        console.log(`[INFO] Starting AR rendering for: ${batikId}`);
        
        ARRenderer.startRendering(batikId);
        
        setTimeout(() => {
            const isRendering = ARRenderer.isRendering;
            console.log(`${isRendering ? '[PASS]' : '[FAIL]'} AR rendering active`);
            console.log(`   Current batik: ${ARRenderer.currentBatikId}`);
        }, 1000);
        
        return true;
    },
    
    // Test 8: UI State Management
    testUIState: function() {
        console.log('\n%c=== Test 8: UI State Management ===', 'color: blue; font-weight: bold;');
        
        const initialState = UIController.currentState;
        console.log(`[INFO] Initial state: ${initialState}`);
        
        // Simulate state transitions
        UIController.transitionToMainScreen();
        const activeState = UIController.currentState;
        console.log(`${activeState === 'active' ? '[PASS]' : '[FAIL]'} Transition to active`);
        
        // Return to standby
        UIController.transitionToStandby();
        const standbyState = UIController.currentState;
        console.log(`${standbyState === 'standby' ? '[PASS]' : '[FAIL]'} Transition to standby`);
        
        return activeState === 'active' && standbyState === 'standby';
    },
    
    // Test 9: Batik Selection
    testBatikSelection: function() {
        console.log('\n%c=== Test 9: Batik Selection ===', 'color: blue; font-weight: bold;');
        
        const batiks = CONFIG.batikCollections;
        console.log(`[INFO] Available batiks: ${batiks.length}`);
        
        let allPass = true;
        batiks.forEach((batik, index) => {
            const exists = CONFIG.getBatikById(batik.id) !== undefined;
            console.log(`${exists ? '[PASS]' : '[FAIL]'} Batik ${index + 1}: ${batik.name}`);
            if (!exists) allPass = false;
        });
        
        return allPass;
    },
    
    // Test 10: Performance Metrics
    testPerformanceMetrics: function() {
        console.log('\n%c=== Test 10: Performance Metrics ===', 'color: blue; font-weight: bold;');
        
        const status = App.getSystemStatus();
        
        console.log(`[INFO] Application Status:`);
        console.log(`   Version: ${status.version}`);
        console.log(`   FPS: ${status.fps}`);
        console.log(`   Memory: ${status.memory}`);
        console.log(`   State: ${status.state}`);
        
        if (status.tracking) {
            console.log(`   Tracking Quality: ${(status.tracking.quality * 100).toFixed(1)}%`);
        }
        
        return true;
    },
    
    // Run all tests
    runAll: function() {
        console.log('%c=== BATIK AR TEST SUITE ===', 'color: green; font-size: 16px; font-weight: bold;');
        console.log('Running comprehensive tests...\n');
        
        try {
            this.testModuleInitialization();
            this.testConfiguration();
            this.testDOMElements();
            this.testDetector();
            this.testColorAnalyzer();
            this.testBodyTracker();
            this.testARRenderer();
            this.testUIState();
            this.testBatikSelection();
            this.testPerformanceMetrics();
            
            console.log('%c=== TEST SUITE COMPLETED ===', 'color: green; font-weight: bold;');
            console.log(`Total checks: ${this.results.length}`);
            
        } catch (error) {
            console.error('[ERROR] Test suite failed:', error);
        }
    }
};

// Run tests
// Usage: Paste in console and type: TestSuite.runAll()

// Individual test access
console.log(`%c[Test Suite Ready]%c
Available tests:
- TestSuite.testModuleInitialization()
- TestSuite.testConfiguration()
- TestSuite.testDOMElements()
- TestSuite.testDetector()
- TestSuite.testColorAnalyzer()
- TestSuite.testBodyTracker()
- TestSuite.testARRenderer()
- TestSuite.testUIState()
- TestSuite.testBatikSelection()
- TestSuite.testPerformanceMetrics()
- TestSuite.runAll()
`, 'color: green; font-weight: bold;', 'color: gray;');

// Expose to global scope
window.TestSuite = TestSuite;
