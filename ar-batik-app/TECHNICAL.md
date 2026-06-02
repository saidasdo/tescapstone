# Dokumentasi Teknis - Batik AR Virtual Try-On

Dokumentasi lengkap untuk implementasi teknis sistem AR Virtual Try-On Batik di Museum Batik Yogyakarta.

## 1. Stack Teknologi

### Frontend
- **HTML5**: Struktur aplikasi
- **CSS3**: Styling dengan custom properties (CSS Variables)
- **JavaScript ES6+**: Logika aplikasi
- **Canvas API**: Rendering AR visual
- **WebRTC**: Camera access
- **WebGL**: 3D rendering (future enhancement)

### Backend (Optional)
- **Node.js + Express**: REST API server
- **PostgreSQL/MongoDB**: Database batik collection
- **Multer**: File upload untuk aset
- **JWT**: Authentication (untuk admin)

### Hardware
- **ESP32**: Microcontroller untuk PIR sensor
- **PIR HC-SR501**: Motion sensor detection
- **Kamera USB/Built-in**: Video input
- **Smart Mirror/Display**: Output display
- **Mini PC/Workstation**: Processing unit

## 2. Alur Data (Data Flow)

```
┌─────────────┐
│   Visitor   │ <- Deteksi kehadiran
└──────┬──────┘
       │
       ▼
┌──────────────────────────────┐
│     PIR Sensor (ESP32)       │
│ - Deteksi gerakan            │
│ - Trigger aktivasi           │
└──────────────┬───────────────┘
               │ (USB Serial / WebSocket)
               ▼
┌──────────────────────────────┐
│   Detector Module (Browser)  │
│ - Parse signal dari ESP32    │
│ - Trigger UI transition      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Camera Feed (getUserMedia)  │
│ - Capture video stream       │
│ - Pass ke analyzer modules   │
└──────┬───────────┬───────────┘
       │           │
       ▼           ▼
┌─────────────┐  ┌────────────────────┐
│Color        │  │  Body Tracker      │
│Analyzer     │  │  - Pose Detection  │
│             │  │  - Landmark Track  │
└──────┬──────┘  └────────┬───────────┘
       │                  │
       │  Color Category  │  Pose Landmarks
       │                  │
       └────────┬─────────┘
                │
                ▼
        ┌──────────────────────┐
        │   AR Renderer        │
        │  - Draw overlay      │
        │  - Update patterns   │
        │  - Render canvas     │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Display Output     │
        │  - Smart Mirror      │
        │  - Interactive Screen│
        └──────────────────────┘
```

## 3. Arsitektur Modul

### Module: Detector (PIR Simulation)
```javascript
// State: isDetected, detectionTimeout
// Methods:
- initialize()           // Setup listener
- simulatePIRDetection() // Listen for signals
- onDetectionTriggered() // Handle detection
- resetToStandby()       // Return to idle
- getDistance()          // Get sensor distance
- isInIdealRange()       // Check distance range
```

### Module: ColorAnalyzer (Personal Color)
```javascript
// State: isAnalyzing, currentColorCategory, analysisConfidence
// Methods:
- startAnalysis()        // Begin color detection
- performAnalysis()      // Process face/skin
- classifySkinTone()     // ML classification
- getColorCategory()     // Get result
- getRecommendedBatiks() // Filter by color
- reset()                // Clear state
```

**Production Integration:**
```
Face Input → FaRL Face Parsing → Extract Skin Region
          → ResNet18 Classification → Color Category
          → Confidence Score
```

### Module: BodyTracker (Pose Detection)
```javascript
// State: isTracking, currentLandmarks, trackingQuality
// Methods:
- startTracking()      // Begin pose detection
- stopTracking()       // End tracking
- detectPose()         // Extract pose landmarks
- addNaturalMovement() // Simulate variation
- getShoulderWidth()   // Calculate scale
- getTorsoCenter()     // Get position
- isTracked()          // Check quality
```

**Production Integration:**
```
Video Frame → MediaPipe/BlazePose Model
          → 33 Body Landmarks
          → Confidence Scores
          → Position/Scale Calculation
```

