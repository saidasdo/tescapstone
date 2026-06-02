# Batik AR Virtual Try-On Application

Aplikasi Web-AR untuk museum yang memungkinkan pengunjung mencoba motif batik secara virtual dengan teknologi augmented reality.

## Fitur Utama

- **Deteksi Pengunjung Otomatis**: Sensor PIR mendeteksi kehadiran pengunjung dan mengaktifkan sistem
- **Analisis Warna Personal**: Analisis warna kulit untuk rekomendasi motif batik yang sesuai
- **Virtual Try-On**: Visualisasi batik secara real-time pada tubuh pengunjung
- **Pelacakan Tubuh**: Tracking anatomis tubuh untuk penempatan batik yang akurat
- **Informasi Edukatif**: Sejarah, filosofi, dan asal-usul setiap motif batik
- **Interface Minimalis**: Design yang elegan dan mudah digunakan

## Arsitektur Sistem

### Komponen Utama

```
┌─────────────────────────────────────┐
│      Pengunjung / Visitor           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Sistem Deteksi               │
│  • Sensor PIR (ESP32)               │
│  • Distance Sensor                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Aplikasi Web-AR (Browser)       │
│  ┌────────────────────────────────┐ │
│  │  Modul UI Controller           │ │
│  │  Modul Color Analyzer          │ │
│  │  Modul Body Tracker            │ │
│  │  Modul AR Renderer             │ │
│  └────────────────────────────────┘ │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Smart Mirror/Display         │
│     (Layar Interaktif Museum)       │
└─────────────────────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Server Backend              │
│  • Database (Batik Collection)      │
│  • API REST                         │
│  • Asset Management                 │
└─────────────────────────────────────┘
```

### Modul-Modul

#### 1. **Detector** (detector.js)
- Simulasi sensor PIR untuk deteksi pengunjung
- Pengelolaan status aktif/standby
- Timeout untuk return ke standby

#### 2. **Color Analyzer** (colorAnalyzer.js)
- Analisis warna kulit personal (Spring/Summer/Autumn/Winter)
- Integrasi dengan FaRL face parsing (production)
- Rekomendasi motif berdasarkan warna

#### 3. **Body Tracker** (bodyTracker.js)
- Pelacakan landmark tubuh (MediaPipe/BlazePose)
- Kalkulasi posisi dan skala batik
- Estimasi pose real-time

#### 4. **AR Renderer** (arRenderer.js)
- Rendering visualisasi batik pada canvas
- Pola motif batik (Parang, Megamendung, Dringo, dll)
- Update frame rate responsif

#### 5. **UI Controller** (uiController.js)
- Manajemen state aplikasi
- Navigasi antar screen
- Interaksi user dan event handling

#### 6. **Main App** (app.js)
- Inisialisasi sistem
- Monitoring performa
- Error handling global

## Data Struktur

### Batik Collections

```javascript
{
    id: 'parang',
    name: 'Parang',
    thumbnail: 'image_path',
    colorCategory: 'winter',
    history: 'Deskripsi sejarah',
    origin: 'Yogyakarta, Jawa Tengah',
    philosophy: 'Makna filosofis motif'
}
```

### Personal Color Categories

```javascript
{
    spring: { hexColor: '#F5D76E', description: 'Warna hangat dengan saturasi tinggi' },
    summer: { hexColor: '#B8E6F0', description: 'Warna sejuk dengan saturasi sedang' },
    autumn: { hexColor: '#E8A76F', description: 'Warna hangat dengan saturasi rendah' },
    winter: { hexColor: '#2C2C2C', description: 'Warna sejuk dengan saturasi tinggi' }
}
```

## Alur Penggunaan

1. **Standby Mode**: Layar menampilkan welcome screen
2. **Deteksi**: Sensor PIR mendeteksi pengunjung
3. **Aktivasi**: Sistem beralih ke active mode
4. **Analisis Warna** (Opsional): Pengunjung memilih untuk analisis warna kulit
5. **Pilih Batik**: Pengunjung memilih motif dari katalog
6. **Virtual Try-On**: Sistem menampilkan batik secara virtual
7. **Info Filosofi**: Pengunjung dapat membaca informasi motif
8. **Selesai**: Pengunjung dapat mencoba motif lain atau pergi

## Instalasi & Setup

### Requirement

