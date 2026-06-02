// UI Controller Module
const UIController = {
    currentState: 'standby',
    currentBatikId: null,
    
    initialize: function() {
        console.log('[UIController] Initialized');
        this.setupEventListeners();
        this.populateBatikCarousel();
    },
    
    setupEventListeners: function() {
        // Analyze color button
        const btnAnalyzeColor = document.getElementById('btnAnalyzeColor');
        if (btnAnalyzeColor) {
            btnAnalyzeColor.addEventListener('click', () => {
                if (window.ColorAnalyzer) {
                    window.ColorAnalyzer.startAnalysis();
                }
            });
        }
        
        // Exit button
        const btnExit = document.getElementById('btnExit');
        if (btnExit) {
            btnExit.addEventListener('click', () => {
                this.transitionToStandby();
            });
        }
        
        // Help button
        const btnHelp = document.getElementById('btnHelp');
        if (btnHelp) {
            btnHelp.addEventListener('click', () => {
                this.openHelpModal();
            });
        }
        
        // Close help modal
        const btnCloseHelp = document.getElementById('btnCloseHelp');
        if (btnCloseHelp) {
            btnCloseHelp.addEventListener('click', () => {
                this.closeHelpModal();
            });
        }
        
        // Close info section (if exists)
        const btnCloseInfo = document.getElementById('btnCloseInfo');
        if (btnCloseInfo) {
            btnCloseInfo.addEventListener('click', () => {
                this.closeBatikInfo();
            });
        }
        
        // Reset/Try another batik
        const btnReset = document.getElementById('btnReset');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                this.resetTryOn();
            });
        }
        
        // Custom events
        document.addEventListener('visitorDetected', () => {
            if (window.Detector && window.Detector.isDetected) {
                // Will be triggered by transitionToMainScreen
            }
        });
        
        document.addEventListener('returnToStandby', () => {
            // Cleanup handled by transitionToStandby
        });
    },
    
    populateBatikCarousel: function() {
        const carousel = document.getElementById('batikCarousel');
        carousel.innerHTML = '';
        
        CONFIG.batikCollections.forEach(batik => {
            const item = document.createElement('div');
            item.className = 'batik-item';
            
            let contentHTML = `<div class="batik-item-image">`;
            
            // Use image if available, otherwise use canvas pattern
            if (batik.image) {
                contentHTML += `<img src="${batik.image}" alt="${batik.name}" class="batik-item-img">`;
            } else {
                contentHTML += `<canvas class="batik-canvas" width="110" height="110"></canvas>`;
            }
            
            contentHTML += `</div>
                <div class="batik-item-name">${batik.name}</div>`;
            
            item.innerHTML = contentHTML;
            
            // Draw pattern if no image
            if (!batik.image) {
                const canvas = item.querySelector('.batik-canvas');
                const ctx = canvas.getContext('2d');
                this.drawBatikPreview(ctx, batik.id, 110, 110);
            }
            
            // Single click: select batik
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectBatik(batik.id);
            });
            
            // Double click: open modal with info
            item.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.showMotifModal(batik.id);
            });
            
            // Long press: open modal
            let pressTimer;
            item.addEventListener('mousedown', () => {
                pressTimer = setTimeout(() => {
                    this.showMotifModal(batik.id);
                }, 600);
            });
            
            item.addEventListener('mouseup', () => {
                clearTimeout(pressTimer);
            });
            
            item.addEventListener('mouseleave', () => {
                clearTimeout(pressTimer);
            });
            
            carousel.appendChild(item);
        });
    },
    
    drawBatikPreview: function(ctx, batikId, width, height) {
        // Fill background
        ctx.fillStyle = '#f5f1e8';
        ctx.fillRect(0, 0, width, height);
        
        // Draw pattern based on type
        ctx.strokeStyle = '#c41e3a';
        ctx.lineWidth = 1.5;
        
        switch(batikId) {
            case 'parang':
                // Diagonal lines
                for (let i = -30; i < width + 30; i += 8) {
                    ctx.beginPath();
                    ctx.moveTo(i, -10);
                    ctx.lineTo(i + height, height + 10);
                    ctx.stroke();
                }
                break;
            case 'megamendung':
                // Cloud waves
                ctx.beginPath();
                for (let y = 20; y < height; y += 25) {
                    ctx.moveTo(0, y);
                    for (let x = 0; x < width; x += 5) {
                        ctx.lineTo(x, y + Math.sin(x / 10) * 3);
                    }
                }
                ctx.stroke();
                break;
            case 'dringo':
                // Grid
                for (let i = 0; i < width; i += 15) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i, height);
                    ctx.stroke();
                }
                for (let i = 0; i < height; i += 15) {
                    ctx.beginPath();
                    ctx.moveTo(0, i);
                    ctx.lineTo(width, i);
                    ctx.stroke();
                }
                break;
            case 'kawung':
                // Circles
                ctx.fillStyle = '#d4a57442';
                const positions = [[30, 30], [90, 30], [30, 90], [90, 90]];
                positions.forEach(pos => {
                    ctx.beginPath();
                    ctx.arc(pos[0], pos[1], 12, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                });
                break;
            case 'lasem':
                // Radial pattern
                ctx.strokeStyle = '#d4a574';
                const center = [width/2, height/2];
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(center[0], center[1]);
                    ctx.lineTo(center[0] + Math.cos(angle) * 40, center[1] + Math.sin(angle) * 40);
                    ctx.stroke();
                }
                break;
            case 'buketan':
                // Scattered flowers
                ctx.fillStyle = '#c41e3a66';
                for (let i = 0; i < 8; i++) {
                    const x = Math.random() * (width - 20) + 10;
                    const y = Math.random() * (height - 20) + 10;
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
        }
    },
    
    selectBatik: function(batikId) {
        console.log(`[UIController] Batik selected: ${batikId}`);
        
        this.currentBatikId = batikId;
        
        // Update visual selection
        document.querySelectorAll('.batik-item').forEach(item => {
            item.classList.remove('active');
        });
        
        event.target.closest('.batik-item').classList.add('active');
        
        // Start AR rendering
        if (window.ARRenderer) {
            window.ARRenderer.setBatik(batikId);
            if (!window.ARRenderer.isRendering) {
                window.ARRenderer.startRendering(batikId);
            }
        }
        
        // Show batik info
        this.showBatikInfo(batikId);
        
        // Reset detector timeout to keep system active
        if (window.Detector) {
            window.Detector.resetTimeout();
        }
    },
    
    displayColorAnalysisResult: function(colorCategory) {
        const color = CONFIG.getColorById(colorCategory.id);
        if (!color) return;
        
        const badge = document.getElementById('colorBadge');
        const nameEl = document.getElementById('colorName');
        const descEl = document.getElementById('colorDesc');
        const section = document.getElementById('colorAnalysisResult');
        
        badge.style.backgroundColor = color.hexColor;
        nameEl.textContent = color.name;
        descEl.textContent = color.description;
        
        section.classList.remove('hidden');
        
        this.showToast(`Analisis selesai: ${color.name}`);
    },
    
    showBatikInfo: function(batikId) {
        const batik = CONFIG.getBatikById(batikId);
        if (!batik) return;
        
        document.getElementById('detailName').textContent = batik.name;
        document.getElementById('detailOrigin').textContent = batik.origin;
        document.getElementById('detailHistory').textContent = batik.history;
        document.getElementById('detailPhilosophy').textContent = batik.philosophy;
        
        document.getElementById('batikInfoSection').classList.remove('hidden');
        
        // Reset detector timeout
        if (window.Detector) {
            window.Detector.resetTimeout();
        }
    },
    
    closeBatikInfo: function() {
        document.getElementById('batikInfoSection').classList.add('hidden');
    },
    
    showLoadingIndicator: function() {
        document.getElementById('loadingIndicator').classList.remove('hidden');
    },
    
    hideLoadingIndicator: function() {
        document.getElementById('loadingIndicator').classList.add('hidden');
    },
    
    showToast: function(message) {
        const toast = document.getElementById('toastNotification');
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        // Auto-hide after duration
        setTimeout(() => {
            toast.classList.add('hidden');
        }, CONFIG.ui.toastDuration);
    },
    
    openHelpModal: function() {
        document.getElementById('helpModal').classList.remove('hidden');
    },
    
    closeHelpModal: function() {
        document.getElementById('helpModal').classList.add('hidden');
    },
    
    showMotifModal: function(batikId) {
        const batik = CONFIG.getBatikById(batikId);
        if (!batik) return;
        
        console.log(`[UIController] Opening motif modal for: ${batikId}`);
        
        // Set modal content
        document.getElementById('motifModalTitle').textContent = batik.name;
        document.getElementById('motifModalOrigin').textContent = batik.origin;
        document.getElementById('motifModalHistory').textContent = batik.history;
        document.getElementById('motifModalPhilosophy').textContent = batik.philosophy;
        
        // Draw pattern in modal image
        const imageContainer = document.getElementById('motifModalImage');
        imageContainer.innerHTML = '';
        
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 280;
        const ctx = canvas.getContext('2d');
        
        // Draw larger preview
        this.drawBatikPreview(ctx, batikId, 600, 280);
        
        imageContainer.appendChild(canvas);
        
        // Show modal
        document.getElementById('motifModal').classList.remove('hidden');
        
        // Reset detector timeout
        if (window.Detector) {
            window.Detector.resetTimeout();
        }
    },
    
    closeMotifModal: function() {
        document.getElementById('motifModal').classList.add('hidden');
    },
    
    transitionToMainScreen: function() {
        console.log('[UIController] Transitioning to main screen');
        
        // Update simulator buttons
        const btnOff = document.getElementById('btnSimulatorOff');
        const btnOn = document.getElementById('btnSimulatorOn');
        const statusEl = document.getElementById('simulatorStatus');
        
        if (btnOff) {
            btnOff.classList.remove('active');
            btnOn.classList.add('active');
            statusEl.textContent = 'Status: Active (Visitor Detected)';
        }
        
        // Ensure DOM elements exist
        const standbyScreen = document.getElementById('standbyScreen');
        const mainScreen = document.getElementById('mainScreen');
        
        if (!standbyScreen || !mainScreen) {
            console.error('[UIController] Required DOM elements not found');
            return;
        }
        
        this.currentState = 'active';
        
        // Hide standby, show main
        standbyScreen.classList.remove('screen-active');
        mainScreen.classList.add('screen-active');
        
        console.log('[UIController] Transition complete');
        
        // Request camera access
        this.requestCameraAccess();
    },
    
    transitionToStandby: function() {
        console.log('[UIController] Transitioning to standby');
        
        // Update simulator buttons
        const btnOff = document.getElementById('btnSimulatorOff');
        const btnOn = document.getElementById('btnSimulatorOn');
        const statusEl = document.getElementById('simulatorStatus');
        
        if (btnOff && btnOn && statusEl) {
            btnOff.classList.add('active');
            btnOn.classList.remove('active');
            statusEl.textContent = 'Status: Standby (No Visitor)';
        }
        
        this.currentState = 'standby';
        
        // Stop all active processes
        if (window.ARRenderer) {
            window.ARRenderer.stopRendering();
        }
        
        if (window.BodyTracker) {
            window.BodyTracker.reset();
        }
        
        if (window.ColorAnalyzer) {
            window.ColorAnalyzer.reset();
        }
        
        // Stop camera
        this.stopCamera();
        
        // Reset UI
        this.resetUI();
        
        // Show standby screen
        const mainScreen = document.getElementById('mainScreen');
        const standbyScreen = document.getElementById('standbyScreen');
        if (mainScreen) mainScreen.classList.remove('screen-active');
        if (standbyScreen) standbyScreen.classList.add('screen-active');
    },
    
    resetUI: function() {
        // Clear selections
        document.querySelectorAll('.batik-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const colorResult = document.getElementById('colorAnalysisResult');
        if (colorResult) {
            colorResult.classList.add('hidden');
        }
        
        const batikInfoSection = document.getElementById('batikInfoSection');
        if (batikInfoSection) {
            batikInfoSection.classList.add('hidden');
        }
        
        this.currentBatikId = null;
    },
    
    resetTryOn: function() {
        console.log('[UIController] Reset - trying another batik');
        
        if (window.ARRenderer) {
            window.ARRenderer.stopRendering();
        }
        
        this.closeBatikInfo();
        this.currentBatikId = null;
        
        this.showToast('Pilih motif batik lainnya untuk dicoba');
    },
    
    requestCameraAccess: async function() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: CONFIG.camera.width,
                    height: CONFIG.camera.height,
                    facingMode: CONFIG.camera.facingMode
                },
                audio: false
            });
            
            const video = document.getElementById('cameraFeed');
            video.srcObject = stream;
            
            console.log('[UIController] Camera access granted');
            
            // Start body tracking once camera is loaded
            video.onloadedmetadata = () => {
                if (window.BodyTracker) {
                    window.BodyTracker.startTracking();
                }
            };
            
        } catch (error) {
            console.error('[UIController] Camera access error:', error);
            this.showToast('Gagal mengakses kamera. Silakan coba lagi.');
            
            setTimeout(() => {
                this.transitionToStandby();
            }, 3000);
        }
    },
    
    stopCamera: function() {
        const video = document.getElementById('cameraFeed');
        if (video && video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            video.srcObject = null;
        }
    }
};

// Initialize when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        UIController.initialize();
    });
} else {
    UIController.initialize();
}

// Store reference globally
window.UIController = UIController;
