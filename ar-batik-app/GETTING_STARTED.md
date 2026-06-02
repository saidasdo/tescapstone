# Getting Started - Batik AR Virtual Try-On Application

Panduan cepat untuk memulai dengan aplikasi Batik AR Museum.

## Prasyarat

- Browser modern (Chrome, Firefox, Safari, atau Edge)
- Komputer dengan kamera web atau built-in camera
- Koneksi internet (untuk development tools)
- Terminal/Command Prompt

## Quick Start (5 Menit)

### 1. Buka Aplikasi

**Opsi A: Langsung dari file**
```
1. Buka file index.html dengan browser favorit
2. Aplikasi akan dimulai
3. Klik tombol untuk mulai interaksi
```

**Opsi B: Dengan HTTP Server (Recommended)**

Jika Anda memiliki Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Buka browser: http://localhost:8000
```

Jika Anda memiliki Node.js:
```bash
npm install -g http-server
http-server
```

### 2. Memberikan Izin Kamera

Saat aplikasi dimulai, browser akan meminta izin kamera:
```
[Allow] atau [Allow Always]
Klik tombol izin untuk melanjutkan
```

### 3. Lihat Aplikasi Berjalan

#### Standby Screen
- Aplikasi akan menampilkan welcome screen
- Klik atau gerakkan mouse untuk mensimulasikan deteksi pengunjung

#### Main Interface
- **Left Side**: Camera feed dengan position guide
- **Right Side**: Panel kontrol dengan pilihan batik

#### Fitur Utama

**1. Analisis Warna Personal (Opsional)**
```
1. Tekan tombol "Mulai" di section Analisis Warna
2. Sistem akan menganalisis warna kulit
3. Hasil akan ditampilkan dengan badge warna
```

**2. Pilih Motif Batik**
```
1. Geser carousel untuk melihat pilihan batik
2. Klik salah satu motif untuk memilih
3. Sistem akan menampilkan visualisasi AR
```

**3. Lihat Informasi Filosofi**
```
1. Klik motif batik untuk membuka detail
2. Pelajari sejarah dan filosofi batik
3. Geser untuk melihat motif lainnya
```

**4. Keluar Aplikasi**
```
1. Klik tombol X di sudut kanan atas
2. Aplikasi kembali ke standby screen
```

## Struktur File

```
ar-batik-app/
├── index.html              # File utama (buka ini)
├── css/
│   └── main.css           # Styling
├── js/
│   ├── config.js          # Konfigurasi
│   ├── detector.js        # Deteksi pengunjung
│   ├── colorAnalyzer.js   # Analisis warna
│   ├── bodyTracker.js     # Pelacakan tubuh
│   ├── arRenderer.js      # Rendering AR
│   ├── uiController.js    # Kontrol UI
│   └── app.js             # Aplikasi utama
├── data/
│   └── batik-data.json    # Data batik
├── README.md              # Dokumentasi lengkap
├── TECHNICAL.md           # Dokumentasi teknis
└── TEST_SUITE.js          # Testing suite
```

## Fitur yang Tersedia

### Motif Batik Tersedia

1. **Parang** - Melambangkan kehati-hatian dan kewaspadaan
2. **Megamendung** - Melambangkan harapan dan impian
3. **Dringo** - Melambangkan kebersamaan dan harmoni
4. **Kawung** - Melambangkan keindahan alam
5. **Lasem** - Melambangkan keberanian dan semangat
6. **Buketan** - Melambangkan keindahan dan kelembutan

### Kategori Warna Personal

- **Spring** (Cerah & Hangat) - Untuk Kawung, Buketan
- **Summer** (Pastel & Sejuk) - Untuk Megamendung
- **Autumn** (Alami & Hangat) - Untuk Dringo
- **Winter** (Kontras & Berani) - Untuk Parang, Lasem

## Testing & Development

### Console Commands

Buka Developer Tools (F12) dan gunakan commands:

```javascript
// Cek status sistem
AppStatus()

// Get tracking information
App.getTrackingStatus()

// Get current batik
App.getCurrentBatik()

// Get color info
App.getCurrentColor()

