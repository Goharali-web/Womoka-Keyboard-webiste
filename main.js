// Configuration
const frameCount = 240;
const images = [];
const sequence = {
  frame: 1,
  targetFrame: 1
};

// Order configuration state tracking
const orderState = {
  glow: 'orange',
  switch: 'linear'
};

// UI Elements
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderText = document.getElementById("loader-text");
const canvas = document.getElementById("animation-canvas");
const context = canvas.getContext("2d");
const scrollSection = document.getElementById("experience");

// Colors mapping for interactive customizer
const colorProfiles = {
  orange: {
    name: "Amber Flare",
    accent: "#e06a3b",
    glow: "rgba(224, 106, 59, 0.2)",
    gradient: "linear-gradient(135deg, #e06a3b, #f48c5b)",
    imgSrc: "./frames/ezgif-frame-001.jpg"   // Amber Flare stays as-is (animation frame)
  },
  cyan: {
    name: "Cyan Aura",
    accent: "#0082c4",
    glow: "rgba(0, 130, 196, 0.15)",
    gradient: "linear-gradient(135deg, #0082c4, #00b4d8)",
    imgSrc: "./keyboard-cyan-aura.jpeg"       // Real cyan keyboard photo
  },
  purple: {
    name: "Hyper Violet",
    accent: "#7b2cbf",
    glow: "rgba(123, 44, 191, 0.15)",
    gradient: "linear-gradient(135deg, #7b2cbf, #9d4edd)",
    imgSrc: "./keyboard-hyper-violet.jpeg"    // Real violet keyboard photo
  },
  green: {
    name: "Acid Lime",
    accent: "#00aa5b",
    glow: "rgba(0, 170, 91, 0.15)",
    gradient: "linear-gradient(135deg, #00aa5b, #00cc66)",
    imgSrc: "./keyboard-acid-lime.jpeg"       // Real lime keyboard photo
  }
};


// Switch sounds mapping
const soundProfiles = {
  linear: "https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav",
  tactile: "https://assets.mixkit.co/active_storage/sfx/1381/1381-84.wav",
  silent: "https://assets.mixkit.co/active_storage/sfx/2566/2566-84.wav"
};

