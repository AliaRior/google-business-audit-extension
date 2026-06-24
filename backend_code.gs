// ==========================================
// FİDAN DANIŞMANLIK - LİSANS SİSTEMİ
// Google E-Tablolar (Apps Script) Kodu
// ==========================================

// TABLO YAPISI:
// A Sütunu: Tarih
// B Sütunu: Sipariş No (Shopier'den gelir)
// C Sütunu: E-Posta
// D Sütunu: Lisans Kodu
// E Sütunu: Durum (Aktif / Kullanıldı)

// 1. Eklentiden gelen Doğrulama (GET) istekleri
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  var action = e.parameter.action;
  var code = e.parameter.code;
  
  if (action === 'verify' && code) {
    for (var i = 1; i < data.length; i++) { // 1. satır başlıklar olduğu için i=1'den başlar
      var rowCode = data[i][3]; // D sütunu (0=A, 1=B, 2=C, 3=D)
      var rowStatus = data[i][4]; // E sütunu
      
      if (rowCode === code && rowStatus === 'Aktif') {
        // İsterseniz doğrulandıktan sonra durumu 'Kullanıldı' yapabilirsiniz:
        // sheet.getRange(i + 1, 5).setValue('Kullanıldı'); 
        
        return ContentService.createTextOutput(JSON.stringify({ valid: true }))
                             .setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ valid: false }))
                       .setMimeType(ContentService.MimeType.JSON);
}

// 2. Shopier'den gelen Satın Alma (POST - Webhook) istekleri
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    // Shopier post datalarını yakala (Bu alan Shopier ayarlarınıza göre değişir)
    // Örnek basit yakalama:
    var orderNo = e.parameter.order_no || 'Bilinmiyor';
    var email = e.parameter.email || 'Bilinmiyor';
    
    // Yeni Rastgele Lisans Kodu Üret (Örn: FDN-A8B2C)
    var randomCode = 'FDN-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    
    // Tabloya yeni satır ekle
    sheet.appendRow([new Date(), orderNo, email, randomCode, 'Aktif']);
    
    // Müşteriye otomatik E-Posta gönder
    if (email !== 'Bilinmiyor') {
      var subject = "Fidan Danışmanlık - Premium SEO Denetim Lisans Kodunuz";
      var message = "Merhaba,\n\nSatın alımınız için teşekkürler!\nGoogle İşletme Profili Denetim eklentisi için lisans kodunuz:\n\n" + randomCode + "\n\nEklentiyi açıp bu kodu girdiğinizde sınırsız kullanımınız aktifleşecektir.\nİyi çalışmalar!";
      
      MailApp.sendEmail(email, subject, message);
    }
    
    return ContentService.createTextOutput("Başarılı");
  } catch (error) {
    return ContentService.createTextOutput("Hata: " + error.toString());
  }
}
