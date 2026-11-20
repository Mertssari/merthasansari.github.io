/*
 * PROJE VERİLERİ (Yol Haritası > Atölye ve Özet görünüm buradan okur)
 * Yeni proje için bu listeye bir kayıt ekle.
 *    - id     : benzersiz anahtar (atölyedeki bina rengi ve park yeri bu anahtarla eşleşir: assets/yol.js)
 *    - plate  : kısa etiket
 *    - title, tagline, status, desc, features, role : metinler ({ tr, en })
 *    - parts  : [{ part, tech }] kullanılan teknolojiler
 *    - links  : { source, demo }
 */
window.GARAGE_PROJECTS = [
  {
    id: "carrent",
    car: "rally",
    color: "#ef233c",
    accent: "#ef233c",
    plate: "CAR 2026",
    title: "CarRent SaaS",
    tagline: {
      tr: "Uçtan uca araç kiralama ve rezervasyon sistemi",
      en: "End-to-end car rental & reservation system"
    },
    status: { tr: "Portfolyo projesi", en: "Portfolio project" },
    desc: {
      tr: "Kurumsal düzeyde uçtan uca bir araç kiralama ve rezervasyon sistemi. Çakışan rezervasyonları önleyen akıllı araç arama, gelir/araç/müşteri metriklerini gösteren yönetici paneli ve yazdırılabilir rezervasyon makbuzu gibi tüm iş kuralları güvenlik önceliğiyle backend tarafında doğrulanıyor.",
      en: "An enterprise-grade, end-to-end car rental and reservation system. Smart vehicle search that prevents double bookings, an admin dashboard with revenue/fleet/customer metrics and printable reservation receipts. All business rules are validated server-side with security as the priority."
    },
    features: {
      tr: [
        "Çakışmasız rezervasyon arama",
        "Gelir, araç ve müşteri metrikleriyle admin paneli",
        "Yazdırılabilir rezervasyon makbuzu",
        "bcrypt, PDO prepared statements ve CSRF koruması"
      ],
      en: [
        "Conflict-free reservation search",
        "Admin dashboard with revenue, fleet and customer metrics",
        "Printable reservation receipt",
        "bcrypt, PDO prepared statements and CSRF protection"
      ]
    },
    parts: [
      { part: "engine", tech: "PHP 8" },
      { part: "transmission", tech: "MySQL" },
      { part: "body", tech: "Bootstrap 5" },
      { part: "turbo", tech: "JavaScript" }
    ],
    links: { source: "https://github.com/Mertssari/CarRent-SaaS" }
  },
  {
    id: "lifehub",
    car: "bug",
    color: "#dfe5eb",
    accent: "#dfe5eb",
    plate: "LIFE 247",
    title: "lifeHub (Derslik)",
    tagline: {
      tr: "Haftalık planlayıcı, yapışkan notlar ve Pomodoro",
      en: "Weekly planner, sticky notes & Pomodoro"
    },
    status: { tr: "Canlı · PWA", en: "Live · PWA" },
    desc: {
      tr: "Öğrenciler, geliştiriciler ve üreticiler için sade, dikkat dağıtmayan bir verimlilik paneli. Haftanı planla, yapışkan notlar al, Pomodoro ile odaklan. Firebase Firestore sayesinde bilgisayar ve telefon arasında gerçek zamanlı senkron çalışıyor; telefona uygulama gibi kurulabiliyor.",
      en: "A minimal, distraction-free productivity dashboard for students, developers and creators. Plan your week, take sticky notes and focus with Pomodoro. Firebase Firestore keeps PC and phone in real-time sync, and it installs on your phone like an app."
    },
    features: {
      tr: [
        "Haftalık planlayıcı",
        "Yapışkan not defteri",
        "Pomodoro odak sayacı",
        "Firebase Firestore ile cihazlar arası gerçek zamanlı senkron",
        "Telefona kurulabilen PWA (service worker)"
      ],
      en: [
        "Weekly planner",
        "Sticky notebook",
        "Pomodoro focus timer",
        "Real-time cross-device sync with Firebase Firestore",
        "Installable PWA (service worker)"
      ]
    },
    parts: [
      { part: "engine", tech: "JavaScript" },
      { part: "transmission", tech: "Firebase Firestore" },
      { part: "body", tech: "HTML5 & CSS3" },
      { part: "turbo", tech: "PWA · Service Worker" }
    ],
    links: {
      source: "https://github.com/Mertssari/lifeHub",
      demo: "https://mertssari.github.io/lifeHub/"
    }
  },
  {
    id: "websistemleri",
    car: "coupe",
    color: "#111217",
    accent: "#ef233c",
    plate: "WEB 0001",
    title: "Web Sistemleri",
    tagline: {
      tr: "Takımla geliştirilen modüler PHP yönetim sistemi",
      en: "Modular PHP management system built as a team"
    },
    status: { tr: "Takım projesi", en: "Team project" },
    desc: {
      tr: "GitHub üzerinden ekip çalışmasıyla geliştirilen kapsamlı bir yönetim sistemi. Sürüm kontrolü, düzenli kod incelemeleri ve görev paylaşımıyla, modüler bir PHP mimarisi üzerine kuruldu.",
      en: "A comprehensive management system developed as a team on GitHub. Built on a modular PHP architecture with version control, regular code reviews and shared ownership of tasks."
    },
    role: {
      tr: "Modüler PHP yapısı, API entegrasyonu ve arayüz geliştirme.",
      en: "Modular PHP structure, API integration and UI development."
    },
    features: {
      tr: [
        "Modüler PHP mimarisi",
        "API entegrasyonu",
        "Git tabanlı ekip çalışması ve kod incelemesi",
        "Agile/Scrum ile planlama"
      ],
      en: [
        "Modular PHP architecture",
        "API integration",
        "Git-based teamwork and code review",
        "Agile/Scrum planning"
      ]
    },
    parts: [
      { part: "engine", tech: "PHP" },
      { part: "transmission", tech: "MySQL" },
      { part: "turbo", tech: "JavaScript / AJAX" },
      { part: "ecu", tech: "Git & Scrum" }
    ],
    links: {}
  }
];