// Start preloading frames
function preloadImages() {
  let loadedCount = 0;
  const getFrameUrl = (index) => `./frames/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);
    img.onload = () => {
      loadedCount++;
      const percent = Math.round((loadedCount / frameCount) * 100);
      loaderBar.style.width = `${percent}%`;
      loaderText.textContent = `PREPARING INTERACTIVE EXPERIENCE... ${percent}%`;

      if (loadedCount === frameCount) {
        setTimeout(initExperience, 500); // Small buffer for visual transition
      }
    };
    img.onerror = () => {
      console.error(`Failed to load image frame at: ${img.src}`);
      loadedCount++; // Avoid blocking the experience load
    };
    images.push(img);
  }
}

// Initialise application
function initExperience() {
  // Fade out loader
  loader.classList.add("fade-out");
  
  // Set canvas initial dimensions
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  
  // Initial draw
  drawFrame(1);
  
  // Start animation render loop
  updateAnimation();
  
  // Wire up customizer controls
  initCustomizer();
  
  // Wire up checkout modal and success messages
  initOrderSystem();
}

// Draw specific frame index to canvas — COVER mode: fills full viewport
function drawFrame(index) {
  const img = images[index - 1];
  if (!img) return;

  context.clearRect(0, 0, canvas.width, canvas.height);

  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  if (!imgWidth || !imgHeight) return;

  const canvasRatio = canvas.width / canvas.height;
  const imgRatio = imgWidth / imgHeight;

  let drawWidth, drawHeight, sx, sy, sWidth, sHeight;

  // Cover: scale to fill the canvas, crop excess
  if (canvasRatio > imgRatio) {
    // Canvas is wider — match width, crop top/bottom
    drawWidth  = canvas.width;
    drawHeight = canvas.width / imgRatio;
  } else {
    // Canvas is taller — match height, crop left/right
    drawHeight = canvas.height;
    drawWidth  = canvas.height * imgRatio;
  }

  const x = (canvas.width  - drawWidth)  / 2;
  const y = (canvas.height - drawHeight) / 2;

  context.drawImage(img, x, y, drawWidth, drawHeight);
}

// Main update rendering loop
function updateAnimation() {
  const ease = 0.1; // Smooth lerping factor
  const diff = sequence.targetFrame - sequence.frame;

  if (Math.abs(diff) > 0.01) {
    sequence.frame += diff * ease;
    drawFrame(Math.round(sequence.frame));
  }

  requestAnimationFrame(updateAnimation);
}

// Resize canvas listener
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawFrame(Math.round(sequence.frame));
}

// Handle scroll percentage and trigger narrative animations
window.addEventListener("scroll", () => {
  const rect = scrollSection.getBoundingClientRect();
  const scrollHeight = rect.height - window.innerHeight;
  const scrolled = -rect.top;
  
  let scrollPercent = scrolled / scrollHeight;
  scrollPercent = Math.max(0, Math.min(1, scrollPercent)); // Clamp 0 to 1

  // Target frame calculation
  sequence.targetFrame = 1 + scrollPercent * (frameCount - 1);

  // Fade out hero overlay as soon as user scrolls
  const heroOverlay = document.getElementById("hero-overlay");
  if (heroOverlay) {
    if (scrollPercent > 0.02) {
      heroOverlay.classList.add("hidden");
    } else {
      heroOverlay.classList.remove("hidden");
    }
  }

  // Update floating text overlay elements
});


// Interactive Customizer settings handler
function initCustomizer() {
  // Color buttons
  const colorBtns = document.querySelectorAll(".color-btn");
  const glowElement = document.getElementById("keyboard-glow");
  const glowProfileText = document.getElementById("glow-profile-name");
  const customizerImg = document.getElementById("customizer-img");

  colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Toggle active states
      colorBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Extract config
      const themeName = btn.getAttribute("data-color");
      orderState.glow = themeName;
      const profile = colorProfiles[themeName];

      if (profile) {
        // Change visual text label
        glowProfileText.textContent = profile.name;
        
        // Update glow overlay class
        glowElement.className = `keyboard-neon-glow ${themeName}-glow`;

        // Update CSS Variables on root to colorize buttons/highlights dynamically
        document.documentElement.style.setProperty("--accent-color", profile.accent);
        document.documentElement.style.setProperty("--accent-glow", profile.glow);
        document.documentElement.style.setProperty("--accent-gradient", profile.gradient);

        // Crossfade the preview image
        customizerImg.style.opacity = "0";
        setTimeout(() => {
          customizerImg.src = profile.imgSrc;
          customizerImg.onload = () => { customizerImg.style.opacity = "1"; };
          // Fallback in case image is already cached
          if (customizerImg.complete) customizerImg.style.opacity = "1";
        }, 180);
      }
    });
  });

  // Sound Buttons
  const switchBtns = document.querySelectorAll(".switch-btn");
  const typingAudio = document.getElementById("typing-audio");
  const playSoundBtn = document.getElementById("play-sound-btn");

  switchBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Toggle active switch classes
      switchBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Extract switch type and map sound source
      const switchType = btn.getAttribute("data-switch");
      orderState.switch = switchType;
      const audioUrl = soundProfiles[switchType];
      
      if (audioUrl) {
        typingAudio.src = audioUrl;
        typingAudio.load();
        
        // Auto play on select to show immediate feedback
        playTypingSound();
      }
    });
  });

  // Play Sound trigger
  playSoundBtn.addEventListener("click", () => {
    playTypingSound();
  });

  function playTypingSound() {
    typingAudio.currentTime = 0;
    typingAudio.play().catch(err => {
      console.log("Audio play deferred until user interaction is registered.", err);
    });
  }
}

// Initialize checkout modal and mock orders
function initOrderSystem() {
  const orderModal = document.getElementById("order-modal");
  const successOverlay = document.getElementById("success-overlay");
  
  const navOrderBtn = document.getElementById("nav-order-btn");
  const customizerOrderBtn = document.getElementById("customizer-order-btn");
  const bannerOrderBtn = document.getElementById("banner-order-btn");
  
  const closeBtn = document.getElementById("modal-close-btn");
  const cancelBtn = document.getElementById("modal-cancel-btn");
  const successCloseBtn = document.getElementById("success-close-btn");
  
  const orderForm = document.getElementById("order-form");
  
  // Modal Summary Elements
  const summaryGlow = document.getElementById("summary-glow");
  const summarySwitch = document.getElementById("summary-switch");
  
  // Invoice Elements
  const invoiceId = document.getElementById("invoice-id");
  const invoiceItem = document.getElementById("invoice-item");
  const invoiceSwitch = document.getElementById("invoice-switch");
  const invoiceShipping = document.getElementById("invoice-shipping");

  const switchDisplayNames = {
    linear: "Womoka Linears",
    tactile: "Alpine Tactiles",
    silent: "Midnight Silents"
  };

  // Open modal
  const openModal = () => {
    // Populate summaries based on current customized selection state
    const currentGlowName = colorProfiles[orderState.glow].name;
    const currentSwitchName = switchDisplayNames[orderState.switch];
    
    summaryGlow.textContent = currentGlowName;
    summarySwitch.textContent = currentSwitchName;
    
    orderModal.classList.add("active");
  };

  // Close modals
  const closeModal = () => {
    orderModal.classList.remove("active");
  };

  const closeSuccessOverlay = () => {
    successOverlay.classList.remove("active");
  };

  // Bind Openers
  if (navOrderBtn) navOrderBtn.addEventListener("click", openModal);
  if (customizerOrderBtn) customizerOrderBtn.addEventListener("click", openModal);
  if (bannerOrderBtn) bannerOrderBtn.addEventListener("click", openModal);

  // Bind Closers
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (successCloseBtn) successCloseBtn.addEventListener("click", closeSuccessOverlay);

  // Close modal when clicking overlay outer space
  window.addEventListener("click", (e) => {
    if (e.target === orderModal) closeModal();
    if (e.target === successOverlay) closeSuccessOverlay();
  });

  // Handle Form Submission (Mock Local Order Processing)
  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const formData = new FormData(orderForm);
      const name = formData.get("name");
      const email = formData.get("email");
      const phone = formData.get("phone");
      const address = formData.get("address");

      // Generate a mock unique order ID
      const randomIdNum = Math.floor(100000 + Math.random() * 900000);
      const orderId = `#WMK-${randomIdNum}`;

      const glowName = colorProfiles[orderState.glow].name;
      const switchName = switchDisplayNames[orderState.switch];

      // Formulate Order Details
      const newOrder = {
        orderId,
        name,
        email,
        phone,
        address,
        glow: glowName,
        switch: switchName,
        price: "$199.00",
        timestamp: new Date().toISOString()
      };

      // Save order record locally to LocalStorage
      try {
        const storedOrders = JSON.parse(localStorage.getItem("womoka_orders") || "[]");
        storedOrders.push(newOrder);
        localStorage.setItem("womoka_orders", JSON.stringify(storedOrders));
        console.log("Mock Order Saved successfully inside localStorage", newOrder);
      } catch (err) {
        console.error("Failed storing mock order data locally:", err);
      }

      // Populate Success Invoice popup details
      invoiceId.textContent = orderId;
      invoiceItem.textContent = `Womoka One (${glowName})`;
      invoiceSwitch.textContent = switchName;
      invoiceShipping.textContent = address;

      // Swap views
      closeModal();
      successOverlay.classList.add("active");
      
      // Reset order form inputs
      orderForm.reset();
    });
  }
}

// Start loading
window.addEventListener("DOMContentLoaded", () => {
  preloadImages();
});
