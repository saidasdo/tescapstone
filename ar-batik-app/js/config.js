// Configuration and Constants
const CONFIG = {
    // Application
    appName: 'Batik AR',
    version: '1.0.0',
    
    // Camera/Video Settings
    camera: {
        width: 1280,
        height: 720,
        frameRate: 30,
        facingMode: 'user'
    },
    
    // Personal Color Classifications
    personalColors: {
        spring: {
            id: 'spring',
            name: 'Spring',
            hexColor: '#F5D76E',
            description: 'Warna hangat dengan saturasi tinggi. Cocok dengan batik berwarna cerah dan ceria.'
        },
        summer: {
            id: 'summer',
            name: 'Summer',
            hexColor: '#B8E6F0',
            description: 'Warna sejuk dengan saturasi sedang. Cocok dengan batik bernuansa pastel dan lembut.'
        },
        autumn: {
            id: 'autumn',
            name: 'Autumn',
            hexColor: '#E8A76F',
            description: 'Warna hangat dengan saturasi rendah. Cocok dengan batik bernuansa tanah dan alam.'
        },
        winter: {
            id: 'winter',
            name: 'Winter',
            hexColor: '#2C2C2C',
            description: 'Warna sejuk dengan saturasi tinggi. Cocok dengan batik kontras dan berani.'
        }
    },
    
    // Batik Collections
    batikCollections: [
        {
            id: 'parang',
            name: 'Parang',
            thumbnail: 'Parang Pattern',
            image: 'assets/batik-ciptoning-1024x1024.webp',
            colorCategory: 'winter',
            history: 'Motif Parang adalah salah satu batik klasik yang paling terkenal dari Yogyakarta.',
            origin: 'Yogyakarta, Jawa Tengah',
            philosophy: 'Parang melambangkan kehati-hatian, kewaspadaan, dan kebijaksanaan. Garis diagonal yang tajam menggambarkan kekuatan dan ketangguhan. Motif ini dulunya hanya dikenakan oleh para bangsawan dan prajurit.'
        },
        {
            id: 'megamendung',
            name: 'Megamendung',
            thumbnail: 'Megamendung Pattern',
            image: 'assets/elegant-floral-botanical-print-fabric-stationery_1325579-3321.avif',
            colorCategory: 'summer',
            history: 'Megamendung adalah motif batik Garut yang terkenal dengan awan melambung.',
            origin: 'Garut, Jawa Barat',
            philosophy: 'Megamendung melambangkan langit yang cerah dan harapan yang tinggi. Awan-awan melambung menggambarkan ambisi dan mimpi yang tak terbatas. Motif ini dipercaya membawa berkah dan keberuntungan.'
        },
        {
            id: 'dringo',
            name: 'Dringo',
            thumbnail: 'Dringo Pattern',
            image: 'assets/Motif-Batik-Jogja.webp',
            colorCategory: 'autumn',
            history: 'Dringo adalah motif batik tradisional dari Madura yang menampilkan desain geometris.',
            origin: 'Madura, Jawa Timur',
            philosophy: 'Dringo melambangkan kebersamaan, keteraturan, dan harmoni. Pola yang berulang menggambarkan siklus kehidupan yang terus berlanjut. Motif ini mencerminkan kearifan lokal masyarakat Madura.'
        },
        {
            id: 'kawung',
            name: 'Kawung',
            thumbnail: 'Kawung Pattern',
            image: null,
            colorCategory: 'spring',
            history: 'Kawung adalah motif batik Jawa Tengah yang terinspirasi dari bunga lontar.',
            origin: 'Yogyakarta, Jawa Tengah',
            philosophy: 'Kawung melambangkan keindahan alam dan kesederhanaan. Empat bunga yang disusun mengilustrasikan empat arah mata angin dan keseimbangan. Motif ini melambangkan pertumbuhan dan perkembangan yang harmonis.'
        },
        {
            id: 'lasem',
            name: 'Lasem',
            thumbnail: 'Lasem Pattern',
            image: null,
            colorCategory: 'winter',
            history: 'Lasem adalah motif batik dari Lasem, Rembang yang dikenal dengan warna merah kaya.',
            origin: 'Lasem, Rembang, Jawa Tengah',
            philosophy: 'Lasem melambangkan keberanian, semangat, dan gairah. Kombinasi warna merah dan emas mencerminkan kemakmuran dan kemuliaan. Motif ini menunjukkan pengaruh budaya China dalam batik Nusantara.'
        },
        {
            id: 'buketan',
            name: 'Buketan',
            thumbnail: 'Buketan Pattern',
            image: null,
            colorCategory: 'summer',
            history: 'Buketan adalah motif batik yang menampilkan rangkaian bunga dan tumbuhan.',
            origin: 'Yogyakarta, Jawa Tengah',
            philosophy: 'Buketan melambangkan keindahan, kelembutan, dan keanggunan. Bunga-bunga yang terangkai mencerminkan keberagaman dan kekayaan budaya. Motif ini membawa energi positif dan ketenangan.'
        }
    ],
    
    // Detection Settings
    detection: {
        pirThreshold: 0.5,
        faceConfidenceThreshold: 0.6,
        bodyTrackingThreshold: 0.5
    },
    
    // UI Settings
    ui: {
        toastDuration: 3000,
        standbyTimeout: 60000, // 60 seconds
        loadingTimeout: 30000   // 30 seconds
    }
};

// Helper function to get batik by ID
CONFIG.getBatikById = function(id) {
    return this.batikCollections.find(b => b.id === id);
};

// Helper function to get color category by ID
CONFIG.getColorById = function(id) {
    return this.personalColors[id];
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
