document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('report-date').innerText = new Date().toLocaleDateString('tr-TR');
  
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.innerText = new Date().getFullYear();

  const printBtn = document.getElementById('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  chrome.storage.local.get(['latestAuditData'], (result) => {
    if (result.latestAuditData) {
      const data = result.latestAuditData;
      
      document.getElementById('b-name').innerText = data.businessName || "Bilinmiyor";
      document.getElementById('b-rating').innerText = data.rating || "Bilinmiyor";
      document.getElementById('b-reviews').innerText = data.reviewCount || "Bilinmiyor";
      document.getElementById('b-phone').innerText = data.phone || "Bulunamadı";
      document.getElementById('b-address').innerText = data.address || "Bulunamadı";
      document.getElementById('b-website').innerText = data.website || "Bulunamadı / Eklenmemiş";

      const issues = data.issues || [];
      const successes = data.successes || [];

      // Skor Hesaplama (Basit bir algoritma: Başarılar / Toplam Kriter)
      const totalChecks = issues.length + successes.length;
      let score = 0;
      if (totalChecks > 0) {
        score = Math.round((successes.length / totalChecks) * 100);
      }
      
      const scoreEl = document.getElementById('opt-score');
      scoreEl.innerText = `%${score}`;
      if (score >= 80) scoreEl.className = 'score-value green';
      else if (score >= 50) scoreEl.className = 'score-value orange';
      else scoreEl.className = 'score-value red';

      const issueList = document.getElementById('issue-list');
      if (issues.length > 0) {
        issueList.innerHTML = '';
        issues.forEach(issue => {
          const li = document.createElement('li');
          li.innerText = issue;
          issueList.appendChild(li);
        });
      } else {
        issueList.innerHTML = '<li>Harika! Tespit edilen kritik bir hata bulunamadı.</li>';
      }

      const successList = document.getElementById('success-list');
      if (successes.length > 0) {
        successList.innerHTML = '';
        successes.forEach(success => {
          const li = document.createElement('li');
          li.innerText = success;
          successList.appendChild(li);
        });
      } else {
        successList.innerHTML = '<li>Başarılı kriter bulunamadı.</li>';
      }

      // A. Unclaimed Business Banner
      if (data.isUnclaimed) {
         document.getElementById('unclaimed-banner').style.display = 'block';
      }

      // B. Advanced SEO Section
      const advSeoList = document.getElementById('adv-seo-list');
      const advSeoSection = document.getElementById('adv-seo-section');
      let advSeoItems = [];
      
      if (data.appointmentLink) {
         advSeoItems.push("✅ Online Randevu / Sipariş bağlantısı aktif.");
      } else {
         advSeoItems.push("❌ Randevu/Sipariş bağlantısı eksik. (Dönüşüm kaybı)");
      }

      if (data.socialLinks && data.socialLinks.length > 0) {
         advSeoItems.push(`✅ ${data.socialLinks.length} adet Sosyal Medya profili algılandı.`);
      } else {
         advSeoItems.push("❌ Sosyal Medya profilleri Google'a bağlanmamış. (Marka otoritesi zayıf)");
      }

      if (advSeoItems.length > 0) {
         advSeoSection.style.display = 'block';
         advSeoItems.forEach(item => {
            const li = document.createElement('li');
            li.innerText = item;
            if (item.startsWith('❌')) {
               li.style.background = '#fef2f2';
               li.style.borderLeft = '4px solid #ef4444';
               li.style.color = '#991b1b';
            }
            advSeoList.appendChild(li);
         });
      }

      // C. Competitor Section
      const compList = document.getElementById('comp-list');
      const compSection = document.getElementById('competitor-section');
      if (data.competitors && data.competitors.length > 0) {
         compSection.style.display = 'block';
         data.competitors.forEach(c => {
            const div = document.createElement('div');
            div.className = 'comp-item';
            div.innerHTML = `<span>${c.name}</span> <span class="rating">⭐ ${c.rating}</span>`;
            compList.appendChild(div);
         });
      }

      // D. Share Buttons Setup
      const waBtn = document.getElementById('wa-btn');
      if (waBtn) {
         waBtn.addEventListener('click', () => {
             const waMessage = `Merhaba, ${data.businessName || "işletmeniz"} için detaylı Google SEO Analizi gerçekleştirdik.\n\nOptimizasyon skoru: %${score}\n\nEksikleri gidermek ve profesyonel destek almak için bu numaradan bize dönüş yapabilirsiniz.`;
             window.open(`https://wa.me/?text=${encodeURIComponent(waMessage)}`, '_blank');
         });
      }

      const emailBtn = document.getElementById('email-btn');
      if (emailBtn) {
         emailBtn.addEventListener('click', () => {
             const subject = `${data.businessName || "İşletme"} SEO Denetim Raporu`;
             const body = `Merhaba,\n\n${data.businessName || "İşletmeniz"} için Google Profil analizi gerçekleştirdik.\n\nOptimizasyon Skoru: %${score}\n\nDetaylı bilgi ve danışmanlık için bize dönüş yapabilirsiniz.`;
             window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
         });
      }
    }
  });
});
