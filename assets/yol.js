/* ============ Yol Haritası: kaydırdıkça ilerleyen araba ============ */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("map");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Renkler (harita) ----------
  const C = {
    paper: "#f4efe6", field: "#ebe3d3", field2: "#e3e7d6", grass: "#d3dcbf", meadow: "#c8d4b0",
    tree: ["#7f9c70", "#6e8d62", "#8aa679", "#5f7f56"], treeHi: "rgba(255,255,255,0.18)",
    water: "#a9cfd9", waterHi: "#c3dee6",
    shoulder: "#ddd3c1", road: "#2e323d", roadEdge: "#454a57", lane: "#f4efe6",
    roof: "#dfe3e6", roofShade: "#c9cfd4", wall: "#ffffff", brick: "#c98b6b", petrol: "#2e5e73",
    plaza: "#ede6d8", ink: "#1c1f26", muted: "#6d7280",
    accent: "#e85d3f", accentDark: "#c24a30",
    shadow: "rgba(70,50,30,0.16)"
  };

  // ---------- Dil (TR/EN) ----------
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* gizli sekme */ } } };
  let lang = (() => { const v = store.get("preferredLang"); if (v === "tr" || v === "en") return v; return (navigator.language || "tr").toLowerCase().startsWith("tr") ? "tr" : "en"; })();
  const T = {
    tr: {
      doc_title: "Mert Hasan Sarı | Yol Haritası",
      doc_desc: "Mert Hasan Sarı: Karabük Üniversitesi Bilgisayar Mühendisliği öğrencisi. Eğitim, projeler ve iletişim; kaydırdıkça ilerleyen bir yol haritası portfolyosu.",
      brand_aria: "Başa dön", lang_aria: "Dil seçimi", summary_btn: "Özet görünüm",
      hero_eyebrow: "Portfolyo · Yol Haritası",
      hero_lead: "Bilgisayar Mühendisliği öğrencisi. Teknoloji ve estetiğin kesişiminde, güvenli ve ölçeklenebilir dijital deneyimler tasarlıyorum.",
      hero_cue: "Yolculuğa başlamak için kaydır", route_aria: "Duraklar",
      route_start: "Başlangıç", route_start_sub: "Merhaba",
      map_start: "BAŞLANGIÇ", map_uni_sub: "Bilgisayar Mühendisliği", map_faculty: "MÜHENDİSLİK",
      map_workshop: "ATÖLYE", map_projects: "PROJELER", map_post: "POSTANE", map_contact: "İLETİŞİM",
      map_end: "Şimdilik yolun sonu", map_end_sub: "Uğradığınız için teşekkürler",
      all_projects: "Tüm projeler", highlights: "Öne çıkanlar", my_role: "Rolüm", tech: "Teknolojiler",
      live_demo: "Canlı demo", source: "Kaynak kodu",
      f_name: "İsim", f_email: "E-posta", f_message: "Mesaj", f_send: "Gönder",
      f_invalid: "Lütfen tüm alanları doğru doldurun.", f_sending: "Gönderiliyor…", f_ok: "Mesajınız iletildi, teşekkürler!",
      f_bad: "Sunucu beklenmeyen bir yanıt döndürdü.", f_fail: "Gönderim başarısız.",
      s_tag: "Özet görünüm", s_back: "Haritaya dön", s_role: "Bilgisayar Mühendisliği öğrencisi · Karabük Üniversitesi",
      s_about: "Hakkımda", s_about_more: "Teknoloji ve estetiğin kesişiminde, güvenli ve ölçeklenebilir dijital deneyimler tasarlıyorum.",
      s_edu: "Eğitim", s_ongoing: "Devam ediyor", s_projects: "Projeler", s_skills: "Yetkinlikler",
      s_contact: "İletişim", s_contact_text: "Birlikte çalışmak için mesaj bırakabilirsiniz.", s_msg: "Mesaj gönder"
    },
    en: {
      doc_title: "Mert Hasan Sarı | Road Map",
      doc_desc: "Mert Hasan Sarı: Computer Engineering student at Karabük University. Education, projects and contact in a scroll-driven road map portfolio.",
      brand_aria: "Back to top", lang_aria: "Language", summary_btn: "Summary view",
      hero_eyebrow: "Portfolio · Road Map",
      hero_lead: "Computer Engineering student. I design secure, scalable digital experiences where technology meets aesthetics.",
      hero_cue: "Scroll to start the journey", route_aria: "Stops",
      route_start: "Start", route_start_sub: "Hello",
      map_start: "START", map_uni_sub: "Computer Engineering", map_faculty: "ENGINEERING",
      map_workshop: "WORKSHOP", map_projects: "PROJECTS", map_post: "POST OFFICE", map_contact: "CONTACT",
      map_end: "End of the road, for now", map_end_sub: "Thanks for stopping by",
      all_projects: "All projects", highlights: "Highlights", my_role: "My role", tech: "Technologies",
      live_demo: "Live demo", source: "Source code",
      f_name: "Name", f_email: "Email", f_message: "Message", f_send: "Send",
      f_invalid: "Please fill in all fields correctly.", f_sending: "Sending…", f_ok: "Message sent, thank you!",
      f_bad: "The server returned an unexpected response.", f_fail: "Sending failed.",
      s_tag: "Summary view", s_back: "Back to map", s_role: "Computer Engineering student · Karabük University",
      s_about: "About", s_about_more: "I design secure, scalable digital experiences where technology meets aesthetics.",
      s_edu: "Education", s_ongoing: "In progress", s_projects: "Projects", s_skills: "Skills",
      s_contact: "Contact", s_contact_text: "Leave a message if you'd like to work together.", s_msg: "Send a message"
    }
  };
  const t = (k) => (T[lang] && T[lang][k]) || T.tr[k] || k;

  // ---------- Duraklar ----------
  const STOPS = [
    {
      id: "karabuk", anchor: [690, 1590], dwell: 700, side: "left", span: 900, // kart solda; kampüs yolun sağında ~900 birim
      eyebrow: { tr: "Eğitim", en: "Education" },
      title: { tr: "Karabük Üniversitesi", en: "Karabük University" },
      sub: { tr: "Bilgisayar Mühendisliği · 3. sınıf", en: "Computer Engineering · 3rd year" },
      text: {
        tr: "Karabük Üniversitesi Bilgisayar Mühendisliği 3. sınıf öğrencisiyim. Okulda öğrendiklerimi gerçek projelerle pekiştiriyor; güvenlik, performans ve kullanıcı deneyimini birlikte düşünerek uçtan uca yazılım geliştiriyorum.",
        en: "I'm a 3rd-year Computer Engineering student at Karabük University. I reinforce what I learn at school with real projects, building end-to-end software with security, performance and user experience in mind."
      },
      label: { tr: "Odak alanları", en: "Focus areas" },
      chips: { tr: ["Web geliştirme", "Veri yönetimi", "Takım çalışmasına uyum"], en: ["Web development", "Data management", "Team player"] }
    },
    {
      id: "atolye", type: "projects", anchor: [600, 3050], dwell: 1100, side: "left", span: 960,
      eyebrow: { tr: "Projeler", en: "Projects" }, title: { tr: "Atölye", en: "Workshop" },
      sub: { tr: "Uçtan uca geliştirdiğim projeler", en: "Projects I built end to end" },
      text: {
        tr: "Fikirden üretime; güvenlik, performans ve kullanıcı deneyimini bir arada düşünerek geliştirdiğim seçme çalışmalar.",
        en: "Selected work, from idea to production, built with security, performance and user experience in mind."
      }
    }
  ];
  STOPS.push({
    id: "iletisim", type: "contact", anchor: [1000, 3760], dwell: 900, side: "left", span: 560,
    eyebrow: { tr: "İletişim", en: "Contact" }, title: { tr: "Birlikte çalışalım", en: "Let's work together" },
    sub: { tr: "Postane", en: "Post office" },
    text: {
      tr: "Projenizi konuşalım ve güvenli, etkileyici bir dijital deneyim tasarlayalım. Mesajınıza en kısa sürede dönüş yaparım.",
      en: "Let's talk about your project and design a secure, compelling digital experience. I'll get back to you as soon as possible."
    }
  });
  const UPCOMING = [];
  const CONTACT = {
    accessKey: "f6d1b4dc-a579-4e2b-ba7d-c7b49c66bf24", // Web3Forms form anahtarı (istemci tarafında herkese açık olması normaldir)
    links: [
      { label: "GitHub", icon: "gh", href: "https://github.com/Mertssari" },
      { label: "LinkedIn", icon: "in", href: "https://www.linkedin.com/in/merthasansar%C4%B1" },
      { label: "Instagram", icon: "ig", href: "https://www.instagram.com/mertssarii" }
    ]
  };
  // Proje içerikleri tek yerde: data/projects.js. Her projenin atölyedeki bina rengi:
  const PROJECTS = (window.GARAGE_PROJECTS || []).slice(0, 3);
  const PROJECT_TINT = { carrent: "#e85d3f", lifehub: "#6f9e8a", websistemleri: "#2e5e73" };
  const tr = (v) => (v && typeof v === "object" && !Array.isArray(v) ? (v[lang] || v.tr) : v); // seçili dildeki metin
  // haritadaki yazılar: dil değişince güncellenir
  const mapLabels = [];
  const mapLabel = (node, key) => { node.textContent = t(key); mapLabels.push([node, key]); };
  const escHtml = (x) => String(x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- SVG yardımcıları ----------
  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    (parent || world).appendChild(n);
    return n;
  }
  const rand = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })(); // sabit tohum: her açılışta aynı harita

  const WORLD = { w: 2000, h: 4100 };
  const world = document.createElementNS(NS, "g");
  svg.appendChild(world);

  // ---------- Yol ----------
  const ROAD_D = "M 520 120 C 520 520, 980 560, 1000 900 C 1020 1240, 640 1300, 660 1640 C 680 1980, 1120 2050, 1100 2420 C 1085 2700, 620 2760, 600 3050 C 585 3300, 900 3420, 1000 3700 L 1000 3900";
  const roadPath = el("path", { d: ROAD_D, fill: "none", stroke: "none" }, svg);
  const roadLen = roadPath.getTotalLength();
  const samples = [];
  for (let d = 0; d <= roadLen; d += 12) { const p = roadPath.getPointAtLength(d); samples.push([p.x, p.y, d]); }
  const distToRoad = (x, y) => { let m = 1e9; for (const s of samples) { const dx = s[0] - x, dy = s[1] - y, q = dx * dx + dy * dy; if (q < m) m = q; } return Math.sqrt(m); };
  const nearestD = (x, y) => { let m = 1e9, best = 0; for (const s of samples) { const dx = s[0] - x, dy = s[1] - y, q = dx * dx + dy * dy; if (q < m) { m = q; best = s[2]; } } return best; };
  const riverY = (x) => 820 + Math.sin(x / 260) * 70 + x * 0.04;

  // ---------- Zemin ----------
  el("rect", { x: -2000, y: -2000, width: WORLD.w + 4000, height: WORLD.h + 4000, fill: C.paper });
  // tarlalar
  [[80, 300, 360, 260, -6, C.field2], [1180, 120, 520, 330, 4, C.field], [1350, 980, 480, 300, -3, C.grass], [60, 1150, 420, 360, 5, C.field],
   [180, 1900, 380, 420, -4, C.field2], [1350, 2050, 520, 380, 3, C.grass], [1420, 2520, 420, 260, -5, C.field], [140, 2450, 520, 300, 2, C.meadow],
   [700, 2700, 600, 260, -2, C.field2], [1500, 1500, 380, 120, 0, C.field]].forEach(([x, y, w, h, r, f]) => {
    el("rect", { x, y, width: w, height: h, rx: 28, fill: f, transform: `rotate(${r} ${x + w / 2} ${y + h / 2})` });
  });
  // tarla çizgileri (sürülmüş toprak hissi)
  const furrows = el("g", { stroke: "rgba(120,100,70,0.08)", "stroke-width": 3 });
  for (let i = 0; i < 9; i++) el("line", { x1: 1200, y1: 150 + i * 34, x2: 1680, y2: 180 + i * 34 }, furrows);

  // nehir
  let rd = "";
  for (let x = -200; x <= 2200; x += 40) rd += (x === -200 ? "M " : " L ") + x + " " + riverY(x).toFixed(1);
  el("path", { d: rd, fill: "none", stroke: C.waterHi, "stroke-width": 64, "stroke-linecap": "round" });
  el("path", { d: rd, fill: "none", stroke: C.water, "stroke-width": 44, "stroke-linecap": "round" });

  // ---------- Yol çizimi ----------
  const roadBase = el("path", { d: ROAD_D, fill: "none", stroke: C.shoulder, "stroke-width": 84, "stroke-linecap": "round" });
  el("path", { d: ROAD_D, fill: "none", stroke: C.roadEdge, "stroke-width": 62, "stroke-linecap": "round" });
  el("path", { d: ROAD_D, fill: "none", stroke: C.road, "stroke-width": 56, "stroke-linecap": "round" });
  el("path", { d: ROAD_D, fill: "none", stroke: C.lane, "stroke-width": 2.5, "stroke-dasharray": "18 16", opacity: 0.85 });

  // köprü (yolun nehri geçtiği yer)
  (function bridge() {
    let best = null, bd = 1e9;
    for (const s of samples) { const q = Math.abs(s[1] - riverY(s[0])); if (q < bd) { bd = q; best = s; } }
    const p = roadPath.getPointAtLength(best[2]), p2 = roadPath.getPointAtLength(Math.min(roadLen, best[2] + 1));
    const ang = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
    const g = el("g", { transform: `translate(${p.x} ${p.y}) rotate(${ang})` });
    el("rect", { x: -60, y: -40, width: 120, height: 80, rx: 6, fill: "#e8e1d4" }, g);
    el("rect", { x: -60, y: -28, width: 120, height: 56, fill: C.road }, g);
    el("line", { x1: -60, y1: 0, x2: 60, y2: 0, stroke: C.lane, "stroke-width": 2.5, "stroke-dasharray": "18 16", opacity: 0.85 }, g);
    [-36, 36].forEach((y) => el("rect", { x: -64, y: y - 4, width: 128, height: 8, rx: 4, fill: "#ffffff", stroke: "rgba(0,0,0,0.08)" }, g));
  })();

  // başlangıç çizgisi
  (function startLine() {
    const p = roadPath.getPointAtLength(70);
    const g = el("g", { transform: `translate(${p.x} ${p.y})` });
    for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) el("rect", { x: -28 + i * 8, y: -8 + j * 8, width: 8, height: 8, fill: (i + j) % 2 ? C.ink : "#fff" }, g);
    const t = el("text", { x: 52, y: 5, "font-size": 15, "font-weight": 700, "letter-spacing": 3, fill: C.ink, "font-family": "Plus Jakarta Sans, sans-serif" }, g);
    mapLabel(t, "map_start");
  })();

  // ---------- Kampüs: Karabük Üniversitesi ----------
  function building(x, y, w, h, roof, parent, opts) {
    opts = typeof opts === "object" && opts ? opts : {};
    const fh = opts.fh || 24, wall = opts.wall || "#f1ebe1";
    el("rect", { x: x + 12, y: y + 14, width: w, height: h + fh, rx: 8, fill: C.shadow }, parent);
    // ön cephe (güneye bakan duvar)
    el("rect", { x, y: y + h - 8, width: w, height: fh + 8, rx: 6, fill: wall }, parent);
    el("rect", { x, y: y + h + fh - 5, width: w, height: 5, rx: 2.5, fill: "rgba(60,45,30,0.12)" }, parent);
    const doorW = opts.door === false ? 0 : 20, doorX = x + w / 2 - doorW / 2;
    const step = 22, n = Math.max(1, Math.floor((w - 20) / step));
    const x0 = x + (w - (n * step - 10)) / 2;
    for (let i = 0; i < n; i++) {
      const wx = x0 + i * step;
      if (doorW && wx + 12 > doorX - 4 && wx < doorX + doorW + 4) continue;
      el("rect", { x: wx, y: y + h + 4, width: 12, height: fh - 11, rx: 2, fill: "#5d7385" }, parent);
      el("rect", { x: wx, y: y + h + 4, width: 12, height: 2.5, rx: 1, fill: "rgba(255,255,255,0.45)" }, parent);
    }
    if (doorW) {
      el("rect", { x: doorX, y: y + h + 2, width: doorW, height: fh - 2, rx: 2, fill: "#3b4049" }, parent);
      el("rect", { x: doorX - 8, y: y + h - 1, width: doorW + 16, height: 6, rx: 3, fill: roof }, parent);
    }
    // çatı + korkuluk kenarı
    el("rect", { x, y, width: w, height: h, rx: 6, fill: roof }, parent);
    el("rect", { x: x + 6, y: y + 6, width: w - 12, height: h - 12, rx: 4, fill: "none", stroke: "rgba(255,255,255,0.3)", "stroke-width": 2.5 }, parent);
    el("rect", { x, y: y + h - 5, width: w, height: 5, rx: 2.5, fill: "rgba(0,0,0,0.12)" }, parent);
    // çatı detayları: havalandırma üniteleri ve ışıklıklar
    if (opts.hvac !== false && w > 90 && h > 60) {
      [[x + w - 46, y + 14], [x + w - 46, y + 40]].slice(0, h > 90 ? 2 : 1).forEach(([hx, hy]) => {
        el("rect", { x: hx + 2, y: hy + 3, width: 28, height: 20, rx: 3, fill: "rgba(0,0,0,0.12)" }, parent);
        el("rect", { x: hx, y: hy, width: 28, height: 20, rx: 3, fill: "#e4e7ea" }, parent);
        el("circle", { cx: hx + 14, cy: hy + 10, r: 6, fill: "#c3c9cf" }, parent);
      });
    }
    if (opts.sky) for (let i = 0; i < opts.sky; i++) el("rect", { x: x + 16 + i * 26, y: y + 14, width: 16, height: 10, rx: 2, fill: "rgba(200,225,240,0.75)" }, parent);
  }
  // Karabük Üniversitesi logosu: orijinal düzen korunarak pastel renklerle çizildi (626x480 orijinal koordinatlarında)
  function emblem(cx, cy, parent) {
    const blue = "#4f74a0", coral = "#ee7b6c", coralDark = "#d9665a", font = "Plus Jakarta Sans, sans-serif";
    const k = 0.37, W = 626, H = 480;
    const holder = el("g", { transform: `translate(${cx} ${cy})` }, parent);
    // levha
    el("rect", { x: -W * k / 2 - 14 + 4, y: -H * k / 2 - 12 + 5, width: W * k + 28, height: H * k + 24, rx: 16, fill: "rgba(70,50,30,0.12)" }, holder);
    el("rect", { x: -W * k / 2 - 14, y: -H * k / 2 - 12, width: W * k + 28, height: H * k + 24, rx: 16, fill: "#fffdf8", stroke: "#e6dccb", "stroke-width": 2 }, holder);
    const g = el("g", { transform: `translate(${-W * k / 2} ${-H * k / 2}) scale(${k})` }, holder);
    const stroke = (d, w) => el("path", { d, fill: "none", stroke: blue, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    // sol kaş tutamları ve sağ kirpikler
    stroke("M 246 104 C 226 80, 228 46, 250 22", 9);
    stroke("M 264 98 C 258 68, 270 40, 294 30", 9);
    stroke("M 404 126 C 414 108, 426 100, 440 96", 7);
    stroke("M 414 130 C 430 112, 446 104, 466 100", 7);
    stroke("M 420 140 C 438 126, 456 120, 478 120", 7);
    // kuyruğa inen kalın hilal (sol) ve kıvrım (sağ)
    el("path", { d: "M 238 166 C 172 214, 126 306, 96 430 C 146 324, 202 250, 266 190 Z", fill: blue }, g);
    el("path", { d: "M 408 186 C 434 226, 428 266, 390 290 C 410 262, 414 230, 396 198 Z", fill: blue }, g);
    stroke("M 230 178 Q 198 172 160 184", 6);
    // gözler
    [[270, 140, 40, 12, 19], [392, 162, 32, 10, 15]].forEach(([x, y, r, w, pr]) => {
      el("circle", { cx: x, cy: y, r, fill: "#ffffff", stroke: blue, "stroke-width": w }, g);
      el("circle", { cx: x + 3, cy: y + 4, r: pr, fill: blue }, g);
      el("circle", { cx: x + 9, cy: y - 2, r: pr * 0.3, fill: "#ffffff" }, g);
    });
    // gaga
    el("path", { d: "M 328 186 L 348 190 L 338 218 Z", fill: blue }, g);
    // kep (başın üstünde, eğik)
    el("path", { d: "M 284 56 L 346 42 L 418 70 L 352 86 Z", fill: coral }, g);
    el("path", { d: "M 324 78 L 380 72 L 378 96 L 328 98 Z", fill: coralDark }, g);
    // yazı
    const txt = (x, y, str, size, weight, fill, ls) => { const t = el("text", { x, y, "text-anchor": "middle", "font-size": size, "font-weight": weight, fill, "letter-spacing": ls, "font-family": font }, g); t.textContent = str; };
    txt(306, 328, "2007", 32, 600, coral, 1);
    txt(414, 394, "KARABÜK", 72, 500, blue, 7);
    el("line", { x1: 218, y1: 410, x2: 612, y2: 410, stroke: coral, "stroke-width": 4, "stroke-linecap": "round" }, g);
    txt(402, 462, "ÜNİVERSİTESİ", 46, 500, blue, 4);
    return holder;
  }

  (function campus() {
    const g = el("g", {});
    // bağlantı yolu
    el("path", { d: "M 650 1590 L 960 1590", stroke: C.shoulder, "stroke-width": 44, "stroke-linecap": "round", fill: "none" }, g);
    el("path", { d: "M 650 1590 L 960 1590", stroke: C.road, "stroke-width": 34, "stroke-linecap": "round", fill: "none" }, g);
    // meydan
    el("rect", { x: 940, y: 1330, width: 540, height: 500, rx: 30, fill: C.plaza }, g);
    // çim avlu + çapraz yürüyüş yolları
    el("rect", { x: 1050, y: 1468, width: 290, height: 234, rx: 18, fill: C.meadow }, g);
    el("path", { d: "M 1050 1468 L 1340 1702 M 1340 1468 L 1050 1702", stroke: C.plaza, "stroke-width": 14 }, g);
    emblem(1195, 1585, g);
    // binalar (U düzeni)
    building(980, 1360, 450, 92, C.roof, g);                 // rektörlük
    building(1370, 1470, 82, 250, C.roof, g);                // doğu kanadı
    building(980, 1720, 330, 84, C.petrol, g);               // mühendislik fakültesi (vurgulu)
    el("rect", { x: 1000, y: 1738, width: 290, height: 10, rx: 5, fill: "rgba(255,255,255,0.25)" }, g);
    // çatı ekipmanları
    [[1020, 1378], [1060, 1378], [1380, 1500]].forEach(([x, y]) => el("rect", { x, y, width: 22, height: 16, rx: 3, fill: C.roofShade }, g));
    // bayrak direği
    // otopark + park etmiş arabalar
    el("rect", { x: 960, y: 1480, width: 80, height: 210, rx: 10, fill: "#d9d3c7" }, g);
    for (let i = 0; i < 6; i++) el("line", { x1: 960, y1: 1500 + i * 32, x2: 1000, y2: 1500 + i * 32, stroke: "#fff", "stroke-width": 2 }, g);
    ["#8fa6b2", "#e0c9a6", "#b9c4cc", "#7d8b99"].forEach((col, i) => {
      const cy = 1508 + i * 40 + (i > 1 ? 32 : 0);
      el("rect", { x: 966, y: cy, width: 30, height: 18, rx: 6, fill: C.shadow }, g);
      el("rect", { x: 963, y: cy - 3, width: 30, height: 18, rx: 6, fill: col }, g);
      el("rect", { x: 978, y: cy, width: 9, height: 12, rx: 2, fill: "rgba(30,40,55,0.45)" }, g);
    });
    // etiket
    const lab = el("g", { transform: "translate(1210 1300)" }, g);
    const t1 = el("text", { x: 0, y: 0, "text-anchor": "middle", "font-size": 22, "font-weight": 800, "letter-spacing": 4, fill: C.ink, "font-family": "Plus Jakarta Sans, sans-serif" }, lab);
    t1.textContent = "KARABÜK ÜNİVERSİTESİ";
    const t2 = el("text", { x: 0, y: 24, "text-anchor": "middle", "font-size": 14, "font-weight": 600, fill: C.petrol, "font-family": "Plus Jakarta Sans, sans-serif" }, lab);
    mapLabel(t2, "map_uni_sub");
    const t3 = el("text", { x: 1145, y: 1768, "text-anchor": "middle", "font-size": 13, "font-weight": 700, "letter-spacing": 3, fill: "#fff", "font-family": "Plus Jakarta Sans, sans-serif" }, g);
    mapLabel(t3, "map_faculty");
    world.insertBefore(g, roadBase); // bağlantı yolu ana yolun altından bağlansın
  })();

  // ---------- Atölye: iç yol + her bina bir proje ----------
  const projectOutlines = {};
  // her projenin park yeri: x merkezi ve yön (-1: yolun kuzeyi, +1: güneyi)
  const SPOTS = { carrent: { x: 895, dir: -1 }, lifehub: { x: 1180, dir: -1 }, websistemleri: { x: 1080, dir: 1 } };
  const IN_ROAD_Y = 3050;
  (function atolye() {
    const g = el("g", {});
    const font = "Plus Jakarta Sans, sans-serif";
    [[120, 2850, 420, 300, 4, C.field2], [1600, 2800, 360, 420, -3, C.grass], [180, 3500, 460, 320, -2, C.field], [1250, 3500, 520, 300, 3, C.field2]].forEach(([x, y, w, h, r, fc]) => {
      el("rect", { x, y, width: w, height: h, rx: 28, fill: fc, transform: `rotate(${r} ${x + w / 2} ${y + h / 2})` }, g);
    });
    // zemin
    el("rect", { x: 720, y: 2770, width: 820, height: 540, rx: 34, fill: C.plaza }, g);
    // park alanları (yolun iki yanı)
    el("rect", { x: 750, y: 2978, width: 560, height: 56, rx: 8, fill: "#ddd6c9" }, g);
    el("rect", { x: 750, y: 3066, width: 560, height: 56, rx: 8, fill: "#ddd6c9" }, g);
    for (let x = 760; x <= 1300; x += 30) {
      el("line", { x1: x, y1: 2984, x2: x, y2: 3030, stroke: "#fff", "stroke-width": 2 }, g);
      el("line", { x1: x, y1: 3070, x2: x, y2: 3116, stroke: "#fff", "stroke-width": 2 }, g);
    }
    // projeye ayrılmış park yerleri (proje renginde işaret)
    Object.entries(SPOTS).forEach(([id, sp]) => {
      const y = sp.dir < 0 ? 2984 : 3110;
      el("rect", { x: sp.x - 11, y, width: 22, height: 6, rx: 3, fill: PROJECT_TINT[id] }, g);
    });
    // park etmiş diğer araçlar
    [[790, -1, "#8fa6b2"], [820, -1, "#e0c9a6"], [970, -1, "#7d8b99"], [1060, -1, "#b9c4cc"], [1240, -1, "#e0c9a6"],
     [850, 1, "#7d8b99"], [940, 1, "#e85d3f"], [1180, 1, "#8fa6b2"], [1270, 1, "#b9c4cc"]].forEach(([cx, dir, col]) => {
      const y = dir < 0 ? 2990 : 3076;
      el("rect", { x: cx - 9, y: y + 3, width: 20, height: 34, rx: 6, fill: C.shadow }, g);
      el("rect", { x: cx - 11, y, width: 20, height: 34, rx: 6, fill: col }, g);
      el("rect", { x: cx - 8, y: dir < 0 ? y + 5 : y + 20, width: 14, height: 9, rx: 2, fill: "rgba(30,40,55,0.45)" }, g);
    });
    // iç yol: ana yoldan girip binaların arasından geçer, sonda dönüş göbeği
    const inRoad = `M 600 ${IN_ROAD_Y} L 1330 ${IN_ROAD_Y}`;
    el("path", { d: inRoad, stroke: C.shoulder, "stroke-width": 46, "stroke-linecap": "round", fill: "none" }, g);
    el("circle", { cx: 1360, cy: IN_ROAD_Y, r: 52, fill: C.shoulder }, g);
    el("path", { d: inRoad, stroke: C.road, "stroke-width": 36, "stroke-linecap": "round", fill: "none" }, g);
    el("circle", { cx: 1360, cy: IN_ROAD_Y, r: 44, fill: C.road }, g);
    el("path", { d: `M 660 ${IN_ROAD_Y} L 1300 ${IN_ROAD_Y}`, stroke: C.lane, "stroke-width": 2.5, "stroke-dasharray": "14 12", opacity: 0.8, fill: "none" }, g);
    el("circle", { cx: 1360, cy: IN_ROAD_Y, r: 17, fill: C.meadow, stroke: "#f1ebe1", "stroke-width": 4 }, g);
    el("circle", { cx: 1363, cy: IN_ROAD_Y + 3, r: 9, fill: C.shadow }, g);
    el("circle", { cx: 1360, cy: IN_ROAD_Y, r: 9, fill: C.tree[1] }, g);
    // giriş kapısı (bariyer kolonları)
    [-30, 30].forEach((dy) => el("rect", { x: 712, y: IN_ROAD_Y + dy - 6, width: 12, height: 12, rx: 3, fill: "#fff", stroke: "rgba(0,0,0,0.1)" }, g));
    const roofLabel = (x, y, text, size = 15) => { const t = el("text", { x, y, "text-anchor": "middle", "font-size": size, "font-weight": 800, "letter-spacing": 3, fill: "#fff", "font-family": font }, g); t.textContent = text; };
    const outline = (id, x, y, w, h) => {
      projectOutlines[id] = el("rect", { x: x - 12, y: y - 12, width: w + 24, height: h + 24, rx: 16, fill: "none", stroke: PROJECT_TINT[id], "stroke-width": 4, "stroke-dasharray": "10 8", opacity: 0, class: "bld-outline" }, g);
    };
    // 1) CarRent: kiralama ofisi (geniş vitrin)
    building(775, 2818, 240, 118, PROJECT_TINT.carrent, g, { fh: 26, sky: 3 });
    roofLabel(880, 2886, "CARRENT");
    outline("carrent", 775, 2818, 240, 216);
    // 2) lifeHub: çatı bahçeli stüdyo
    building(1070, 2810, 230, 126, PROJECT_TINT.lifehub, g, { fh: 26, hvac: false });
    el("rect", { x: 1086, y: 2824, width: 198, height: 92, rx: 10, fill: "#9fc5ad" }, g);
    el("path", { d: "M 1086 2870 L 1284 2870", stroke: "#e8dcc6", "stroke-width": 6 }, g);
    [[1108, 2846], [1140, 2896], [1262, 2848], [1250, 2898], [1180, 2842], [1215, 2900]].forEach(([x, y], i) => {
      el("circle", { cx: x + 3, cy: y + 4, r: 10 + (i % 2) * 3, fill: "rgba(40,60,40,0.18)" }, g);
      el("circle", { cx: x, cy: y, r: 10 + (i % 2) * 3, fill: C.tree[i % C.tree.length] }, g);
    });
    roofLabel(1185, 2876, "LIFEHUB", 14);
    outline("lifehub", 1070, 2810, 230, 224);
    // 3) Web Sistemleri: ekip ofisi + arkasında ortak teras
    building(870, 3140, 420, 78, PROJECT_TINT.websistemleri, g, { fh: 26, sky: 5 });
    roofLabel(1060, 3185, "WEB SİSTEMLERİ");
    el("rect", { x: 930, y: 3250, width: 300, height: 48, rx: 12, fill: C.meadow }, g);
    [[960, 3274], [1200, 3274]].forEach(([x, y]) => { el("circle", { cx: x + 3, cy: y + 4, r: 13, fill: C.shadow }, g); el("circle", { cx: x, cy: y, r: 13, fill: C.tree[0] }, g); });
    [1030, 1080, 1130].forEach((x) => { el("rect", { x: x - 16, y: 3266, width: 32, height: 16, rx: 5, fill: "#c9a27e" }, g); });
    outline("websistemleri", 870, 3066, 420, 232);
    // binalar tıklanabilir: projeyi açar
    Object.entries(projectOutlines).forEach(([id, o]) => {
      const hit = el("rect", { x: o.getAttribute("x"), y: o.getAttribute("y"), width: o.getAttribute("width"), height: o.getAttribute("height"), rx: 16, fill: "transparent", class: "bld-hit" }, g);
      hit.addEventListener("mouseenter", () => hotProject(id));
      hit.addEventListener("mouseleave", () => { if (!(state.branch && state.branch.id === id)) hotProject(null); });
      hit.addEventListener("click", () => openProjectFromMap(id));
    });
    world.insertBefore(g, roadBase); // zemin ana yolun altında kalsın
    // alan etiketi
    const t1 = el("text", { x: 1130, y: 2752, "text-anchor": "middle", "font-size": 24, "font-weight": 800, "letter-spacing": 6, fill: C.ink, "font-family": font }, g);
    mapLabel(t1, "map_workshop");
    const t2 = el("text", { x: 1130, y: 2728, "text-anchor": "middle", "font-size": 13, "font-weight": 700, "letter-spacing": 3, fill: C.accentDark, "font-family": font }, g);
    mapLabel(t2, "map_projects");
    // doğu kenarı ağaç sırası
    for (let x = 1450; x <= 1500; x += 46) for (let y = 2810; y <= 3270; y += 66) {
      el("circle", { cx: x + 5, cy: y + 7, r: 14, fill: C.shadow }, g);
      el("circle", { cx: x, cy: y, r: 14, fill: C.tree[(x + y) % 4] }, g);
      el("circle", { cx: x - 4, cy: y - 5, r: 6, fill: C.treeHi }, g);
    }
  })();

  // ---------- Araba atölyede: seçilen projenin park yerine gider ----------
  const branchEl = el("path", { d: "M 0 0", fill: "none", stroke: "none" }, svg);
  function stopPoint() { const st = STOPS.find((x) => x.type === "projects"); return roadPath.getPointAtLength(st.d); }
  function branchD(phase, id) {
    const sp = SPOTS[id], P = stopPoint(), x = sp.x, Y = IN_ROAD_Y, yEnd = Y + sp.dir * 52, yCurve = Y + sp.dir * 34;
    if (phase === "in") return `M ${P.x.toFixed(1)} ${P.y.toFixed(1)} Q 630 ${Y} 680 ${Y} L ${x - 36} ${Y} Q ${x} ${Y} ${x} ${yCurve} L ${x} ${yEnd}`;
    if (phase === "reverse") return `M ${x + 40} ${Y} Q ${x} ${Y} ${x} ${yCurve} L ${x} ${yEnd}`; // geri geri, burun batıya dönerek çıkar
    return `M ${x + 40} ${Y} L 680 ${Y} Q 630 ${Y} ${P.x.toFixed(1)} ${P.y.toFixed(1)}`;
  }
  function startPhase(phase, id) {
    branchEl.setAttribute("d", branchD(phase, id));
    state.branch = Object.assign(state.branch || {}, { id, phase, u: 0, done: false, len: branchEl.getTotalLength() });
  }
  function driveTo(id) {
    const b = state.branch;
    if (!b) { if (id) { state.branch = null; startPhase("in", id); state.branch.next = undefined; } kick(); return; }
    b.next = id;
    if (b.phase === "in" && b.done && id !== b.id) startPhase("reverse", b.id);
    kick();
  }
  function stepBranch(dt) {
    const b = state.branch;
    const dur = b.phase === "in" ? 1.7 : b.phase === "reverse" ? 1.0 : 1.3;
    b.u = Math.min(1, b.u + (reduceMotion ? 1 : dt / dur));
    const e = (1 - Math.cos(Math.PI * b.u)) / 2;
    const L = b.len * (b.phase === "reverse" ? 1 - e : e);
    const q = branchEl.getPointAtLength(L), q2 = branchEl.getPointAtLength(Math.min(b.len, L + 4)), q1 = branchEl.getPointAtLength(Math.max(0, L - 4));
    const res = { p: q, ang: Math.atan2(q2.y - q1.y, q2.x - q1.x), moving: b.u < 1 };
    if (b.u >= 1 && !b.done) {
      b.done = true;
      if (b.phase === "in") { if (b.next !== undefined && b.next !== b.id) { startPhase("reverse", b.id); res.moving = true; } }
      else if (b.phase === "reverse") { startPhase("out", b.id); res.moving = true; }
      else { const n = b.next; state.branch = null; if (n) { startPhase("in", n); state.branch.next = undefined; } res.moving = true; }
    }
    return res;
  }

  function hotProject(id) {
    Object.keys(projectOutlines).forEach((k) => projectOutlines[k].setAttribute("opacity", k === id ? 1 : 0));
  }

  // ---------- Postane (İletişim) ----------
  let mailFlag = null;
  (function postane() {
    const g = el("g", {});
    const font = "Plus Jakarta Sans, sans-serif";
    el("rect", { x: 1050, y: 3610, width: 380, height: 300, rx: 30, fill: C.plaza }, g);
    el("path", { d: "M 1000 3760 L 1090 3760", stroke: C.shoulder, "stroke-width": 40, "stroke-linecap": "round", fill: "none" }, g);
    el("path", { d: "M 1000 3760 L 1090 3760", stroke: C.road, "stroke-width": 30, "stroke-linecap": "round", fill: "none" }, g);
    building(1110, 3640, 270, 104, "#e9b44c", g, { fh: 26, sky: 0 });
    const t = el("text", { x: 1222, y: 3700, "text-anchor": "middle", "font-size": 16, "font-weight": 800, "letter-spacing": 4, fill: "#fff", "font-family": font }, g);
    mapLabel(t, "map_post");
    // zarf amblemi
    el("rect", { x: 1300, y: 3664, width: 40, height: 28, rx: 4, fill: "#fff" }, g);
    el("path", { d: "M 1302 3667 L 1320 3682 L 1338 3667", fill: "none", stroke: "#e9b44c", "stroke-width": 3, "stroke-linejoin": "round" }, g);
    // posta kutusu (mesaj gidince bayrağı kalkar)
    el("rect", { x: 1124, y: 3806, width: 30, height: 22, rx: 8, fill: C.shadow }, g);
    el("rect", { x: 1118, y: 3800, width: 30, height: 22, rx: 8, fill: C.accent }, g);
    el("rect", { x: 1124, y: 3809, width: 18, height: 4, rx: 2, fill: "rgba(0,0,0,0.25)" }, g);
    mailFlag = el("rect", { x: 1148, y: 3798, width: 5, height: 16, rx: 2, fill: C.ink, transform: "rotate(90 1150 3812)", class: "mail-flag" }, g);
    // posta minibüsü
    const van = el("g", { transform: "translate(1300 3830) rotate(-90)" }, g);
    el("rect", { x: -30, y: -15, width: 66, height: 34, rx: 9, fill: C.shadow }, van);
    el("rect", { x: -34, y: -18, width: 66, height: 34, rx: 9, fill: "#fbf6ec" }, van);
    el("rect", { x: -34, y: -4, width: 66, height: 6, fill: C.accent }, van);
    el("rect", { x: 16, y: -14, width: 12, height: 26, rx: 3, fill: "#27303d" }, van);
    // bank + çiçeklikler
    el("rect", { x: 1200, y: 3836, width: 60, height: 12, rx: 4, fill: "#c9a27e" }, g);
    [[1180, 3880], [1240, 3880], [1300, 3880], [1360, 3880]].forEach(([x, y], i) => {
      el("rect", { x: x - 22, y: y - 8, width: 44, height: 16, rx: 8, fill: C.meadow }, g);
      ["#ee8a70", "#f3c96b", "#ffffff"].forEach((col, k) => el("circle", { cx: x - 12 + k * 12, cy: y, r: 4, fill: col }, g));
    });
    const l1 = el("text", { x: 1240, y: 3594, "text-anchor": "middle", "font-size": 22, "font-weight": 800, "letter-spacing": 6, fill: C.ink, "font-family": font }, g);
    mapLabel(l1, "map_post");
    const l2 = el("text", { x: 1240, y: 3570, "text-anchor": "middle", "font-size": 13, "font-weight": 700, "letter-spacing": 3, fill: C.accentDark, "font-family": font }, g);
    mapLabel(l2, "map_contact");
    world.insertBefore(g, roadBase);
  })();

  // ---------- Kavşaklar: bağlantı yolu ana yola genişleyen bir ağızla bağlanır ----------
  // ana yolun banketinin üstüne, asfaltının altına çizilir; böylece iki yol tek parça görünür
  function junction(x, y, w) {
    const d0 = nearestD(x, y), c = roadPath.getPointAtLength(d0);
    const xe = c.x + 26, h = w / 2, f = 18;
    const d = `M ${xe - 14} ${y - h - f} Q ${xe + 6} ${y - h} ${xe + 30} ${y - h} L ${xe + 30} ${y + h} Q ${xe + 6} ${y + h} ${xe - 14} ${y + h + f} Z`;
    const patch = el("path", { d: `M ${c.x} ${y - h} L ${xe + 30} ${y - h} L ${xe + 30} ${y + h} L ${c.x} ${y + h} Z`, fill: C.road });
    const flare = el("path", { d, fill: C.road });
    const at = roadBase.nextSibling; // ana yolun koyu kenar çizgisi
    world.insertBefore(patch, at);
    world.insertBefore(flare, at);
  }
  junction(650, 1590, 34);   // kampüs
  junction(600, 3050, 36);   // atölye
  junction(1000, 3760, 30);  // postane

  // durak işareti (yol kenarı)
  const stopMarkers = STOPS.map((s, i) => {
    const g = el("g", { transform: `translate(${s.anchor[0] + 42} ${s.anchor[1] - 62})` });
    const pulse = el("circle", { r: 26, fill: C.accent, opacity: 0.16 }, g);
    if (!reduceMotion) el("animate", { attributeName: "r", values: "22;32;22", dur: "2.4s", repeatCount: "indefinite" }, pulse);
    el("circle", { r: 15, fill: C.accent, stroke: "#fff", "stroke-width": 3 }, g);
    const n = el("text", { y: 5, "text-anchor": "middle", "font-size": 13, "font-weight": 800, fill: "#fff", "font-family": "Plus Jakarta Sans, sans-serif" }, g);
    n.textContent = String(i + 1).padStart(2, "0");
    return { g, pulse };
  });

  // yol sonu: bariyer + "yakında"
  (function roadEnd() {
    const p = roadPath.getPointAtLength(roadLen - 30);
    const g = el("g", { transform: `translate(${p.x} ${p.y})` });
    el("rect", { x: -44, y: -6, width: 88, height: 12, rx: 3, fill: "#fff", stroke: "rgba(0,0,0,0.1)" }, g);
    for (let i = 0; i < 5; i++) el("rect", { x: -40 + i * 18, y: -6, width: 9, height: 12, fill: C.accent }, g);
    const t = el("text", { x: 0, y: 46, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: C.ink, "font-family": "Plus Jakarta Sans, sans-serif" }, g);
    mapLabel(t, "map_end");
    const t2 = el("text", { x: 0, y: 67, "text-anchor": "middle", "font-size": 13, "font-weight": 600, fill: C.muted, "font-family": "Plus Jakarta Sans, sans-serif" }, g);
    mapLabel(t2, "map_end_sub");
  })();

  // ---------- Ağaçlar (yoldan, nehirden ve kampüsten uzakta) ----------
  (function trees() {
    const g = el("g", {});
    const avoid = (x, y, r) =>
      distToRoad(x, y) < 70 + r || Math.abs(y - riverY(x)) < 44 + r ||
      (x > 900 && x < 1520 && y > 1250 && y < 1860) || (x > 640 && x < 980 && y > 1550 && y < 1630) ||
      (x > 700 && x < 1560 && y > 2700 && y < 3320) || (x > 1040 && x < 1440 && y > 3590 && y < 3920);
    const clusters = [[200, 700], [380, 520], [1250, 640], [1500, 760], [260, 1000], [1600, 1250], [330, 1480], [540, 1260], [820, 2150],
      [1500, 1880], [300, 2200], [1650, 2300], [700, 2500], [1350, 2700], [180, 2700], [1750, 600], [820, 380], [1650, 1700], [480, 1750], [300, 3000], [250, 3400], [1700, 2950], [1750, 3400], [500, 3700], [1400, 3650], [1300, 3950], [700, 4000]];
    clusters.forEach(([cx, cy]) => {
      const n = 6 + Math.floor(rand() * 7);
      for (let i = 0; i < n; i++) {
        const r = 16 + rand() * 16, x = cx + (rand() - 0.5) * 220, y = cy + (rand() - 0.5) * 180;
        if (avoid(x, y, r)) continue;
        const col = C.tree[Math.floor(rand() * C.tree.length)];
        el("circle", { cx: x + r * 0.35, cy: y + r * 0.45, r, fill: C.shadow }, g);
        el("circle", { cx: x, cy: y, r, fill: col }, g);
        el("circle", { cx: x - r * 0.3, cy: y - r * 0.32, r: r * 0.5, fill: C.treeHi }, g);
      }
    });
    // kampüs ağaç sırası
    for (let x = 1000; x <= 1440; x += 55) {
      const y = 1840, r = 15;
      el("circle", { cx: x + 5, cy: y + 7, r, fill: C.shadow }, g);
      el("circle", { cx: x, cy: y, r, fill: C.tree[1] }, g);
      el("circle", { cx: x - 4, cy: y - 5, r: 7, fill: C.treeHi }, g);
    }
  })();

  // ---------- Efektler: lastik izi ve egzoz dumanı (arabanın altında) ----------
  const skidLayer = el("g", {}), smokeLayer = el("g", {});
  const puffs = [], marks = [];
  for (let i = 0; i < 60; i++) puffs.push({ n: el("circle", { r: 0, fill: "url(#puff)", opacity: 0 }, smokeLayer), life: 1, x: 0, y: 0, vx: 0, vy: 0, r0: 0 });
  for (let i = 0; i < 90; i++) marks.push({ n: el("line", { stroke: "#08090c", "stroke-width": 4.5, "stroke-linecap": "round", opacity: 0 }, skidLayer), life: 1 });
  let puffI = 0, markI = 0, smokeAcc = 0;
  const lastWheel = [null, null];

  // ---------- Araba (yukarıdan; burnu +x yönünde çizilir) ----------
  const car = el("g", {});
  (function drawCar() {
    el("rect", { x: -26, y: -11, width: 58, height: 32, rx: 11, fill: "rgba(40,25,15,0.22)" }, car); // gölge
    el("rect", { x: -16, y: -18, width: 9, height: 6, rx: 2, fill: "#1f2228" }, car); // tekerlek uçları
    el("rect", { x: 15, y: -18, width: 9, height: 6, rx: 2, fill: "#1f2228" }, car);
    el("rect", { x: -16, y: 12, width: 9, height: 6, rx: 2, fill: "#1f2228" }, car);
    el("rect", { x: 15, y: 12, width: 9, height: 6, rx: 2, fill: "#1f2228" }, car);
    el("rect", { x: -28, y: -15, width: 58, height: 30, rx: 11, fill: C.accent }, car);              // gövde
    el("rect", { x: -28, y: 3, width: 58, height: 12, rx: 8, fill: C.accentDark, opacity: 0.45 }, car); // alt gölgelik
    el("path", { d: "M 6 -11 L 14 -9 Q 17 0 14 9 L 6 11 Z", fill: "#27303d" }, car);                  // ön cam
    el("path", { d: "M -16 -10 L -11 -11 L -11 11 L -16 10 Q -18 0 -16 -10 Z", fill: "#27303d" }, car); // arka cam
    el("rect", { x: -11, y: -11, width: 17, height: 22, rx: 4, fill: "#f06e52" }, car);              // tavan
    el("rect", { x: -9, y: -8, width: 13, height: 4, rx: 2, fill: "rgba(255,255,255,0.25)" }, car);   // tavan parlaklığı
    el("rect", { x: 26, y: -12, width: 4, height: 6, rx: 1.5, fill: "#fff6d6" }, car);               // farlar
    el("rect", { x: 26, y: 6, width: 4, height: 6, rx: 1.5, fill: "#fff6d6" }, car);
    el("rect", { x: -29, y: -12, width: 3, height: 6, rx: 1.2, fill: "#b3241a" }, car);              // stoplar
    el("rect", { x: -29, y: 6, width: 3, height: 6, rx: 1.2, fill: "#b3241a" }, car);
    el("rect", { x: 4, y: -18, width: 5, height: 4, rx: 1.5, fill: C.accentDark }, car);            // aynalar
    el("rect", { x: 4, y: 14, width: 5, height: 4, rx: 1.5, fill: C.accentDark }, car);
  })();
  // far ışığı (durakta yanar)
  const beams = el("path", { d: "M 30 -10 L 120 -42 L 120 42 L 30 10 Z", fill: "url(#beam)", opacity: 0 }, car);
  car.insertBefore(beams, car.firstChild);
  const defs = el("defs", {}, svg);
  const grad = el("linearGradient", { id: "beam", x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
  el("stop", { offset: "0", "stop-color": "#fff3c4", "stop-opacity": 0.55 }, grad);
  el("stop", { offset: "1", "stop-color": "#fff3c4", "stop-opacity": 0 }, grad);
  const puffGrad = el("radialGradient", { id: "puff" }, defs);
  el("stop", { offset: "0", "stop-color": "#ece7df", "stop-opacity": 1 }, puffGrad);
  el("stop", { offset: "0.55", "stop-color": "#e4ded5", "stop-opacity": 0.6 }, puffGrad);
  el("stop", { offset: "1", "stop-color": "#e4ded5", "stop-opacity": 0 }, puffGrad);

  // ---------- Kaydırma → yol mesafesi (duraklarda yavaşlar) ----------
  const START_D = 40, END_D = roadLen - 70;
  STOPS.forEach((s) => { s.d = nearestD(s.anchor[0], s.anchor[1]); });
  const segs = []; // { w, d0, d1, stop }
  let prevD = START_D;
  STOPS.forEach((s, i) => {
    segs.push({ w: s.d - prevD, d0: prevD, d1: s.d });
    segs.push({ w: s.dwell, d0: s.d, d1: s.d, stop: i });
    prevD = s.d;
  });
  segs.push({ w: END_D - prevD, d0: prevD, d1: END_D });
  const totalW = segs.reduce((a, s) => a + s.w, 0);
  segs.forEach((s, i) => { if (s.stop === undefined) { s.easeIn = i > 0 && segs[i - 1].stop !== undefined; s.easeOut = i < segs.length - 1 && segs[i + 1].stop !== undefined; } });
  let acc = 0; segs.forEach((s) => { s.p0 = acc / totalW; acc += s.w; s.p1 = acc / totalW; });
  const scroller = document.getElementById("scroller");
  function sizeScroller() { scroller.style.height = Math.round(innerHeight + totalW * 1.15) + "px"; }

  function mapProgress(p) {
    for (const s of segs) if (p <= s.p1) {
      const k = (p - s.p0) / Math.max(1e-6, s.p1 - s.p0);
      // durağa yaklaşırken yavaşla, duraktan kalkarken yavaş yavaş hızlan
      const e = s.easeIn && s.easeOut ? (1 - Math.cos(Math.PI * k)) / 2 : s.easeOut ? Math.sin((k * Math.PI) / 2) : s.easeIn ? 1 - Math.cos((k * Math.PI) / 2) : k;
      return { d: s.d0 + (s.d1 - s.d0) * e, stop: s.stop !== undefined ? s.stop : null, k };
    }
    return { d: END_D, stop: null, k: 1 };
  }
  function progressOfStop(i) { const s = segs.find((x) => x.stop === i); return (s.p0 + s.p1) / 2; }

  // ---------- Rota listesi ----------
  const routeList = document.getElementById("routeList");
  const bar = document.createElement("span"); bar.className = "route__bar"; routeList.appendChild(bar);
  const routeItems = [];
  function routeItem(title, sub, onClick) {
    const li = document.createElement("li");
    const b = document.createElement("button"); b.type = "button";
    b.innerHTML = `<span class="dot"></span><span class="route__txt"></span>`;
    if (onClick) b.addEventListener("click", onClick); else b.disabled = true;
    li.appendChild(b); routeList.appendChild(li); routeItems.push(li);
    li._text = () => `${escHtml(title())}<small>${escHtml(sub())}</small>`;
    return li;
  }
  function renderRoute() { routeItems.forEach((li) => { li.querySelector(".route__txt").innerHTML = li._text(); }); }
  routeItem(() => t("route_start"), () => t("route_start_sub"), () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  STOPS.forEach((s, i) => routeItem(() => tr(s.title), () => tr(s.eyebrow), () => scrollTo({ top: progressOfStop(i) * maxScroll(), behavior: reduceMotion ? "auto" : "smooth" })));
  renderRoute();

  // ---------- Kart ----------
  const card = document.getElementById("card");
  let cardFor = null;
  // Projeler kartı: liste (i, null) ya da tek proje detayı (i, id)
  const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  const GH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5A11.5 11.5 0 0 0 8.37 22.9c.6.12.82-.26.82-.58v-2.1c-3.34.72-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.78-1.34-1.78-1.1-.75.08-.73.08-.73 1.22.08 1.86 1.25 1.86 1.25 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.91 0-1.3.47-2.36 1.24-3.19-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.22a11.4 11.4 0 0 1 6 0c2.29-1.54 3.3-1.22 3.3-1.22.66 1.65.25 2.87.12 3.17.77.83 1.24 1.89 1.24 3.19 0 4.6-2.8 5.61-5.47 5.91.43.38.82 1.12.82 2.26v3.35c0 .32.22.7.83.58A11.5 11.5 0 0 0 12 .5Z"/></svg>';
  let cardProjectId = null;
  function renderProjects(i, id) {
    cardProjectId = id || null;
    const s = STOPS[i], num = String(i + 1).padStart(2, "0");
    if (!id) {
      driveTo(null);
      card.innerHTML = `
        <p class="card__eyebrow"><span class="card__num">${num}</span>${tr(s.eyebrow)}</p>
        <h2>${tr(s.title)}</h2>
        <p class="card__sub">${tr(s.sub)}</p>
        <p class="card__text">${tr(s.text)}</p>
        <ul class="projects">${PROJECTS.map((p) => `
          <li><button class="proj" type="button" data-id="${p.id}" style="--tint:${PROJECT_TINT[p.id] || "#e85d3f"}">
            <span class="proj__bar" aria-hidden="true"></span>
            <span class="proj__body">
              <span class="proj__title">${escHtml(p.title)}</span>
              <span class="proj__tag">${escHtml(tr(p.tagline))}</span>
              <span class="proj__tech">${p.parts.map((x) => escHtml(x.tech)).join(" · ")}</span>
            </span>
            <span class="proj__go">${ARROW}</span>
          </button></li>`).join("")}</ul>`;
      card.querySelectorAll(".proj").forEach((b) => {
        b.addEventListener("mouseenter", () => hotProject(b.dataset.id));
        b.addEventListener("focus", () => hotProject(b.dataset.id));
        b.addEventListener("mouseleave", () => hotProject(null));
        b.addEventListener("blur", () => hotProject(null));
        b.addEventListener("click", () => { renderProjects(i, b.dataset.id); const back = card.querySelector(".back"); if (back) back.focus({ preventScroll: true }); });
      });
      return;
    }
    const p = PROJECTS.find((x) => x.id === id);
    requestAnimationFrame(() => hotProject(id)); // eski butonun blur olayından sonra vurgula
    driveTo(id);
    const links = [
      p.links && p.links.demo ? `<a class="btn btn--primary" href="${escHtml(p.links.demo)}" target="_blank" rel="noopener">${t("live_demo")} ${ARROW}</a>` : "",
      p.links && p.links.source ? `<a class="btn ${p.links.demo ? "" : "btn--primary"}" href="${escHtml(p.links.source)}" target="_blank" rel="noopener">${GH} ${t("source")}</a>` : ""
    ].join("");
    card.innerHTML = `
      <button class="back" type="button"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4"/></svg>${t("all_projects")}</button>
      <p class="card__eyebrow" style="--tint:${PROJECT_TINT[p.id]}"><span class="card__num card__num--tint">${num}</span>${escHtml(tr(p.status))}</p>
      <h2>${escHtml(p.title)}</h2>
      <p class="card__sub">${escHtml(tr(p.tagline))}</p>
      <p class="card__text">${escHtml(tr(p.desc))}</p>
      <p class="card__label">${t("highlights")}</p>
      <ul class="feats">${(tr(p.features) || []).map((x) => `<li>${escHtml(x)}</li>`).join("")}</ul>
      ${p.role ? `<p class="card__label">${t("my_role")}</p><p class="card__text card__text--tight">${escHtml(tr(p.role))}</p>` : ""}
      <p class="card__label">${t("tech")}</p>
      <ul class="chips">${p.parts.map((x) => `<li>${escHtml(x.tech)}</li>`).join("")}</ul>
      ${links ? `<div class="links">${links}</div>` : ""}`;
    card.classList.add("is-swap");
    requestAnimationFrame(() => card.classList.remove("is-swap"));
    card.querySelector(".back").addEventListener("click", () => { renderProjects(i, null); const first = card.querySelector(`.proj[data-id="${id}"]`); if (first) first.focus({ preventScroll: true }); });
    card.scrollTop = 0;
  }

  const SOCIAL_ICON = {
    gh: GH,
    in: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5ZM0 8h5v16H0V8Zm7.5 0h4.8v2.2h.07c.67-1.27 2.3-2.6 4.73-2.6C21.1 7.6 24 10.05 24 15.08V24h-5v-8.05c0-1.92-.03-4.4-2.68-4.4-2.68 0-3.09 2.1-3.09 4.27V24h-5V8Z"/></svg>`,
    ig: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm-5 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2Zm4.1-3.25a.9.9 0 1 1-.9-.9.9.9 0 0 1 .9.9Z"/></svg>`
  };
  function renderContact(i) {
    const s = STOPS[i], num = String(i + 1).padStart(2, "0");
    card.innerHTML = `
      <p class="card__eyebrow"><span class="card__num">${num}</span>${tr(s.eyebrow)}</p>
      <h2>${tr(s.title)}</h2>
      <p class="card__sub">${tr(s.sub)}</p>
      <p class="card__text">${tr(s.text)}</p>
      <div class="links links--social">${CONTACT.links.map((l) => `<a class="btn btn--social btn--${l.icon}" href="${l.href}" target="_blank" rel="noopener">${SOCIAL_ICON[l.icon]}${l.label}</a>`).join("")}</div>
      <form class="form" id="contactForm" novalidate>
        <input type="hidden" name="access_key" value="${CONTACT.accessKey}" />
        <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <div class="form__row">
          <label class="field"><span>${t("f_name")}</span><input name="name" type="text" autocomplete="name" required /></label>
          <label class="field"><span>${t("f_email")}</span><input name="email" type="email" autocomplete="email" required /></label>
        </div>
        <label class="field"><span>${t("f_message")}</span><textarea name="message" rows="4" required></textarea></label>
        <div class="form__foot">
          <button class="btn btn--primary" type="submit">${t("f_send")}</button>
          <p class="form__status" role="status" aria-live="polite"></p>
        </div>
      </form>`;
    const form = card.querySelector("#contactForm"), status = card.querySelector(".form__status"), btn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { status.textContent = t("f_invalid"); status.className = "form__status is-error"; form.reportValidity(); return; }
      status.textContent = t("f_sending"); status.className = "form__status";
      btn.disabled = true;
      try {
        const payload = Object.fromEntries(new FormData(form).entries());
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        if (!(res.headers.get("content-type") || "").includes("application/json")) throw new Error(t("f_bad"));
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || t("f_fail"));
        status.textContent = t("f_ok"); status.className = "form__status is-ok";
        form.reset();
        if (mailFlag) mailFlag.setAttribute("transform", "rotate(0 1150 3812)"); // posta kutusunun bayrağı kalkar
      } catch (err) {
        status.textContent = err.message; status.className = "form__status is-error";
      } finally { btn.disabled = false; }
    });
  }

  let pendingProject = null;
  function openProjectFromMap(id) {
    const i = STOPS.findIndex((x) => x.type === "projects");
    if (cardFor === i) { renderProjects(i, id); return; }
    pendingProject = id; // durağa gelince bu projeyi aç
    scrollTo({ top: progressOfStop(i) * maxScroll(), behavior: reduceMotion ? "auto" : "smooth" });
  }

  function showCard(i) {
    if (cardFor === i) return;
    cardFor = i;
    hotProject(null);
    driveTo(null);
    if (i === null) { card.classList.remove("is-open"); document.body.classList.remove("card-left"); return; }
    const s = STOPS[i];
    card.classList.toggle("is-wide", s.type === "projects" || s.type === "contact");
    if (s.type === "projects") { renderProjects(i, pendingProject); pendingProject = null; }
    else if (s.type === "contact") renderContact(i);
    else renderInfo(i);
    card.classList.toggle("is-left", s.side === "left");
    document.body.classList.toggle("card-left", s.side === "left");
    card.hidden = false;
    void card.offsetWidth;
    card.classList.add("is-open");
  }
  function renderInfo(i) {
    const s = STOPS[i];
    card.innerHTML = `
      <p class="card__eyebrow"><span class="card__num">${String(i + 1).padStart(2, "0")}</span>${tr(s.eyebrow)}</p>
      <h2>${tr(s.title)}</h2>
      <p class="card__sub">${tr(s.sub)}</p>
      <p class="card__text">${tr(s.text)}</p>
      <p class="card__label">${tr(s.label)}</p>
      <ul class="chips">${tr(s.chips).map((c) => `<li>${c}</li>`).join("")}</ul>`;
  }

  // ---------- Kamera + döngü ----------
  const hero = document.querySelector(".hero");
  const state = { d: START_D, targetD: START_D, ang: 0, zoom: 1, beam: 0, speed: 0, drift: 0 };
  const tangentAt = (d) => { const a = roadPath.getPointAtLength(Math.max(0, d - 4)), b = roadPath.getPointAtLength(Math.min(roadLen, d + 4)); return Math.atan2(b.y - a.y, b.x - a.x); };
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
  let cur = { d: START_D, stop: null, k: 0 };
  function readScroll() {
    const p = Math.min(1, Math.max(0, scrollY / maxScroll()));
    cur = mapProgress(p);
    state.targetD = cur.d;
    hero.classList.toggle("is-gone", p > 0.015);
    // kart: durakta (bekleme aralığının ortasında) açık
    const atStop = cur.stop !== null && cur.k > 0.02 && cur.k < 0.97; // araba durunca hemen aç
    showCard(atStop ? cur.stop : null);
    // rota
    const passed = STOPS.map((s) => cur.d >= s.d - 2);
    routeItems.forEach((li, idx) => {
      const isStart = idx === 0, si = idx - 1;
      li.classList.toggle("is-passed", isStart ? cur.d > START_D + 5 : si < STOPS.length && passed[si] && cur.stop !== si);
      li.classList.toggle("is-current", (isStart && p <= 0.015) || (si >= 0 && cur.stop === si));
    });
    const stopFrac = STOPS.length ? Math.min(1, cur.d / STOPS[STOPS.length - 1].d) : 0;
    bar.style.transform = `scaleY(${(stopFrac * (STOPS.length / (routeItems.length - 1))).toFixed(3)})`;
    kick();
  }

  let raf = 0, last = 0;
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function angDiff(a, b) { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const k = reduceMotion ? 1 : 1 - Math.exp(-7 * dt);
    const prevD = state.d;
    if (!state.branch) state.d += (state.targetD - state.d) * k;
    const speed = (state.d - prevD) / Math.max(dt, 0.001); // dünya birimi / sn
    state.speed += (Math.abs(speed) - state.speed) * (1 - Math.exp(-8 * dt));
    const p = roadPath.getPointAtLength(state.d);
    const p2 = roadPath.getPointAtLength(Math.min(roadLen, state.d + 6));
    const p1 = roadPath.getPointAtLength(Math.max(0, state.d - 6));
    let target = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    let cp = p, branchMoving = false;
    if (state.branch) { const r = stepBranch(dt); cp = r.p; target = r.ang; branchMoving = r.moving; }
    state.ang += angDiff(state.ang, target) * (reduceMotion ? 1 : 1 - Math.exp(-10 * dt));
    // durakta farlar yanar
    const beamT = cur.stop !== null && !state.branch ? 1 : 0; // park edince farlar söner
    state.beam += (beamT - state.beam) * (1 - Math.exp(-5 * dt));
    beams.setAttribute("opacity", state.beam.toFixed(3));
    // drift: virajda arka dışa kayar (burun virajın içine döner); hızla orantılı
    const curv = angDiff(tangentAt(state.d - 25), tangentAt(state.d + 25)) / 50;
    const sharp = Math.abs(curv) > 0.0022, fast = speed > 140; // sadece ileri giderken, keskin virajda ve hızlıyken
    const driftT = reduceMotion || state.branch || !sharp || !fast ? 0 : Math.max(-0.26, Math.min(0.26, curv * speed * 0.1));
    state.drift += (driftT - state.drift) * (1 - Math.exp(-6 * dt));
    const A = state.ang + state.drift, ca = Math.cos(A), sa = Math.sin(A);
    const toWorld = (lx, ly) => [cp.x + (lx * ca - ly * sa) * 1.3, cp.y + (lx * sa + ly * ca) * 1.3];
    car.setAttribute("transform", `translate(${cp.x.toFixed(1)} ${cp.y.toFixed(1)}) rotate(${(A * 180 / Math.PI).toFixed(2)}) scale(1.3)`);
    // egzoz dumanı
    let fxActive = false;
    if (!reduceMotion) {
      const drifting = Math.abs(state.drift) > 0.15 && speed > 160;
      if (speed > 60) smokeAcc += dt * Math.min(14, speed / 40) * (drifting ? 1.4 : 1);
      while (smokeAcc >= 1) {
        smokeAcc -= 1;
        const pf = puffs[puffI++ % puffs.length];
        const src = drifting && Math.random() < 0.6 ? toWorld(-20, Math.random() < 0.5 ? -15 : 15) : toWorld(-31, 7);
        pf.x = src[0]; pf.y = src[1]; pf.life = 0; pf.r0 = 6 + Math.random() * 5;
        pf.vx = -ca * (20 + Math.random() * 20) + (Math.random() - 0.5) * 16; pf.vy = -sa * (20 + Math.random() * 20) + (Math.random() - 0.5) * 16;
      }
      puffs.forEach((pf) => {
        if (pf.life >= 1) return;
        fxActive = true;
        pf.life = Math.min(1, pf.life + dt / 1.1);
        pf.x += pf.vx * dt; pf.y += pf.vy * dt; pf.vx *= 0.96; pf.vy *= 0.96;
        pf.n.setAttribute("cx", pf.x.toFixed(1)); pf.n.setAttribute("cy", pf.y.toFixed(1));
        pf.n.setAttribute("r", (pf.r0 + Math.sqrt(pf.life) * 30).toFixed(1));
        pf.n.setAttribute("opacity", (0.5 * (1 - pf.life)).toFixed(3));
      });
      // lastik izleri (sadece belirgin kaymada)
      [-15, 15].forEach((ly, wi) => {
        const w = toWorld(-20, ly);
        if (!drifting) { lastWheel[wi] = null; return; }
        const lw = lastWheel[wi];
        if (lw && Math.hypot(w[0] - lw[0], w[1] - lw[1]) > 7) {
          const m = marks[markI++ % marks.length];
          m.n.setAttribute("x1", lw[0].toFixed(1)); m.n.setAttribute("y1", lw[1].toFixed(1));
          m.n.setAttribute("x2", w[0].toFixed(1)); m.n.setAttribute("y2", w[1].toFixed(1));
          m.life = 0; lastWheel[wi] = w;
        } else if (!lw) lastWheel[wi] = w;
      });
      marks.forEach((m) => {
        if (m.life >= 1) return;
        fxActive = true;
        m.life = Math.min(1, m.life + dt / 2.6);
        m.n.setAttribute("opacity", (0.55 * (1 - m.life)).toFixed(3));
      });
    }
    // kamera: araba ekranda; kart açıkken arabayı karttan uzağa al
    const W = innerWidth, H = innerHeight, mobile = W <= 720;
    const cardOpen = card.classList.contains("is-open");
    const stop = cardFor !== null ? STOPS[cardFor] : null;
    let zoom = mobile ? 0.72 : Math.min(1.1, Math.max(0.8, W / 1500));
    let sx = mobile ? W * 0.5 : W * (state.d < START_D + 200 ? 0.66 : 0.5);
    if (cardOpen && !mobile && stop) {
      // kartın yanındaki boş alana arabayı ve durağı sığdır
      const cw = card.offsetWidth + 40, free = W - cw;
      zoom = Math.min(zoom, (free - 60) / (stop.span + 120));
      sx = stop.side === "left" ? cw + 60 / 2 + 60 * zoom : free - 60 - 60 * zoom;
    }
    if (cardOpen && mobile && stop) { zoom = Math.min(0.72, Math.max(0.36, (W - 24) / (stop.span + 160))); sx = W * 0.14; }
    const sy = mobile ? (cardOpen ? H * 0.24 : H * 0.34) : H * 0.48;
    // kamera: arabanın ekrandaki yeri ve yakınlık yumuşakça değişir (kart açılınca sinematik geçiş)
    const firstFrame = state.sx === undefined;
    const ck = firstFrame || reduceMotion ? 1 : 1 - Math.exp(-2.4 * dt);
    if (firstFrame) { state.sx = sx; state.sy = sy; state.zoom = zoom; }
    state.sx += (sx - state.sx) * ck; state.sy += (sy - state.sy) * ck; state.zoom += (zoom - state.zoom) * ck;
    const tx = state.sx - p.x * state.zoom, ty = state.sy - p.y * state.zoom;
    world.setAttribute("transform", `translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${state.zoom.toFixed(4)})`);
    const moving = branchMoving || fxActive || Math.abs(angDiff(state.ang, target)) > 0.002 || Math.abs(state.drift) > 0.002 || Math.abs(state.targetD - state.d) > 0.3 || Math.abs(sx - state.sx) > 0.3 || Math.abs(sy - state.sy) > 0.3 || Math.abs(zoom - state.zoom) > 0.0005 || Math.abs(beamT - state.beam) > 0.01;
    raf = 0;
    if (moving) raf = requestAnimationFrame(tick); // durunca döngü uyur
  }

  // ---------- Özet görünüm (İK için tek sayfalık CV; #ozet ile açılır) ----------
  const summary = document.getElementById("summary"), summaryBtn = document.getElementById("summaryBtn");
  function renderSummary() {
    const edu = STOPS.find((x) => x.id === "karabuk");
    const contactIdx = STOPS.findIndex((x) => x.type === "contact");
    const skills = [...new Set(PROJECTS.flatMap((p) => p.parts.map((x) => x.tech)))];
    summary.innerHTML = `
      <div class="summary__inner">
        <div class="summary__bar">
          <span class="summary__tag">${t("s_tag")}</span>
          <button class="back summary__close" type="button"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4"/></svg>${t("s_back")}</button>
        </div>
        <header class="summary__head">
          <img src="assets/avatar.webp" alt="" width="96" height="96" />
          <div>
            <h2 id="summaryTitle">Mert Hasan Sarı</h2>
            <p class="summary__role">${t("s_role")}</p>
            <div class="links links--social">${CONTACT.links.map((l) => `<a class="btn btn--social btn--${l.icon}" href="${l.href}" target="_blank" rel="noopener">${SOCIAL_ICON[l.icon]}${l.label}</a>`).join("")}</div>
          </div>
        </header>
        <section class="summary__sec">
          <h3>${t("s_about")}</h3>
          <p>${escHtml(tr(edu.text))} ${t("s_about_more")}</p>
        </section>
        <section class="summary__sec">
          <h3>${t("s_edu")}</h3>
          <div class="summary__row"><div><strong>${escHtml(tr(edu.title))}</strong><span>${escHtml(tr(edu.sub))}</span></div><span class="summary__meta">${t("s_ongoing")}</span></div>
          <ul class="chips">${tr(edu.chips).map((c) => `<li>${escHtml(c)}</li>`).join("")}</ul>
        </section>
        <section class="summary__sec">
          <h3>${t("s_projects")}</h3>
          <div class="summary__projects">${PROJECTS.map((p) => `
            <article class="summary__proj" style="--tint:${PROJECT_TINT[p.id] || "#e85d3f"}">
              <div class="summary__projhead"><strong>${escHtml(p.title)}</strong><span class="summary__meta">${escHtml(tr(p.status))}</span></div>
              <p>${escHtml(tr(p.desc))}</p>
              <p class="summary__tech">${p.parts.map((x) => escHtml(x.tech)).join(" · ")}</p>
              <div class="summary__links">
                ${p.links && p.links.demo ? `<a href="${escHtml(p.links.demo)}" target="_blank" rel="noopener">${t("live_demo")}</a>` : ""}
                ${p.links && p.links.source ? `<a href="${escHtml(p.links.source)}" target="_blank" rel="noopener">${t("source")}</a>` : ""}
              </div>
            </article>`).join("")}</div>
        </section>
        <section class="summary__sec">
          <h3>${t("s_skills")}</h3>
          <ul class="chips">${skills.map((c) => `<li>${escHtml(c)}</li>`).join("")}</ul>
        </section>
        <section class="summary__sec summary__cta">
          <div><h3>${t("s_contact")}</h3><p>${t("s_contact_text")}</p></div>
          <button class="btn btn--primary summary__msg" type="button">${t("s_msg")} ${ARROW}</button>
        </section>
      </div>`;
    summary.querySelector(".summary__close").addEventListener("click", () => closeSummary());
    summary.querySelector(".summary__msg").addEventListener("click", () => {
      closeSummary(true);
      scrollTo({ top: progressOfStop(contactIdx) * maxScroll(), behavior: "auto" });
    });
  }
  let summaryOpen = false;
  function openSummary(push) {
    if (summaryOpen) return;
    summaryOpen = true;
    if (!summary.innerHTML) renderSummary();
    summary.hidden = false;
    void summary.offsetWidth;
    summary.classList.add("is-open");
    document.documentElement.classList.add("summary-lock");
    if (push && location.hash !== "#ozet") history.pushState(null, "", "#ozet");
    summary.querySelector(".summary__close").focus({ preventScroll: true });
  }
  function closeSummary(silent) {
    if (!summaryOpen) return;
    summaryOpen = false;
    summary.classList.remove("is-open");
    document.documentElement.classList.remove("summary-lock");
    setTimeout(() => { if (!summaryOpen) summary.hidden = true; }, 350);
    if (location.hash === "#ozet") history.replaceState(null, "", location.pathname + location.search);
    if (!silent) summaryBtn.focus({ preventScroll: true });
  }
  summaryBtn.addEventListener("click", (e) => { e.preventDefault(); openSummary(true); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && summaryOpen) closeSummary(); });
  addEventListener("hashchange", () => { if (location.hash === "#ozet") openSummary(false); else closeSummary(true); });
  if (location.hash === "#ozet") openSummary(false);

  // ---------- Dil değiştirme ----------
  function applyLang(next) {
    lang = next === "en" ? "en" : "tr";
    store.set("preferredLang", lang);
    document.documentElement.lang = lang;
    document.title = t("doc_title");
    const md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute("content", t("doc_desc"));
    document.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", t(n.dataset.i18nAria)));
    document.querySelectorAll(".lang__btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    mapLabels.forEach(([node, key]) => { node.textContent = t(key); });
    renderRoute();
    // açık kartı yeni dilde yeniden çiz (formdaki yazılanlar korunur)
    if (cardFor !== null) {
      const s = STOPS[cardFor];
      if (s.type === "projects") renderProjects(cardFor, cardProjectId);
      else if (s.type === "contact") {
        const form = card.querySelector("#contactForm");
        const vals = form ? Object.fromEntries(new FormData(form).entries()) : {};
        renderContact(cardFor);
        const nf = card.querySelector("#contactForm");
        ["name", "email", "message"].forEach((k) => { if (vals[k]) nf.elements[k].value = vals[k]; });
      } else renderInfo(cardFor);
    }
    if (summary.innerHTML) { renderSummary(); if (summaryOpen) summary.querySelector(".summary__close").focus({ preventScroll: true }); }
  }
  document.querySelectorAll(".lang__btn").forEach((b) => b.addEventListener("click", () => { if (b.dataset.lang !== lang) applyLang(b.dataset.lang); }));
  applyLang(lang);

  world.appendChild(car); // araba en üstte
  state.ang = tangentAt(START_D); // ilk karede yol yönüne bak
  sizeScroller();
  addEventListener("scroll", readScroll, { passive: true });
  addEventListener("resize", () => { sizeScroller(); readScroll(); });
  readScroll();
})();
