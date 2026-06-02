// AR Rendering Module
const ARRenderer = {
    canvas: null,
    ctx: null,
    currentBatikId: null,
    isRendering: false,
    frameRate: 30,
    lastUpdateTime: 0,
    
    initialize: function() {
        console.log('[ARRenderer] Initialized');
        
        // Create canvas for AR overlay
        const container = document.getElementById('arCanvas');
        this.canvas = document.createElement('canvas');
        container.appendChild(this.canvas);
        
        // Set canvas size to match video
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.ctx = this.canvas.getContext('2d');
    },
    
    resizeCanvas: function() {
        const video = document.getElementById('cameraFeed');
        if (!video) return;
        
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight;
        
        console.log(`[ARRenderer] Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
    },
    
    startRendering: function(batikId) {
        if (this.isRendering) {
            console.log('[ARRenderer] Rendering already active');
            return;
        }
        
        this.currentBatikId = batikId;
        this.isRendering = true;
        
        console.log(`[ARRenderer] Starting AR rendering for batik: ${batikId}`);
        
        // Start body tracking
        if (window.BodyTracker) {
            window.BodyTracker.startTracking();
        }
        
        this.render();
    },
    
    stopRendering: function() {
        this.isRendering = false;
        this.currentBatikId = null;
        
        if (window.BodyTracker) {
            window.BodyTracker.stopTracking();
        }
        
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        console.log('[ARRenderer] AR rendering stopped');
    },
    
    render: function() {
        if (!this.isRendering) return;
        
        const now = Date.now();
        const deltaTime = now - this.lastUpdateTime;
        
        // Control frame rate
        if (deltaTime < 1000 / this.frameRate) {
            requestAnimationFrame(() => this.render());
            return;
        }
        
        this.lastUpdateTime = now;
        
        try {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Get current pose landmarks
            if (!window.BodyTracker || !window.BodyTracker.isTracked()) {
                this.drawTrackingIndicator();
                requestAnimationFrame(() => this.render());
                return;
            }
            
            const landmarks = window.BodyTracker.getLandmarks();
            
            // Draw batik overlay on detected body
            this.drawBatikOverlay(landmarks);
            
            // Draw body skeleton for debugging (optional)
            // this.drawBodySkeleton(landmarks);
            
        } catch (error) {
            console.error('[ARRenderer] Rendering error:', error);
        }
        
        requestAnimationFrame(() => this.render());
    },
    
    drawBatikOverlay: function(landmarks) {
        const torsoCenter = window.BodyTracker.getTorsoCenter();
        const shoulderWidth = window.BodyTracker.getShoulderWidth();
        
        // Scale based on shoulder width
        const scale = shoulderWidth * this.canvas.width * 1.5;
        
        const x = torsoCenter.x * this.canvas.width;
        const y = torsoCenter.y * this.canvas.height;
        
        // Draw batik pattern representation
        this.drawBatikPattern(x, y, scale);
        
        // Draw batik borders/outline
        this.drawBatikOutline(x, y, scale);
    },
    
    drawBatikPattern: function(x, y, scale) {
        // Simulate batik pattern with gradient and texture
        
        // Get current batik info
        const batik = CONFIG.getBatikById(this.currentBatikId);
        if (!batik) return;
        
        // Draw semi-transparent overlay
        const gradient = this.ctx.createLinearGradient(x - scale/2, y - scale/2, x + scale/2, y + scale/2);
        gradient.addColorStop(0, 'rgba(196, 30, 58, 0.15)');
        gradient.addColorStop(0.5, 'rgba(196, 30, 58, 0.25)');
        gradient.addColorStop(1, 'rgba(196, 30, 58, 0.15)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - scale/2, y - scale/2, scale, scale);
        
        // Draw pattern details
        this.drawPatternDetails(x, y, scale);
    },
    
    drawPatternDetails: function(x, y, scale) {
        // Draw geometric pattern based on batik type
        const batik = CONFIG.getBatikById(this.currentBatikId);
        if (!batik) return;
        
        this.ctx.strokeStyle = 'rgba(196, 30, 58, 0.6)';
        this.ctx.lineWidth = Math.max(1, scale / 100);
        
        switch(batik.id) {
            case 'parang':
                this.drawParangPattern(x, y, scale);
                break;
            case 'megamendung':
                this.drawMegamendungPattern(x, y, scale);
                break;
            case 'dringo':
                this.drawDringoPattern(x, y, scale);
                break;
            case 'kawung':
                this.drawKawungPattern(x, y, scale);
                break;
            case 'lasem':
                this.drawLasemPattern(x, y, scale);
                break;
            case 'buketan':
                this.drawBuketanPattern(x, y, scale);
                break;
        }
    },
    
    drawParangPattern: function(x, y, scale) {
        // Draw diagonal lines representing Parang
        const spacing = scale / 15;
        this.ctx.beginPath();
        for (let i = -5; i < 5; i++) {
            const startX = x - scale/2 + i * spacing;
            const startY = y - scale/2;
            const endX = x + scale/2 + i * spacing;
            const endY = y + scale/2;
            
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
        }
        this.ctx.stroke();
    },
    
    drawMegamendungPattern: function(x, y, scale) {
        // Draw wavy cloud-like pattern
        const step = scale / 20;
        this.ctx.beginPath();
        
        for (let i = 0; i < 3; i++) {
            const centerY = y - scale/2 + (i + 1) * scale/4;
            this.ctx.moveTo(x - scale/2, centerY);
            
            for (let j = 0; j < 10; j++) {
                const xPos = x - scale/2 + j * step;
                const yOffset = Math.sin(j * 0.5) * step;
                this.ctx.lineTo(xPos, centerY + yOffset);
            }
        }
        this.ctx.stroke();
    },
    
    drawDringoPattern: function(x, y, scale) {
        // Draw geometric grid pattern
        const cellSize = scale / 8;
        this.ctx.beginPath();
        
        for (let i = 0; i < 8; i++) {
            const startX = x - scale/2;
            const startY = y - scale/2 + i * cellSize;
            
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(x + scale/2, startY);
        }
        
        for (let j = 0; j < 8; j++) {
            const startY = y - scale/2;
            const startX = x - scale/2 + j * cellSize;
            
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(startX, y + scale/2);
        }
        this.ctx.stroke();
    },
    
    drawKawungPattern: function(x, y, scale) {
        // Draw circular flower pattern
        const circleRadius = scale / 10;
        this.ctx.fillStyle = 'rgba(196, 30, 58, 0.3)';
        
        const positions = [
            { x: -1, y: -1 },
            { x: 1, y: -1 },
            { x: -1, y: 1 },
            { x: 1, y: 1 }
        ];
        
        for (let pos of positions) {
            const cx = x + pos.x * circleRadius * 2;
            const cy = y + pos.y * circleRadius * 2;
            
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
    },
    
    drawLasemPattern: function(x, y, scale) {
        // Draw radial pattern with flowers
        const petalCount = 6;
        const petalLength = scale / 4;
        
        this.ctx.beginPath();
        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            const endX = x + Math.cos(angle) * petalLength;
            const endY = y + Math.sin(angle) * petalLength;
            
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(endX, endY);
        }
        this.ctx.stroke();
    },
    
    drawBuketanPattern: function(x, y, scale) {
        // Draw scattered flower bouquet pattern
        const flowerCount = 12;
        this.ctx.fillStyle = 'rgba(196, 30, 58, 0.2)';
        
        for (let i = 0; i < flowerCount; i++) {
            const angle = (i / flowerCount) * Math.PI * 2;
            const distance = scale / 3;
            
            const fx = x + Math.cos(angle) * distance;
            const fy = y + Math.sin(angle) * distance;
            
            this.ctx.beginPath();
            this.ctx.arc(fx, fy, scale / 30, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
    },
    
    drawBatikOutline: function(x, y, scale) {
        // Draw visible outline around batik overlay
        this.ctx.strokeStyle = 'rgba(196, 30, 58, 0.8)';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.rect(x - scale/2, y - scale/2, scale, scale);
        this.ctx.stroke();
    },
    
    drawBodySkeleton: function(landmarks) {
        // Debug visualization of body skeleton
        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
        this.ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
        this.ctx.lineWidth = 2;
        
        // Draw connections
        const connections = [
            ['leftShoulder', 'rightShoulder'],
            ['leftShoulder', 'leftElbow'],
            ['rightShoulder', 'rightElbow'],
            ['leftElbow', 'leftWrist'],
            ['rightElbow', 'rightWrist'],
            ['leftShoulder', 'leftHip'],
            ['rightShoulder', 'rightHip'],
            ['leftHip', 'rightHip'],
            ['leftHip', 'leftKnee'],
            ['rightHip', 'rightKnee'],
            ['leftKnee', 'leftAnkle'],
            ['rightKnee', 'rightAnkle']
        ];
        
        for (let [p1, p2] of connections) {
            const point1 = landmarks[p1];
            const point2 = landmarks[p2];
            
            if (point1 && point2) {
                this.ctx.beginPath();
                this.ctx.moveTo(point1.x * this.canvas.width, point1.y * this.canvas.height);
                this.ctx.lineTo(point2.x * this.canvas.width, point2.y * this.canvas.height);
                this.ctx.stroke();
            }
        }
        
        // Draw keypoints
        for (let key in landmarks) {
            const point = landmarks[key];
            if (point && point.x !== undefined) {
                this.ctx.beginPath();
                this.ctx.arc(point.x * this.canvas.width, point.y * this.canvas.height, 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    },
    
    drawTrackingIndicator: function() {
        // Show indicator when waiting for body tracking
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.font = 'italic 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Mendeteksi tubuh Anda...', this.canvas.width / 2, this.canvas.height / 2);
    },
    
    updatePose: function(landmarks) {
        // Update pose landmarks (called by body tracker)
        // Additional pose processing can be done here if needed
    },
    
    setBatik: function(batikId) {
        this.currentBatikId = batikId;
        console.log(`[ARRenderer] Batik changed to: ${batikId}`);
    }
};

// Initialize when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ARRenderer.initialize();
    });
} else {
    ARRenderer.initialize();
}

// Expose to global scope
window.ARRenderer = ARRenderer;
