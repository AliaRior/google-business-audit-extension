const DAILY_LIMIT = 2;
// Google Apps Script Web App URL'sini buraya yapıştıracaksınız:
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzqMJYSV0E8iri012VZiJiug0P_yDXa6M_pXXrRmEo8XXImGxTL5tHoR_13GwVCSrQu/exec";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ auditCount: 0, lastAuditDate: new Date().toDateString(), bonusLimits: 0, isPremium: false });
});

// Dinamik olarak limit kontrolü
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkLimit") {
    chrome.storage.local.get(['auditCount', 'lastAuditDate', 'bonusLimits', 'isPremium', 'premiumExpiry'], (data) => {
      // Premium kontrolü ve Süre dolumu
      if (data.isPremium) {
        if (!data.premiumExpiry || new Date() < new Date(data.premiumExpiry)) {
          sendResponse({ canAudit: true, remaining: "Sınırsız (Premium)" });
          return;
        } else {
          // Süre dolmuşsa premiumu iptal et
          chrome.storage.local.set({ isPremium: false, premiumExpiry: null });
        }
      }
      
      const today = new Date().toDateString();
      let newCount = data.auditCount || 0;
      let lastDate = data.lastAuditDate;
      let bonusLimits = data.bonusLimits || 0;

      // Gün değiştiyse limiti sıfırla
      if (lastDate !== today) {
        newCount = 0;
        lastDate = today;
      }

      const totalAllowed = DAILY_LIMIT + bonusLimits;
      if (newCount < totalAllowed) {
        sendResponse({ canAudit: true, remaining: totalAllowed - newCount });
      } else {
        sendResponse({ canAudit: false, remaining: 0 });
      }
    });
    return true; // Asynchronous response için
  }

  if (request.action === "incrementAudit") {
    chrome.storage.local.get(['auditCount', 'lastAuditDate', 'bonusLimits', 'isPremium', 'premiumExpiry'], (data) => {
      // Premium kontrolü ve Süre dolumu
      if (data.isPremium) {
        if (!data.premiumExpiry || new Date() < new Date(data.premiumExpiry)) {
          sendResponse({ success: true, remaining: "Sınırsız (Premium)" });
          return;
        }
      }

      const today = new Date().toDateString();
      let newCount = data.auditCount || 0;
      let lastDate = data.lastAuditDate;
      let bonusLimits = data.bonusLimits || 0;

      if (lastDate !== today) {
        newCount = 0;
      }

      const totalAllowed = DAILY_LIMIT + bonusLimits;
      
      if (newCount >= totalAllowed) {
        sendResponse({ success: false, remaining: 0 });
        return;
      }

      newCount++;
      chrome.storage.local.set({ auditCount: newCount, lastAuditDate: today }, () => {
        sendResponse({ success: true, remaining: totalAllowed - newCount });
      });
    });
    return true;
  }

  if (request.action === "addBonus") {
    chrome.storage.local.get(['bonusLimits'], (data) => {
      let currentBonus = data.bonusLimits || 0;
      chrome.storage.local.set({ bonusLimits: currentBonus + request.amount }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (request.action === "verifyLicense") {
    const code = request.code;
    
    // Geçici test kodu:
    if (code === "TESTKODU") {
      chrome.storage.local.set({ isPremium: true }, () => {
        sendResponse({ success: true });
      });
      return true;
    }

    // Eğer script URL ayarlanmamışsa hata dön
    if (SCRIPT_URL === "BURAYA_GOOGLE_SCRIPT_LINKI_GELECEK") {
      sendResponse({ success: false, message: "Sistem henüz kurulmadı." });
      return true;
    }

    // Google Script'e sor
    fetch(`${SCRIPT_URL}?action=verify&code=${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          chrome.storage.local.set({ isPremium: true, premiumExpiry: data.expiryDate }, () => {
            sendResponse({ success: true, expiry: data.expiryDate });
          });
        } else {
          sendResponse({ success: false });
        }
      })
      .catch(err => {
        console.error("Lisans doğrulama hatası:", err);
        sendResponse({ success: false });
      });

    return true; // Asenkron yanıt için
  }
});