### Module: ARRenderer (Visualization)
```javascript
// State: canvas, currentBatikId, isRendering
// Methods:
- startRendering()      // Begin AR render loop
- stopRendering()       // Stop rendering
- render()              // Main render loop (RAF)
- drawBatikOverlay()    // Draw on pose
- drawPatternDetails()  // Pattern-specific drawing
- drawBatikOutline()    // Border visualization
```

**Pattern Rendering:**
- Parang: Diagonal lines
- Megamendung: Wavy cloud patterns
- Dringo: Geometric grid
- Kawung: Circular flowers
- Lasem: Radial patterns
- Buketan: Scattered flowers

### Module: UIController (User Interface)
```javascript
// State: currentState, currentBatikId
// Methods:
- transitionToMainScreen()    // Activate interface
- transitionToStandby()       // Return to idle
- selectBatik()               // User selection
- displayColorAnalysisResult()// Show color info
- showBatikInfo()             // Display details
- requestCameraAccess()       // Request permissions
- resetTryOn()                // Clear selection
```

## 4. State Management

```
┌────────────────────────────────────────────────┐
│              Application States                │
├────────────────────────────────────────────────┤
│                                                │
│  STANDBY                                       │
│  ├─ No activity detected                      │
│  ├─ Low power consumption                     │
│  └─ Waiting for PIR trigger                   │
│     │                                          │
│     ▼                                          │
│  ACTIVE - INITIALIZATION                       │
│  ├─ Camera initializing                       │
│  ├─ Body tracking starting                    │
│  └─ UI ready for interaction                  │
│     │                                          │
│     ▼                                          │
│  ANALYZING_COLOR                               │
│  ├─ Face detection running                    │
│  ├─ Skin tone analysis                        │
│  └─ Waiting for result                        │
│     │                                          │
│     ▼                                          │
│  COLOR_RESULT                                  │
│  ├─ Color category displayed                  │
│  ├─ Recommended batiks shown                  │
│  └─ Ready for selection                       │
│     │                                          │
│     ▼                                          │
│  BATIK_SELECTED                                │
│  ├─ Pose tracking active                      │
│  ├─ AR rendering live                         │
│  ├─ Batik visualized on body                  │
│  └─ Philosophy info displayed                 │
│     │                                          │
│     ├─ Timeout → STANDBY                      │
│     ├─ Change → BATIK_SELECTED                │
│     └─ Exit → STANDBY                         │
│                                                │
└────────────────────────────────────────────────┘
```

## 5. Performance Metrics

### Target Specifications
- **Frame Rate**: 30 FPS minimum, 60 FPS optimal
- **Latency**: <200ms (camera capture to display)
- **Tracking Quality**: 85%+ confidence threshold
- **Memory Usage**: <300MB for full application
- **Load Time**: <3s from standby to active

### Performance Monitoring
```javascript
// Auto-monitored metrics
- FPS (frames per second)
- Pose tracking quality
- Memory consumption (JS Heap)
- Module initialization time
- Rendering frame time

// Access via console
AppStatus() // Get all metrics
```

## 6. Camera & Video Configuration

```javascript
const constraints = {
    video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
    },
    audio: false
};
```

### Video Processing Pipeline
```
Raw Video Stream (30 FPS)
        │
        ├─→ Face Detection (Color Analysis)
        │   └─→ Skin Region Extraction
        │       └─→ Color Classification
        │
        └─→ Pose Detection (Body Tracking)
            └─→ Landmark Extraction
                └─→ Position/Scale Calculation
```

## 7. Database Schema (ERD)

### Entities

**Session**
```sql
session_id (PK) | start_time | end_time | device_type | browser
```

**Analysis_Result**
```sql
analysis_id (PK) | session_id (FK) | color_id (FK) | confidence_score | analysis_time
```

**Personal_Color**
```sql
color_id (PK) | season_name | description | hex_color
```

**Batik**
```sql
batik_id (PK) | color_id (FK) | nama_motif | image_path | model_path | history | origin
```

**Filosofi**
```sql
filosofi_id (PK) | batik_id (FK) | sejarah | filosofi | daerah_asal
```

### Relationships
```
Session (1) ──┐
              ├─→ (1) Analysis_Result (1) ─→ (1) Personal_Color (1) ──┐
              │                                                        ├─→ (M) Batik
              └─────────────────────────────────────────────────────┘

Batik (1) ──→ (1) Filosofi
```

