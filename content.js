function markIssue(element, message) {
  if (!element || element.dataset.audited) return;
  element.dataset.audited = 'true';
  element.style.setProperty('border', '3px solid #ff4d4f', 'important');
  element.style.setProperty('background-color', 'rgba(255, 77, 79, 0.1)', 'important');
  element.style.setProperty('border-radius', '4px', 'important');
  element.style.setProperty('padding', '2px', 'important');
  
  const noteHtml = `<div style="display:inline-block; background-color:#fef2f2; border:1px solid #f87171; color:#b91c1c; font-size:11px; padding:2px 6px; border-radius:4px; margin-left:8px; vertical-align:middle; font-weight:600; box-shadow:0 1px 2px rgba(0,0,0,0.1); z-index:99999; position:relative;">❌ Sorun: ${message}</div>`;
  element.insertAdjacentHTML('afterend', noteHtml);
}

function markSuccess(element, message) {
  if (!element || element.dataset.audited) return;
  element.dataset.audited = 'true';
  element.style.setProperty('border', '3px solid #10b981', 'important');
  element.style.setProperty('background-color', 'rgba(16, 185, 129, 0.1)', 'important');
  element.style.setProperty('border-radius', '4px', 'important');
  element.style.setProperty('padding', '2px', 'important');
  
  const noteHtml = `<div style="display:inline-block; background-color:#ecfdf5; border:1px solid #34d399; color:#047857; font-size:11px; padding:2px 6px; border-radius:4px; margin-left:8px; vertical-align:middle; font-weight:600; box-shadow:0 1px 2px rgba(0,0,0,0.1); z-index:99999; position:relative;">✅ Başarılı: ${message}</div>`;
  element.insertAdjacentHTML('afterend', noteHtml);
}

function isElementVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null && el.getBoundingClientRect().width > 0;
}

