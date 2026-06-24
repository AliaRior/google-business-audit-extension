document.addEventListener('DOMContentLoaded', () => {
  const mainView = document.getElementById('main-view');
  const paymentView = document.getElementById('payment-view');
  const limitCountEl = document.getElementById('limit-count');
  const btnAudit = document.getElementById('btn-audit');
  const btnPdfReport = document.getElementById('btn-pdf-report');
  const btnBack = document.getElementById('btn-back');
  const btnVerifyLicense = document.getElementById('btn-verify-license');
  const licenseInput = document.getElementById('license-input');
  const licenseStatus = document.getElementById('license-status');
  const statusMessage = document.getElementById('status-message');

  // Limit kontrolü yap
  function checkLimit() {
    chrome.runtime.sendMessage({ action: "checkLimit" }, (response) => {
      if (response && response.canAudit) {
        limitCountEl.innerText = response.remaining;
        mainView.classList.add('active');
        paymentView.classList.remove('active');
      } else {
        limitCountEl.innerText = "0";
        mainView.classList.remove('active');
        paymentView.classList.add('active');
      }
    });
  }

  // Denetim butonuna tıklandığında
  btnAudit.addEventListener('click', () => {
    // Önce limiti artır
    chrome.runtime.sendMessage({ action: "incrementAudit" }, (response) => {
      if (response && response.success) {
        limitCountEl.innerText = response.remaining;
        
        // İçerik scriptini tetikle
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs.length === 0) return;
          
          const tabId = tabs[0].id;

          function handleResponse(contentResponse) {
            statusMessage.innerText = "Denetim tamamlandı!";
            statusMessage.style.color = "#10b981";
            statusMessage.classList.remove('hidden');
            
            if (contentResponse && contentResponse.data) {
              chrome.storage.local.set({ latestAuditData: contentResponse.data }, () => {
                btnPdfReport.classList.remove('hidden');
              });
            }

            setTimeout(() => {
              statusMessage.classList.add('hidden');
            }, 3000);
          }

          chrome.tabs.sendMessage(tabId, {action: "runAuditV2"}, {frameId: 0}, function(contentResponse) {
            if (chrome.runtime.lastError) {
              // İçerik scripti yüklenmemiş olabilir, inject edelim
              chrome.scripting.executeScript({
                target: { tabId: tabId, allFrames: false },
                files: ["content.js"]
              }, () => {
                if (chrome.runtime.lastError) {
                  statusMessage.innerText = "Bu sayfada denetim yapılamıyor.";
                  statusMessage.style.color = "#ef4444";
                  statusMessage.classList.remove('hidden');
                } else {
                  // Tekrar gönderelim
                  chrome.tabs.sendMessage(tabId, {action: "runAuditV2"}, {frameId: 0}, function(retryResponse) {
                    if (chrome.runtime.lastError) {
                      statusMessage.innerText = "Bu sayfada denetim yapılamıyor.";
                      statusMessage.style.color = "#ef4444";
                      statusMessage.classList.remove('hidden');
                    } else {
                      handleResponse(retryResponse);
                    }
                  });
                }
              });
            } else {
              handleResponse(contentResponse);
            }
          });
        });
      } else {
        statusMessage.innerText = "Günlük denetim limitiniz dolmuştur!";
        statusMessage.style.color = "#ef4444";
        statusMessage.classList.remove('hidden');
        setTimeout(() => {
          mainView.classList.remove('active');
          paymentView.classList.add('active');
        }, 1500);
      }
    });
  });

  // PDF Raporu butonu
  if (btnPdfReport) {
    btnPdfReport.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL("report.html") });
    });
  }

  // Geri dön butonu
  btnBack.addEventListener('click', () => {
    window.close();
  });

  // Lisans Doğrulama
  if (btnVerifyLicense && licenseInput) {
    btnVerifyLicense.addEventListener('click', () => {
      const code = licenseInput.value.trim().toUpperCase();
      if (!code) {
        licenseStatus.innerText = "Lütfen bir lisans kodu girin.";
        licenseStatus.style.color = "#ef4444";
        return;
      }

      licenseStatus.innerText = "Doğrulanıyor...";
      licenseStatus.style.color = "#f59e0b";
      btnVerifyLicense.disabled = true;

      chrome.runtime.sendMessage({ action: "verifyLicense", code: code }, (response) => {
        btnVerifyLicense.disabled = false;
        if (response && response.success) {
          let msg = "✅ Lisans doğrulandı! Premium özellikler açıldı.";
          if (response.expiry) {
            const expiryDate = new Date(response.expiry).toLocaleDateString('tr-TR');
            msg = `✅ Lisans doğrulandı! Premium özellikler ${expiryDate} tarihine kadar açıldı.`;
          }
          licenseStatus.innerText = msg;
          licenseStatus.style.color = "#10b981";
          setTimeout(() => {
            paymentView.classList.remove('active');
            checkLimit();
          }, 2000);
        } else {
          licenseStatus.innerText = "❌ Geçersiz veya süresi dolmuş lisans kodu.";
          licenseStatus.style.color = "#ef4444";
        }
      });
    });
  }

  // Başlangıçta limiti kontrol et
  checkLimit();
});