## 8. API Endpoints (Backend)

### GET Requests
```
GET /api/batik              # Get all batik collections
GET /api/batik/:id          # Get specific batik
GET /api/color              # Get personal colors
GET /api/batik/color/:colorId  # Get batik by color

Response: { success, data, message }
```

### POST Requests
```
POST /api/session/start     # Start new session
POST /api/analysis          # Save color analysis
POST /api/session/end       # End session
```

## 9. Security Considerations

- **Camera Permissions**: Request user permission via browser API
- **Data Privacy**: No personal data stored (anonymous sessions)
- **CORS**: Configure for museum network only
- **Rate Limiting**: Prevent API abuse
- **Authentication**: JWT for admin operations

## 10. Deployment

### Museum Setup
```
┌─────────────────────────────────┐
│    Smart Mirror / Display       │
│    (1920x1080 or higher)        │
└──────────────┬──────────────────┘
               │
    ┌──────────▼──────────┐
    │  Processing Unit    │
    │  • Mini PC/NUC      │
    │  • Chrome Browser   │
    │  • Local HTTP Server│
    └──────┬───────┬──────┘
           │       │
    ┌──────▼─┐  ┌──▼──────────┐
    │ ESP32  │  │ Network     │
    │+ PIR   │  │ (Optional)  │
    └────────┘  └─────────────┘
```

### Network Architecture
```
┌──────────────────────────┐
│  Museum Local Network    │
│                          │
│  ┌──────────────────┐   │
│  │  Web Server      │   │
│  │  (HTTP/REST API) │   │
│  └──────────────────┘   │
│           △             │
│           │             │
│  ┌────────┴────────┐    │
│  │  Smart Mirror   │    │
│  │  (AR App)       │    │
│  └─────────────────┘    │
│                          │
└──────────────────────────┘
       │
       │ Optional: Cloud Backup
       ▼
   ┌────────────┐
   │ Cloud DB   │
   │ (Analytics)│
   └────────────┘
```

## 11. Error Handling

### Error Types
```javascript
// Camera Errors
- PermissionDenied
- NotAllowed
- NotFound
- NotReadable

// Processing Errors
- LowQualityTracking
- FaceParseFailed
- PoseDetectionFailed
- RenderingError

// System Errors
- OutOfMemory
- CanvasSizeMismatch
- DatabaseConnection
```

### Error Recovery
```javascript
// Graceful degradation
if (tracking_quality < threshold) {
    // Continue with lower confidence
    // Show warning to user
}

if (camera_error) {
    // Show error message
    // Offer retry
    // Return to standby
}
```

## 12. Testing Strategy

### Unit Tests
- Detector logic
- Color classification
- Pose calculation
- Pattern rendering

### Integration Tests
- Module communication
- State transitions
- Data flow

### User Acceptance Tests
- UI/UX functionality
- Tracking accuracy
- Color recommendation
- Information display

## 13. Maintenance & Monitoring

### Logging
- Error logs (console + backend)
- Performance metrics
- User interaction analytics
- Session recordings (optional)

### Monitoring Dashboard
- System status
- Visitor count
- Average session duration
- Technical issues
- Performance graphs

## 14. Future Enhancements

- **3D Model Support**: Full 3D clothing models with Three.js/Babylon.js
- **Photo Capture**: Save virtual try-on photos
- **Social Sharing**: Share results via QR code
- **Multi-language**: Support for different languages
- **Advanced Styling**: More batik patterns and customization
- **Analytics**: Detailed visitor behavior analytics
- **Mobile Support**: Responsive design for personal devices
- **AR Cloud**: Cloud-based AR asset delivery

## 15. References & Documentation

### External Libraries (Production)
- MediaPipe (Google) - Pose estimation
- TensorFlow.js - ML model running
- Three.js - 3D rendering
- Babylon.js - Alternative 3D engine
- OpenCV.js - Computer vision

### Standards & Specifications
- WebGL 1.0 / 2.0
- WebRTC API
- Canvas 2D Context
- ES6+ JavaScript
- CSS Grid & Flexbox

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: Production Ready
