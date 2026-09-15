// prisma.batik.upsert() (bukan create) dipakai supaya seed ini aman dijalankan berkali-kali 
// — kalau data dengan id yang sama sudah ada, akan di-update, bukan bikin duplikat error
// Loop for...of (bukan Promise.all) dipakai supaya proses insert berurutan dan log-nya jelas urut 

// imageUrl dan model3dUrl diisi gambar biasa dan null karena belum siap.
// kalo udah nanti tinggal ditambahin.
// imageUrl dari public/images, misal /images/parang.jpg
// model3dUrl dari public/models, misal /models/parang.glb

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const batikData = [
  {
    id: "parang",
    name: "Parang",
    tone: "Batik Klasik",
    hue: "from-batik-gold to-batik-brown",
    colorCategory: "winter",
    history:
      "Kata 'Parang' berasal dari bahasa Jawa yang berarti 'pedang'. Pada masa Kesultanan Mataram abad ke-16, Batik Parang digunakan oleh bangsawan dan keluarga kerajaan sebagai simbol status dan kekuasaan. Motif ini biasanya digunakan untuk busana resmi.",
    philosophy:
      "Motif ini menggambarkan kekuatan, keberanian, dan semangat juang. Pola yang teratur dan berulang melambangkan keseimbangan dan harmoni dalam kehidupan adalah kunci untuk mencapai kebahagiaan dan kedamaian. Desain yang rumit dan kompleks menjadi simbol dari dedikasi dan keahlian dalam kerajinan batik",
    origin: "Yogyakarta, Jawa Tengah",
    imageUrl: "/images/parang.jpg",
    model3dUrl: null,
  },
  {
    id: "megamendung",
    name: "Megamendung",
    tone: "Pesisir",
    hue: "from-sky-400 to-indigo-500",
    colorCategory: "summer",
    history:
      "Batik Megamendung merupakan motif khas Cirebon yang terinspirasi dari hiasan keramik Dinasti Ming yang dibawa Putri Ong Tien pada abad ke-16. Motif ini berkembang melalui perpaduan budaya Jawa dan Tionghoa, dengan ciri khas bentuk awan berlekuk dan gradasi warna yang tersusun harmonis.",
    philosophy:
      "Megamendung melambangkan keteduhan, kesabaran, dan keseimbangan dalam kehidupan. Bentuk awan yang terus bergerak menggambarkan perjalanan emosi manusia serta mengajarkan ketenangan dalam menghadapi berbagai keadaan.",
    origin: "Cirebon, Jawa Barat",
    imageUrl:
      "/images/megamendung.png",
    model3dUrl: null,
  },
  {
    id: "gringsing",
    name: "Gringsing",
    tone: "Jogja",
    hue: "from-rose-400 to-batik-red",
    colorCategory: "autumn",
    history:
      "Batik Gringsing merupakan motif batik kuno yang dikaitkan dengan Kediri, Jawa Timur, dan telah dikenal sejak masa kerajaan di Jawa. Nama Gringsing berarti 'sisik naga', dengan pola yang tersusun dari isen-isen halus. Motif ini juga tercatat dalam sejumlah sumber sejarah dan naskah Jawa.",
    philosophy:
      "Batik Gringsing melambangkan perlindungan, ketahanan, dan keseimbangan hidup. Motif sisik naga menggambarkan kekuatan serta perlindungan, sementara pola yang teratur mencerminkan ketekunan dan keharmonisan dalam menjalani kehidupan.",
    origin: "Kediri, Jawa Timur",
    imageUrl: "/images/gringsing.webp",
    model3dUrl: null,
  },
  {
    id: "kawung",
    name: "Kawung",
    tone: "Keraton",
    hue: "from-amber-300 to-batik-gold",
    colorCategory: "spring",
    history:
      "Batik Kawung merupakan salah satu motif batik klasik Jawa yang memiliki pola geometris menyerupai buah kawung atau kolang-kaling. Motif ini telah dikenal sejak masa kerajaan di Jawa dan ditemukan pada berbagai peninggalan seperti relief candi. Kawung kemudian berkembang sebagai salah satu motif penting dalam lingkungan keraton.",
    philosophy:
      "Batik Kawung melambangkan kesempurnaan, kemurnian, dan pengendalian diri. Polanya yang teratur menggambarkan keseimbangan serta kehidupan yang harmonis, sementara makna 'suwung' mengajarkan agar manusia mampu mengendalikan nafsu dan keinginan duniawi.",
    origin: "Yogyakarta an Jawa Tengah",
    imageUrl: "/images/kawung.jpg",
    model3dUrl: null,
  },
  {
    id: "lasem",
    name: "Lasem",
    tone: "Peranakan",
    hue: "from-orange-300 to-red-500",
    colorCategory: "winter",
    history:
     "Batik Lasem berkembang di Lasem, Rembang, Jawa Tengah, sebagai hasil akulturasi budaya Jawa dan Tionghoa. Perkembangannya berkaitan dengan komunitas Tionghoa yang menetap di kawasan pesisir Lasem dan menghasilkan batik dengan warna cerah serta motif khas seperti naga, burung hong, dan motif flora.",
    philosophy:
      "Batik Lasem melambangkan keharmonisan dan keberagaman budaya melalui perpaduan unsur Jawa dan Tionghoa. Berbagai motifnya membawa makna seperti kemakmuran, keindahan, kekuatan, serta harapan untuk kehidupan yang lebih baik.",
    origin: "Lasem, Rembang, Jawa Tengah",
    imageUrl: "/images/lasem2.jpg",
    model3dUrl: null,
  },
  {
    id: "buketan",
    name: "Buketan",
    tone: "Floral",
    hue: "from-emerald-300 to-teal-500",
    colorCategory: "summer",
    history:
      "Batik Buketan merupakan motif khas Pekalongan yang berkembang melalui perpaduan budaya lokal, Tionghoa, dan Eropa. Nama buketan berasal dari kata 'bouquet' yang berarti rangkaian bunga. Motif ini dikenal dengan susunan bunga yang indah dan sering dipadukan dengan ornamen burung atau kupu-kupu.",
    philosophy:
       "Batik Buketan melambangkan keindahan, kebahagiaan, kemakmuran, dan keharmonisan hidup. Susunan bunga yang beragam menggambarkan keindahan kehidupan serta keberagaman budaya yang dapat berpadu secara harmonis.",
    origin: "Yogyakarta, Jawa Tengah",
    imageUrl: "/images/buketan.jpg",
    model3dUrl: null,
  },
];

async function main() {
  console.log("Mulai seeding data batik...");

  for (const batik of batikData) {
    const result = await prisma.batik.upsert({
      where: { id: batik.id },
      update: batik,
      create: batik,
    });
    console.log(`   ✔ ${result.name} (${result.id})`);
  }

  console.log("Seeding selesai.");
}

main()
  .catch((e) => {
    console.error("Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });