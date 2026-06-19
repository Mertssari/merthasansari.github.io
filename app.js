const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((el) => revealObserver.observe(el));

const tiltCard = document.querySelector("[data-tilt]");
if (tiltCard) {
  tiltCard.addEventListener("mousemove", (event) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = ((y / rect.height) - 0.5) * -10;
    tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  tiltCard.addEventListener("mouseleave", () => {
    tiltCard.style.transform = "rotateX(0) rotateY(0)";
  });
}

const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "GÃ¶nderiliyor...";
    formStatus.classList.remove("success", "error");

    const submitButton = contactForm.querySelector("button[type='submit']");
    submitButton.disabled = true;

    try {
      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Sunucu beklenmeyen bir yanÄ±t dÃ¶ndÃ¼rdÃ¼.");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "GÃ¶nderim baÅŸarÄ±sÄ±z.");
      }

      formStatus.textContent = "MesajÄ±nÄ±z baÅŸarÄ±yla iletildi!";
      formStatus.classList.add("success");
      contactForm.reset();
    } catch (error) {
      formStatus.textContent = error.message;
      formStatus.classList.add("error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

// Internationalization (i18n)
const translations = {
  tr: {
    profile_role: "Bilgisayar Mühendisliği",
    nav_welcome: "Hoşgeldiniz",
    nav_about: "Hakkımda",
    nav_resume: "Özgeçmiş",
    nav_contact: "İletişim",
    hero_eyebrow: "Yeni Nesil Portfolyo",
    hero_subtitle: "Bilgisayar Mühendisliği",
    hero_lead: "Teknoloji ve estetiğin kesişiminde, güvenli ve ölçeklenebilir dijital deneyimler tasarlıyorum.",
    hero_contact: "İletişim",
    hero_resume: "Özgeçmiş",
    about_eyebrow: "Hakkımda",
    about_title: "Vizyoner ve disiplinler arası bir mühendislik bakışı",
    about_lead: "Karabük Üniversitesi Bilgisayar Mühendisliği 2. sınıf öğrencisiyim.",
    resume_eyebrow: "Özgeçmiş",
    resume_title: "Deneyim ve odak alanları",
    resume_lead: "Sürekli gelişen teknoloji ekosisteminde ekip çalışması ve veri yönetimi odaklı projeler.",
    res_item1_title: "Web siteleri",
    res_item1_desc: "GitHub üzerinden ekip çalışmasıyla geliştirilen kapsamlı yönetim sistemi. Rol: modüler PHP yapısı, API entegrasyonu ve arayüz geliştirme.",
    res_item2_title: "Oracle SQL & MySQL Yetkinlikleri",
    res_item2_desc: "Veri modelleme, performans optimizasyonu ve güvenli sorgulama pratikleri.",
    res_item3_title: "Ulusal Staj Programı Hazırlıkları",
    res_item3_desc: "Bankaların IT departmanlarına yönelik hedeflenen çalışma planları ve proje portföyü geliştirme.",
    contact_eyebrow: "İletişim",
    contact_title: "Birlikte çalışalım",
    contact_lead: "Projenizi konuşalım ve güvenli, etkileyici bir dijital deneyim tasarlayalım.",
    form_name: "İsim",
    form_email: "E-posta",
    form_message: "Mesaj",
    form_submit: "Gönder",
    contact_note_title: "Hızlı Not",
    contact_note_desc: "Mesajlarınıza en kısa sürede dönüş yapılacaktır.",
    contact_focus_title: "Odak",
    contact_focus_desc: "Güvenlik, performans ve modern arayüz standardı.",
    footer_text: "© 2026 Mert Hasan Sarı. Tüm hakları saklıdır.",
    profile_photo_alt: "Mert Hasan Sarı profil fotoğrafı",
    menu_aria_label: "Menü",
    social_instagram: "Instagram",
    social_linkedin: "LinkedIn",
    social_github: "GitHub"
  },
  en: {
    profile_role: "Computer Engineering",
    nav_welcome: "Welcome",
    nav_about: "About",
    nav_resume: "Resume",
    nav_contact: "Contact",
    hero_eyebrow: "Next-Gen Portfolio",
    hero_subtitle: "Computer Engineering",
    hero_lead: "Designing secure and scalable digital experiences at the intersection of technology and aesthetics.",
    hero_contact: "Contact",
    hero_resume: "Resume",
    about_eyebrow: "About Me",
    about_title: "Broad engineering perspective with a visionary focus",
    about_lead: "I am a 2nd year Computer Engineering student at Karabük University.",
    resume_eyebrow: "Resume",
    resume_title: "Experience and focus areas",
    resume_lead: "Data management and teamwork-oriented projects in a constantly evolving tech ecosystem.",
    res_item1_title: "Websites",
    res_item1_desc: "Comprehensive management system developed through GitHub teamwork. Role: modular PHP structure, API integration and UI development.",
    res_item2_title: "Oracle SQL & MySQL Skills",
    res_item2_desc: "Data modeling, performance optimization and secure querying practices.",
    res_item3_title: "National Internship Program Prep",
    res_item3_desc: "Targeted work plans and project portfolio development for IT departments of banks.",
    contact_eyebrow: "Contact",
    contact_title: "Let's work together",
    contact_lead: "Let's discuss your project and design a secure, impressive digital experience.",
    form_name: "Name",
    form_email: "Email",
    form_message: "Message",
    form_submit: "Send",
    contact_note_title: "Quick Note",
    contact_note_desc: "Your messages will be answered as soon as possible.",
    contact_focus_title: "Focus",
    contact_focus_desc: "Security, performance and modern interface standards.",
    footer_text: "© 2026 Mert Hasan Sarı. All rights reserved.",
    profile_photo_alt: "Mert Hasan Sarı profile photo",
    menu_aria_label: "Menu",
    social_instagram: "Instagram",
    social_linkedin: "LinkedIn",
    social_github: "GitHub"
  }
};

function changeLanguage(lang) {
  // Update texts
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Update alt tags
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const key = el.getAttribute('data-i18n-alt');
    if (translations[lang][key]) {
      el.alt = translations[lang][key];
    }
  });

  // Update aria-labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if (translations[lang][key]) {
      el.setAttribute('aria-label', translations[lang][key]);
    }
  });

  // Update button states
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  // Update HTML lang attribute
  document.documentElement.lang = lang;

  // Save preference
  localStorage.setItem('preferredLang', lang);
}

// Language Switch Event Listeners
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    changeLanguage(btn.getAttribute('data-lang'));
  });
});

// Initialize Language on Load
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('preferredLang') || 'tr';
  changeLanguage(savedLang);
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Close menu when a link is clicked
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
}