function runAudit() {
  let issuesFound = [];
  let successesFound = [];
  let healthScore = 100;
  
  let auditData = {
    businessName: "Bilinmiyor",
    rating: "Bilinmiyor",
    reviewCount: "Bilinmiyor",
    phone: "Bulunamadı",
    address: "Bulunamadı",
    website: "Eklenmemiş",
    issues: issuesFound,
    successes: successesFound,
    isUnclaimed: false,
    socialLinks: [],
    appointmentLink: false,
    competitors: []
  };

  // Haritalar için ana içerik paneli (Sol panel)
  let mainContainer = document.querySelector('div[role="main"]') || document.body;

  // 1. İşletme Adı Kontrolü (SEO ve Spam Analizi)
  let titleElement = document.querySelector('h1.DUwDvf') || document.querySelector('div.q0v9X h1') || document.querySelector('h1');
  
  if (titleElement) {
    let rawTitle = (titleElement.innerText || "").trim();
    auditData.businessName = rawTitle;
    let titleHasIssue = false;
    
    // Kural: Tümü Büyük Harf
    if (rawTitle === rawTitle.toUpperCase() && rawTitle.length > 3) {
      markIssue(titleElement, "Uzman Uyarısı: İşletme adının tamamı büyük harflerden oluşuyor. Bu durum Google Spam Politikalarına aykırıdır ve profilinizin askıya alınma (suspend) riskini maksimum seviyeye çıkarır.");
      issuesFound.push("İşletme adı büyük harf ihlali: Profil kapanma riski taşıyor.");
      healthScore -= 15;
      titleHasIssue = true;
    }
    
    // Kural: Yasal Terimler
    const legalTerms = /LTD|LLC|A\.Ş\.|AŞ|SAN\.|TİC\.|ŞTİ\./i;
    if (legalTerms.test(rawTitle)) {
      markIssue(titleElement, "SEO Uyarısı: İşletme adınızda yasal terimler tespit edildi. Google yönergelerine göre işletme adı, tabelada yazdığı gibi sade olmalıdır. Gereksiz ekler yerel sıralama (Local SEO) performansını düşürür.");
      issuesFound.push("İşletme adında yasal şirket terimleri: SEO performans kaybı.");
      healthScore -= 10;
      titleHasIssue = true;
    }
    
    // Kural: Telefon Numarası İçerme
    const phoneInName = /\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}/;
    if (phoneInName.test(rawTitle)) {
      markIssue(titleElement, "Kritik İhlal: İşletme adında telefon numarası veya çağrı yönlendirici kullanım kesinlikle yasaktır. Profiliniz her an kalıcı olarak kapatılabilir.");
      issuesFound.push("İşletme adında telefon numarası: Kesin kapatılma sebebi.");
      healthScore -= 20;
      titleHasIssue = true;
    }

    if (!titleHasIssue) {
      markSuccess(titleElement, "Uzman Onayı: İşletme adı Google yönergelerine ve SEO standartlarına tam uyumlu.");
      successesFound.push("İşletme adı Google kurallarına uygun.");
    }
  } else {
    healthScore -= 20;
    issuesFound.push("İşletme adı tespit edilemedi. Profil yüklenmemiş olabilir.");
  }

  // 2. Yorum ve İtibar Yönetimi Analizi
  const ratingElement = document.querySelector('span.ce4YCe') || document.querySelector('div.F7nice span[aria-hidden="true"]');
  const reviewCountElement = document.querySelector('button[aria-label*="yorum"]') || document.querySelector('span[aria-label*="yorum"]') || document.querySelector('span.z5jxId') || document.querySelector('span.RDApEe');
  
  if (ratingElement) {
    const ratingText = (ratingElement.innerText || "").replace(',', '.').trim();
    auditData.rating = ratingText;
    const ratingNum = parseFloat(ratingText);
    
    if (ratingNum < 4.0) {
      issuesFound.push(`İtibar Yönetimi Riski: Puanınız ${ratingText}. 4.0 altı puanlar algoritma tarafından düşük kaliteli işletme olarak işaretlenir ve arama hacminiz düşürülür.`);
      healthScore -= 15;
    } else if (ratingNum >= 4.8) {
      successesFound.push(`Mükemmel İtibar: ${ratingText} puan ile yüksek güvenilirlik sinyali üretiyorsunuz.`);
    } else {
      successesFound.push(`Ortalama Üstü İtibar: ${ratingText} puan. 4.8 ve üzerine çıkmak için strateji geliştirilmeli.`);
    }
  }

  let reviewText = "";
  
  // En güvenilir yol: Doğrudan F7nice (Puan bloğu) içindeki (155) şeklindeki parantezi yakalamak
  let ratingParent = document.querySelector('.F7nice') || (ratingElement ? ratingElement.parentElement : null);
  if (ratingParent) {
      let match = ratingParent.innerText.match(/\(([0-9.,]+)\)/);
      if (match) {
          reviewText = match[1].replace(/[^0-9]/g, '');
      }
  }

  // Eğer ana blokta yoksa, etiketleri kontrol et
  if (!reviewText && reviewCountElement) {
    let rawText = reviewCountElement.innerText || reviewCountElement.getAttribute('aria-label') || "";
    // Sadece içinde rakam varsa al (Örn: "Yorum yazın" butonunu ele)
    if (/[0-9]/.test(rawText)) {
       reviewText = rawText.replace(/[^0-9]/g, '');
    }
  }

  // Son çare: Tüm dokümanı tara
  if (!reviewText) {
     let possibleReviewElements = document.querySelectorAll('button[aria-label*="yorum"], span[aria-label*="yorum"], a[aria-label*="yorum"], span.z5jxId, span.RDApEe');
     for (let el of possibleReviewElements) {
         let text = el.innerText || el.getAttribute('aria-label') || "";
         if ((text.includes('yorum') || text.includes('değerlendirme') || /\([0-9.,]+\)/.test(text)) && /[0-9]/.test(text)) {
             reviewText = text.replace(/[^0-9]/g, '');
             if (reviewText.length > 0) break;
         }
     }
  }

  auditData.reviewCount = reviewText || "0";
  if (reviewText && parseInt(reviewText) < 10) {
    issuesFound.push("Yorum Sayısı Yetersiz: 10'dan az yorum, rakiplerinize kıyasla dijital otoritenizi zayıflatır.");
    healthScore -= 5;
  }

  // 3. Kategori Analizi (Local SEO'nun kalbi)
  let catText = "";
  const categoryElement = mainContainer.querySelector('button[data-item-id="category"]') || mainContainer.querySelector('button.DkEaL') || mainContainer.querySelector('button[jsaction*="category"]') || mainContainer.querySelector('.sk9p1c');
  
  if (categoryElement) {
    let catTextContainer = categoryElement.querySelector('.Io6YTe');
    catText = catTextContainer ? catTextContainer.innerText.trim() : (categoryElement.innerText || "").trim();
    if (catText.startsWith('·')) catText = catText.substring(1).trim();
    if (catText.length < 2) {
      catText = (categoryElement.getAttribute('aria-label') || "").replace('Kategori:', '').trim();
    }
  }

  if (!catText || catText.length < 2) {
      let ratingParent = mainContainer.querySelector('.F7nice') || (ratingElement ? ratingElement.parentElement : null);
      if (ratingParent && ratingParent.nextElementSibling) {
          let text = ratingParent.nextElementSibling.innerText || "";
          if (text.toLowerCase().includes('otel')) {
              catText = text.split('\n')[0].trim();
          }
      }
  }

  if (!catText || catText.length < 2) {
      let topElements = mainContainer.querySelectorAll('span, button, div');
      for (let i = 0; i < Math.min(topElements.length, 60); i++) {
          let text = topElements[i].innerText || "";
          if (text && text.length > 3 && text.length < 35 && /otel|hotel|pansiyon|resort/i.test(text) && !text.includes(auditData.businessName) && !text.includes('yorum')) {
              catText = text.trim();
              break;
          }
      }
  }

  // Cleanup catText (Remove garbage like "4.5 \n (115) \n · Otel")
  if (catText) {
      if (catText.includes('·')) {
          catText = catText.split('·').pop().trim();
      }
      if (catText.includes('\n')) {
          catText = catText.split('\n').pop().trim();
      }
      catText = catText.replace(/^[0-9.,()\s]+/, '').trim();
  }

  if (catText && catText.length >= 2) {
    successesFound.push(`Ana Kategori Optimize: Sektörel hedefleme yapılmış (${catText}). Uzman tavsiyesi: Alt kategorilerin de eksiksiz girildiğinden emin olun.`);
  } else {
    issuesFound.push("Kritik SEO Eksikliği: İşletme kategorisi net olarak belirlenemedi. Yerel aramalarda (Local Pack) görünürlüğünüzü doğrudan etkileyen en önemli faktör eksik.");
    healthScore -= 15;
  }

  // 4. İletişim Bilgileri (NAP Tutarlılığı - Name, Address, Phone)
  let phoneElement = document.querySelector('[data-item-id^="phone"]') || document.querySelector('button[data-tooltip*="Telefon"]') || document.querySelector('[aria-label*="Telefon:"]');
  if (phoneElement) {
    let textContainer = phoneElement.querySelector('.Io6YTe');
    let text = textContainer ? textContainer.innerText.trim() : (phoneElement.getAttribute('data-tooltip') || "").replace('Telefon:', '').trim();
    text = text.replace(/kopyala/i, '').trim();
    if (text === "") {
        // Fallback: aria-label if exists
        text = (phoneElement.getAttribute('aria-label') || "").replace('Telefon:', '').replace(/kopyala/i, '').trim();
    }
    auditData.phone = text || "Bulunamadı";
    markSuccess(phoneElement, "NAP Onayı: Telefon numarası mevcut ve erişilebilir.");
    successesFound.push("Telefon numarası eklendi (NAP Tutarlılığı).");
  } else {
    issuesFound.push("Erişilebilirlik Sorunu: Telefon numarası bulunamadı. Müşteri dönüşüm (Conversion) oranınız ciddi şekilde düşüyor.");
    healthScore -= 15;
  }

  let addressElement = document.querySelector('[data-item-id="address"]') || document.querySelector('button[data-tooltip*="Adres"]') || document.querySelector('[aria-label*="Adres:"]');
  if (addressElement) {
    let textContainer = addressElement.querySelector('.Io6YTe');
    let text = textContainer ? textContainer.innerText.trim() : (addressElement.getAttribute('data-tooltip') || "").replace('Adres:', '').trim();
    text = text.replace(/kopyala/i, '').trim();
    if (text === "") {
        text = (addressElement.getAttribute('aria-label') || "").replace('Adres:', '').replace(/kopyala/i, '').trim();
    }
    auditData.address = text || "Bulunamadı";
    markSuccess(addressElement, "NAP Onayı: Açık adres mevcut. (Görünürlük için pin konumunuzun doğruluğu teyit edilmelidir).");
    successesFound.push("Fiziksel Konum: Açık adres mevcut.");
  } else {
    issuesFound.push("Bölgesel SEO Kaybı: Açık adres eklenmemiş. 'Yakınımdaki ...' (Near Me) aramalarında asla listelenemezsiniz.");
    healthScore -= 15;
  }

  // 5. Dijital Varlık Kontrolü (Web Sitesi)
  let websiteElement = document.querySelector('[data-item-id="authority"]') || document.querySelector('a[data-tooltip*="Web"]');
  if (websiteElement) {
    let rawUrl = websiteElement.href;
    try {
      const u = new URL(rawUrl);
      // Google yönlendirme linklerini (tracking) temizle
      if (u.hostname.includes('google')) {
        if (u.searchParams.has('adurl')) {
            rawUrl = u.searchParams.get('adurl');
        } else if (u.searchParams.has('url')) {
            rawUrl = u.searchParams.get('url');
        } else if (u.searchParams.has('q')) {
            rawUrl = u.searchParams.get('q');
        }
      }
      
      let finalHostname = new URL(rawUrl).hostname;
      // Görselliği temizlemek için baştaki www. kısmını atalım
      if (finalHostname.startsWith('www.')) {
          finalHostname = finalHostname.substring(4);
      }
      auditData.website = finalHostname;
      successesFound.push("Dijital Varlık: Web sitesi bağlantısı mevcut. Otorite sinyali güçlendirilmiş.");
    } catch (e) {
      auditData.website = "Geçersiz Link";
    }
  } else {
    issuesFound.push("Otorite Eksikliği: İşletmenize ait web sitesi bağlantısı yok. Google algoritması web sitesi olmayan işletmeleri daha az güvenilir bulur.");
    healthScore -= 10;
  }

  // 6. Premium SEO Kontrolleri & Lead Generation
  
  // A. Sahiplenilmemiş İşletme (Unclaimed Business)
  let claimElement = mainContainer.querySelector('a[data-item-id="merchant"]') || mainContainer.querySelector('a[aria-label*="sahiplenin"]') || mainContainer.querySelector('a[aria-label*="own this"]');
  if (!claimElement) {
    let allLinks = mainContainer.querySelectorAll('a');
    for(let a of allLinks) {
       let txt = a.innerText.toLowerCase();
       if (txt.includes('işletmeyi sahiplenin') || txt.includes('own this business')) {
          claimElement = a; break;
       }
    }
  }
  auditData.isUnclaimed = !!claimElement;

  // B. Randevu / Sipariş / Rezervasyon Linki
  let apptElement = document.querySelector('a[data-item-id="action:make_appointment"]') || document.querySelector('a[data-item-id="action:place_order"]');
  if (!apptElement) {
     let actionButtons = document.querySelectorAll('button, a, div[role="button"]');
     for(let b of actionButtons) {
        let txt = (b.innerText || "").toLowerCase();
        if (txt.includes('müsaitlik') || txt.includes('rezervasyon') || txt.includes('availability') || txt.includes('book') || txt.includes('oda') || txt.includes('fiyat')) {
           apptElement = b; 
           break;
        }
     }
  }
  auditData.appointmentLink = !!apptElement;

  // C. Sosyal Medya Profilleri
  auditData.socialLinks = [];
  let sLinks = document.querySelectorAll('a[href*="instagram.com"], a[href*="facebook.com"], a[href*="twitter.com"], a[href*="linkedin.com"], a[href*="tiktok.com"], a[href*="x.com"]');
  sLinks.forEach(l => {
     let url = l.href;
     if (!auditData.socialLinks.includes(url)) auditData.socialLinks.push(url);
  });

  // D. Rakip Analizi (Benzer Yerler / Diğer Aramalar)
  auditData.competitors = [];
  let possibleCompetitors = [];
  document.querySelectorAll('a[aria-label]').forEach(a => {
     let label = a.getAttribute('aria-label') || "";
     // Yorum ve puan formatı: "Mekanın Adı, 4,5 yıldız"
     if (label.includes('yıldız') && !label.includes(auditData.businessName) && label.length < 100) {
         let match = label.match(/(.*?),\s*([0-9.,]+)\s*yıldız/);
         if (match) {
             possibleCompetitors.push({ name: match[1].trim(), rating: match[2].trim() });
         }
     }
  });
  
  let uniqueComps = {};
  possibleCompetitors.forEach(c => {
     if (!uniqueComps[c.name]) uniqueComps[c.name] = c;
  });
  auditData.competitors = Object.values(uniqueComps).slice(0, 5);

  // Sağlık Skoru Sınırlandırması
  if (healthScore < 0) healthScore = 0;

  // Ekrana her zaman yüzen bir özet kutusu ekle
  let summaryBox = document.querySelector('.gbp-audit-summary-box');
  if (!summaryBox) {
    summaryBox = document.createElement('div');
    summaryBox.className = 'gbp-audit-summary-box';
    document.body.appendChild(summaryBox);
  }
  
  let scoreColor = healthScore >= 80 ? "#2a9d8f" : healthScore >= 50 ? "#f4a261" : "#e63946";
  let scoreText = healthScore >= 80 ? "İyi Durumda" : healthScore >= 50 ? "Geliştirilmeli" : "Kritik Riskli";

  let html = `<div style="display:flex; justify-content:space-between; align-items:center;">
    <h3 style="margin:0; font-size:16px;">💎 Google İşletme Uzman Analizi</h3>
    <button id="gbp-audit-close-btn" style="border:none; background:none; cursor:pointer; font-size:16px;">✖</button>
  </div>
  <hr style="border:0; border-top:1px solid #eee; margin:10px 0;">
  
  <div style="text-align:center; margin-bottom:15px;">
    <div style="font-size:24px; font-weight:bold; color:${scoreColor};">SEO Sağlık Skoru: ${healthScore}/100</div>
    <div style="font-size:12px; color:#555; font-weight:600;">Durum: ${scoreText}</div>
  </div>`;
  
  if (issuesFound.length > 0) {
    html += `<ul style="color:#e63946; padding-left:20px; font-size:13px; margin:0 0 15px 0;">`;
    issuesFound.forEach(issue => {
      html += `<li style="margin-bottom:8px; line-height:1.3;"><strong>!</strong> ${issue}</li>`;
    });
    html += `</ul>`;
  } else {
    html += `<p style="color:#2a9d8f; font-size:14px; font-weight:500; text-align:center;">Mükemmel! Profiliniz profesyonel olarak optimize edilmiş durumda.</p>`;
  }

  const waMessage = encodeURIComponent("Merhaba, Google İşletme Profilimin uzman denetimini yaptım. Profilimin SEO sağlık skoru " + healthScore + "/100 çıktı. Tespit edilen sorunları profesyonel bir şekilde çözmek ve destek almak istiyorum.");
  html += `<a href="https://wa.me/905425450075?text=${waMessage}" target="_blank" class="gbp-audit-action" style="display:flex; justify-content:center; align-items:center; background:#25D366; color:white; padding:10px; border-radius:6px; text-decoration:none; font-weight:bold; margin-bottom:8px; box-shadow:0 2px 4px rgba(37,211,102,0.3); font-size:14px;">
    <svg style="width:18px; height:18px; margin-right:8px;" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
    Uzman Desteği Al
  </a>`;
  summaryBox.innerHTML = html;

  // Çarpı butonuna event listener ekle
  const closeBtn = document.getElementById('gbp-audit-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (summaryBox) {
        summaryBox.remove();
      }
    });
  }

  // PDF için audit verisini popup'a dön
  return { data: auditData };
}

// Eklentiden gelen "Denetle" mesajını dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "runAuditV2") {
    try {
      const result = runAudit();
      sendResponse(result);
    } catch (e) {
      sendResponse({ data: { businessName: "Hata Oluştu", issues: ["Eklenti çalışırken bir hata oluştu: " + e.message], successes: [] }});
    }
  }
});