// Run test suite
TestSuite.runAll()
```

### Debug Mode

Debug mode otomatis aktif saat testing di localhost:
- Console akan menampilkan semua events
- Metrics ditampilkan setiap 10 detik
- Gunakan `AppStatus()` untuk status lengkap

### Troubleshooting

**Kamera tidak terbuka?**
```
1. Check browser permissions
2. Restart browser
3. Try menggunakan browser lain
4. Pastikan no other app menggunakan kamera
```

**Tracking tidak akurat?**
```
1. Posisi tubuh di dalam bingkai panduan
2. Pastikan pencahayaan cukup terang
3. Jarak ideal 1-3 meter dari kamera
4. Jangan gunakan cahaya belakang (backlight)
```

**Batik tidak muncul?**
```
1. Tunggu hingga body tracking aktif (lihat indicator)
2. Berdiri lebih dekat ke kamera
3. Pastikan body tracking quality > 50%
```

**FPS rendah atau lag?**
```
1. Tutup tab browser lain
2. Check sistem resource (CPU/RAM)
3. Reload halaman
4. Try dengan resolusi kamera lebih rendah
```

## Konfigurasi Dasar

Untuk mengubah setting, edit `js/config.js`:

```javascript
// Ubah timeout untuk standby (dalam ms)
standbyTimeout: 60000  // 60 detik

// Ubah resolusi kamera
camera: {
    width: 1280,      // Tinggi bisa dikurangi ke 640
    height: 720       // Bisa dikurangi ke 480
}

// Ubah durasi toast notification
toastDuration: 3000   // 3 detik
```

## Development Workflow

### 1. Persiapan Environment
```bash
# Clone/Download project
cd ar-batik-app

# Jalankan local server
python -m http.server 8000
# atau
npm install -g http-server && http-server
```

### 2. Buka Developer Tools
```
F12 atau Ctrl+Shift+I (Windows/Linux)
Cmd+Option+I (Mac)
```

### 3. Monitor Application
```
Console → Check untuk errors
Network → Monitor data requests
Performance → Check FPS dan memory
```

### 4. Test Changes
- Edit file (misalnya `css/main.css` atau `js/uiController.js`)
- Reload browser (F5 atau Ctrl+R)
- Check console untuk errors

## Production Deployment

### Untuk Museum (Offline Setup)

```
1. Setup mini PC/workstation di museum
2. Install Chrome browser
3. Copy folder ar-batik-app
4. Setup local HTTP server (nginx/Apache)
5. Create startup script untuk auto-launch
6. Connect ke Smart Mirror/Display
7. Connect ESP32 untuk PIR sensor
```

### Untuk Web Server

```
1. Upload ke web server
2. Configure CORS headers
3. Setup SSL certificate (HTTPS)
4. Configure database (jika backend)
5. Setup monitoring/logging
6. Test semua browsers
```

## Next Steps

1. **Pelajari Dokumentasi Lengkap**
   - Baca `README.md` untuk overview
   - Baca `TECHNICAL.md` untuk detail teknis

2. **Explore Kode**
   - Mulai dari `js/app.js`
   - Pahami flow ke modul lainnya
   - Check `config.js` untuk settings

3. **Customize untuk Museum**
   - Edit batik collections di `data/batik-data.json`
   - Customize colors di `css/main.css`
   - Integrasikan dengan backend database
   - Setup ESP32 untuk PIR sensor

4. **Test & Validate**
   - Gunakan `TEST_SUITE.js` untuk testing
   - Test di berbagai browsers
   - Test responsiveness di berbagai ukuran layar

5. **Deploy ke Museum**
   - Setup hardware (Smart Mirror, ESP32)
   - Configure network
   - Train staff untuk maintenance
   - Setup monitoring dan backup

## Tips & Tricks

### Performance Tips
- Gunakan Chrome untuk hasil terbaik
- Close unnecessary browser tabs
- Restart browser jika FPS turun
- Reduce camera resolution jika lag

### UX Tips
- Posisi kamera di level mata
- Pastikan pencahayaan seragam
- Beri jarak ideal 1-3 meter dari kamera
- Test dengan berbagai ukuran dan pose tubuh

### Development Tips
- Use browser DevTools untuk debugging
- Check console untuk error messages
- Monitor network tab untuk API calls
- Use TestSuite untuk verification

## Kontakt Support

Untuk pertanyaan atau issues:
- Email: support@batikarmuseum.id
- Documentation: Lihat README.md & TECHNICAL.md
- Test Suite: Jalankan TestSuite.runAll() di console

## Resources

- [MediaPipe Pose Documentation](https://mediapipe.dev/solutions/pose)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Web AR Documentation](https://immersiveweb.github.io/)

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: Ready for Production
