/**
 * VoltEko OZE - Interactive Landing Page Logic
 * Handles calculator, mobile menu, FAQ accordion, form submission, and animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCalculator();
  initFaqAccordion();
  initForms();
  initStatsCounter();
  initSmoothScroll();
});

/* --------------------------------------------------
   1. Mobile Menu Toggle
   -------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const isExpanded = navMenu.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', isExpanded);
  });

  // Close menu when clicking outside or clicking any nav link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!toggleBtn.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('open');
    }
  });
}

/* --------------------------------------------------
   2. Solar Savings Calculator
   -------------------------------------------------- */
function initCalculator() {
  const billSlider = document.getElementById('calcBill');
  const billDisplay = document.getElementById('calcBillDisplay');
  const segmentBtns = document.querySelectorAll('.segment-btn');
  const storageCheckbox = document.getElementById('calcStorage');

  // Result display elements
  const resPower = document.getElementById('resPower');
  const resSavings = document.getElementById('resSavings');
  const resGrant = document.getElementById('resGrant');
  const resPayback = document.getElementById('resPayback');

  if (!billSlider) return;

  let clientType = 'home'; // 'home' | 'biz'

  // Switch between Home and Business
  segmentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      segmentBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      clientType = btn.dataset.type;
      recalculate();
    });
  });

  // Slider change
  billSlider.addEventListener('input', () => {
    updateSliderBackground(billSlider);
    recalculate();
  });

  // Checkbox change
  if (storageCheckbox) {
    storageCheckbox.addEventListener('change', recalculate);
  }

  function updateSliderBackground(slider) {
    const min = parseFloat(slider.min) || 150;
    const max = parseFloat(slider.max) || 1500;
    const val = parseFloat(slider.value);
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #16a34a 0%, #16a34a ${percent}%, #e2e8f0 ${percent}%, #e2e8f0 100%)`;
  }

  function recalculate() {
    const monthlyBill = parseFloat(billSlider.value);
    billDisplay.textContent = `${monthlyBill} zł / mies.`;

    const hasStorage = storageCheckbox ? storageCheckbox.checked : false;
    const annualBill = monthlyBill * 12;

    // Calculation model:
    // Average price per kWh ~ 1.05 PLN
    // Annual consumption ~ annualBill / 1.05
    // 1 kWp produces ~ 1000 kWh per year in Poland
    // Dom vs Biz modifier:
    const typeFactor = clientType === 'home' ? 1.0 : 1.35;
    
    // Suggested Power (kWp)
    let powerKWp = (annualBill / 1.05 / 1000) * typeFactor;
    // Bound power reasonably between 3.0 and 50 kWp
    powerKWp = Math.max(3.2, Math.round(powerKWp * 10) / 10);

    // Annual savings in PLN
    // With storage self-consumption is ~75-80%, without ~40-60% (net-billing)
    const savingsRatio = hasStorage ? 0.78 : 0.65;
    let annualSavings = Math.round(annualBill * savingsRatio);

    // Subsidies (Mój Prąd 6.0 guidelines):
    // PV only ~ 6,000 PLN (for <= 10 kWp)
    // PV + Storage (Magazyn energii) ~ up to 23,000 PLN (7 000 zł PV + 16 000 zł magazyn energii)
    let grantAmount = 6000;
    if (hasStorage) {
      grantAmount = 23000;
    }
    if (clientType === 'biz') {
      grantAmount = Math.round(powerKWp * 900); // Biznesowe / ulgi
    }

    // Estimated Payback Time in years:
    // Estimated install cost: ~4,200 PLN per kWp + optional 15,000 for storage
    const installCost = (powerKWp * 4100) + (hasStorage ? 16500 : 0);
    const netCost = Math.max(5000, installCost - grantAmount);
    let paybackYears = (netCost / annualSavings);
    paybackYears = Math.min(8.5, Math.max(2.8, Math.round(paybackYears * 10) / 10));

    // Update UI
    if (resPower) resPower.textContent = `ok. ${powerKWp.toFixed(1)} kWp`;
    if (resSavings) resSavings.textContent = `${annualSavings.toLocaleString('pl-PL')} zł`;
    if (resGrant) resGrant.textContent = `do ${grantAmount.toLocaleString('pl-PL')} zł`;
    if (resPayback) resPayback.textContent = `ok. ${paybackYears.toFixed(1)} lat`;
  }

  // Initial calculation & slider track styling
  updateSliderBackground(billSlider);
  recalculate();
}

/* --------------------------------------------------
   3. FAQ Accordion
   -------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!questionBtn || !answer) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items for a clean accordion effect
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* --------------------------------------------------
   4. Form Submissions & Feedback Modal
   -------------------------------------------------- */
function initForms() {
  const heroForm = document.getElementById('heroQuoteForm');
  const mainContactForm = document.getElementById('mainContactForm');
  const modal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalLeadName = document.getElementById('modalLeadName');

  function handleFormSubmit(e, form) {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Visual loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      Przesyłanie...
    `;

    // Extract lead name if present
    const nameInput = form.querySelector('input[name="name"]') || form.querySelector('input[type="text"]');
    const leadName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Kliencie';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.reset();

      // Show confirmation modal
      if (modalLeadName) {
        modalLeadName.textContent = leadName;
      }
      if (modal) {
        modal.classList.add('active');
      }
    }, 900);
  }

  if (heroForm) {
    heroForm.addEventListener('submit', (e) => handleFormSubmit(e, heroForm));
  }

  if (mainContactForm) {
    mainContactForm.addEventListener('submit', (e) => handleFormSubmit(e, mainContactForm));
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}

/* --------------------------------------------------
   5. Animated Stats Counter (Scroll Trigger)
   -------------------------------------------------- */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        animateCounters();
      }
    });
  }, { threshold: 0.4 });

  const statsStrip = document.querySelector('.stats-strip');
  if (statsStrip) {
    observer.observe(statsStrip);
  }

  function animateCounters() {
    statNumbers.forEach(el => {
      const target = parseFloat(el.getAttribute('data-target'));
      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.getAttribute('data-prefix') || '';
      const isDecimal = target % 1 !== 0;
      const duration = 1600;
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quadratic
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = target * ease;

        if (isDecimal) {
          el.textContent = `${prefix}${currentVal.toFixed(1)}${suffix}`;
        } else {
          el.textContent = `${prefix}${Math.floor(currentVal).toLocaleString('pl-PL')}${suffix}`;
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = `${prefix}${isDecimal ? target.toFixed(1) : target.toLocaleString('pl-PL')}${suffix}`;
        }
      }

      requestAnimationFrame(update);
    });
  }
}

/* --------------------------------------------------
   6. Smooth Anchor Scrolling with Header Offset
   -------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