- Browser modern dengan WebGL support (Chrome, Firefox, Safari, Edge)
- Kamera web/built-in
- JavaScript ES6+

### File Structure

```
ar-batik-app/
├── index.html              # Main HTML
├── css/
│   └── main.css           # Stylesheet
├── js/
│   ├── config.js          # Configuration
│   ├── detector.js        # Detector module
│   ├── colorAnalyzer.js   # Color analysis
│   ├── bodyTracker.js     # Body tracking
│   ├── arRenderer.js      # AR rendering
│   ├── uiController.js    # UI control
│   └── app.js             # Main app
├── data/
│   └── batik-data.json    # Batik collection data
└── assets/                # Images & 3D models
```

### Running Locally

```bash
# Method 1: Using Python
python -m http.server 8000

# Method 2: Using Node.js
npx http-server

# Method 3: Using VS Code Live Server Extension
# Right-click index.html > Open with Live Server
```

Buka browser ke `http://localhost:8000`

## Konfigurasi

Edit `js/config.js` untuk mengubah:

```javascript
// Camera settings
camera: {
    width: 1280,
    height: 720,
    frameRate: 30
}

// Batik collections
batikCollections: [...]

// UI timeouts
ui: {
    toastDuration: 3000,
    standbyTimeout: 60000
}
```

## Development

### Debug Mode

Debug mode otomatis diaktifkan saat berjalan di localhost. Gunakan di console:

```javascript
// Check system status
AppStatus()

// Get current batik
App.getCurrentBatik()

// Get tracking status
App.getTrackingStatus()
```

### Console Logging

Setiap modul menggunakan prefix untuk tracking:

- `[App]` - Main application
- `[Detector]` - Visitor detection
- `[ColorAnalyzer]` - Color analysis
- `[BodyTracker]` - Body tracking
- `[ARRenderer]` - AR rendering
- `[UIController]` - UI control

## Integasi Production

### Dengan ESP32 & PIR Sensor

```javascript
// Replace simulated detector dengan hardware connection
const esp32 = new WebSocket('ws://192.168.1.100:81');
esp32.onmessage = (event) => {
    if (event.data === 'visitor_detected') {
        Detector.onDetectionTriggered();
    }
};
```

### Dengan ML Models

Untuk production, integrasikan:

- **FaRL** untuk face parsing
- **ResNet18** untuk color classification
- **MediaPipe/BlazePose** untuk body tracking
- **Three.js/Babylon.js** untuk 3D rendering

### Dengan Backend Server

```javascript
// Fetch batik data dari server
fetch('/api/batik')
    .then(r => r.json())
    .then(data => CONFIG.batikCollections = data);
```

## Performance Optimization

- Lazy loading aset 3D
- Canvas rendering di RAF (requestAnimationFrame)
- Efficient pose estimation dengan subsampling
- Memory management untuk video stream

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Design Principles

- **Minimalist**: Interface yang sederhana dan fokus
- **Elegant**: Visual yang refined dan profesional
- **Responsive**: Beradaptasi dengan berbagai ukuran layar
- **Accessible**: Mudah digunakan tanpa training
- **Non-contact**: Pengalaman interaktif tanpa menyentuh koleksi asli

## Troubleshooting

### Kamera tidak terbuka
```
Check browser permissions: Settings > Privacy > Camera
Restart browser dan coba lagi
```

### Tracking tidak akurat
```
Pastikan pencahayaan cukup
Posisi tubuh tegak di dalam frame
Jarak ideal 1-3 meter dari kamera
```

### Low FPS
```
Kurangi resolusi kamera
Tutup tab browser lain
Check sistem resource (CPU/RAM)
```

## API Documentation

### App Methods

```javascript
// Get current state
App.getCurrentState() // 'standby' | 'active'

// Get current batik
App.getCurrentBatik() // 'parang' | 'megamendung' | ...

// Get color analysis result
App.getCurrentColor() // { id: 'spring', name: 'Spring', ... }

// Get tracking info
App.getTrackingStatus() // { isTracking, quality, isTracked }

// Get system status
App.getSystemStatus() // { version, fps, memory, ... }
```

## Kontribusi

Untuk kontribusi atau bug report, silakan hubungi tim development.

## Lisensi

Museum Batik Yogyakarta - 2024

## Kontak & Support

- Email: support@batikarmuseum.id
- Phone: +62-274-xxx-xxxx
- Website: www.batikarmuseum.id
