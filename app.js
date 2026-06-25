// Nothing Phone (4a) Scroll Animation Logic

const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');
const specsSection = document.getElementById('specs');
const loaderScreen = document.getElementById('loader-screen');
const loadPercentage = document.getElementById('load-percentage');
const loaderBarInner = document.getElementById('loader-bar-inner');

const totalFrames = 180;
const preloadedImages = [];
let loadedCount = 0;

// Variables for smooth scroll interpolation (momentum damping)
let currentFrame = 0;
let targetFrame = 0;

// Section animations mapping
// We define start, peak, and end percentages of the page scroll range
const sections = [
  { id: 'hero', start: 0.0, peak: 0.0, end: 0.20 },
  { id: 'glyph', start: 0.12, peak: 0.28, end: 0.44 },
  { id: 'design', start: 0.40, peak: 0.56, end: 0.72 },
  { id: 'os', start: 0.68, peak: 0.84, end: 0.98 }
];

// Cache DOM elements of sections for fast styling updates
const sectionElements = {};
sections.forEach(sec => {
  sectionElements[sec.id] = document.getElementById(sec.id);
});

// Setup paths and preload images
function initPreload() {
  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    const frameNum = String(i).padStart(3, '0');
    img.src = `./ezgif-60241a79ce3c692a-jpg/ezgif-frame-${frameNum}.jpg`;
    
    img.onload = () => {
      handleImageLoad();
    };
    
    img.onerror = () => {
      console.error(`Failed to load frame ${frameNum}`);
      handleImageLoad(); // Count even if it fails to avoid getting stuck
    };
    
    preloadedImages.push(img);
  }
}

function handleImageLoad() {
  loadedCount++;
  const percentage = Math.round((loadedCount / totalFrames) * 100);
  
  // Format percentage as "00%"
  const formattedPercentage = String(percentage).padStart(2, '0') + '%';
  loadPercentage.textContent = formattedPercentage;
  loaderBarInner.style.width = percentage + '%';
  
  if (loadedCount === totalFrames) {
    setTimeout(startWebsite, 400); // Small visual buffer for loading bar completion
  }
}

// Resizing logic for crisp Canvas presentation
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  // Force redraw on resize
  drawCurrentFrame();
}

function drawImageScaled(img) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imgWidth = img.width;
  const imgHeight = img.height;
  
  // Contain the image inside the canvas viewport
  const ratio = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
  
  // Apply a subtle scale-down so the phone has a nice margin
  const marginScale = 0.85;
  const finalRatio = ratio * marginScale;
  
  const newWidth = imgWidth * finalRatio;
  const newHeight = imgHeight * finalRatio;
  
  const x = (canvasWidth - newWidth) / 2;
  const y = (canvasHeight - newHeight) / 2;
  
  ctx.drawImage(img, x, y, newWidth, newHeight);
}

function drawCurrentFrame() {
  const frameToRender = Math.max(0, Math.min(totalFrames - 1, Math.round(currentFrame)));
  const img = preloadedImages[frameToRender];
  if (img && img.complete) {
    drawImageScaled(img);
  }
}

// Calculate target frame index based on window scroll progress
function handleScroll() {
  const scrollTop = window.scrollY;
  // The scrollable range for the canvas animation ends when the specs section meets the bottom of the viewport
  const scrollRange = specsSection.offsetTop - window.innerHeight;
  
  if (scrollRange <= 0) return;
  
  const scrollFraction = Math.max(0, Math.min(1, scrollTop / scrollRange));
  targetFrame = scrollFraction * (totalFrames - 1);
}

// Dynamic opacity and transformation logic for floating text cards
function updateTextOverlays(scrollFraction) {
  sections.forEach(item => {
    const el = sectionElements[item.id];
    if (!el) return;
    
    let opacity = 0;
    let translateY = 30; // pixels to shift upward
    
    if (scrollFraction >= item.start && scrollFraction <= item.end) {
      el.classList.add('active-visible');
      
      if (scrollFraction < item.peak) {
        // Fading in
        const range = item.peak - item.start;
        const progress = (scrollFraction - item.start) / range;
        opacity = progress;
        translateY = 30 * (1 - progress);
      } else {
        // Fading out
        const range = item.end - item.peak;
        const progress = (scrollFraction - item.peak) / range;
        opacity = 1 - progress;
        translateY = -30 * progress;
      }
    } else {
      el.classList.remove('active-visible');
    }
    
    // Apply styling directly to the wrapper element inside the section
    const content = el.querySelector('.content-wrapper');
    if (content) {
      content.style.opacity = opacity;
      content.style.transform = `translateY(${translateY}px)`;
      // Disable interaction when faded out
      content.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
    }
  });
}

// Animation loop implementing momentum damping (LERP)
function tick() {
  // LERP target frame with current frame (0.07 damping coefficient)
  const diff = targetFrame - currentFrame;
  currentFrame += diff * 0.07;
  
  // Draw frame on canvas
  drawCurrentFrame();
  
  // Calculate exact scroll fraction of target frame to match text card fades
  const scrollFraction = currentFrame / (totalFrames - 1);
  updateTextOverlays(scrollFraction);
  
  requestAnimationFrame(tick);
}

function startWebsite() {
  // Hide preloader screen
  loaderScreen.style.opacity = '0';
  setTimeout(() => {
    loaderScreen.style.visibility = 'hidden';
  }, 800);
  
  // Listeners
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', handleScroll);
  
  // Initial triggering
  resizeCanvas();
  handleScroll();
  
  // Start animation loop
  requestAnimationFrame(tick);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  initPreload();
});
