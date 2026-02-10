// ===== CONFIGURATION =====
const FIRST_MESSAGE = "แด่การเดินทางที่ไม่มีวันสิ้นสุด....";
const SECOND_MESSAGE = "ความทรงจำของมนุษย์อาจเลือนลางไปตามกาลเวลา";
const THIRD_MESSAGE = "'กาแล็กซี่' นี้จึงถูกสร้างขึ้น เพื่อรักษาทุกช่วงเวลาของเรา";
const FOURTH_MESSAGE = "ให้คงอยู่เป็นนิรันดร์ท่ามกลางหมู่ดาว";

// ===== ELEMENTS =====
const firstMessageEl = document.getElementById('firstMessage');
const secondMessageEl = document.getElementById('secondMessage');
const thirdMessageEl = document.getElementById('thirdMessage');
const fourthMessageEl = document.getElementById('fourthMessage');
const particlesContainer = document.getElementById('particlesContainer');
const bgMusic = document.getElementById('bgMusic');

// ===== FLOATING PARTICLES =====
function createParticles() {
    const particleCount = window.innerWidth > 768 ? 150 : 80; // น้อยลงบน mobile

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random position
        particle.style.left = Math.random() * 100 + '%';

        // Random animation duration (8-15 seconds)
        const duration = 8 + Math.random() * 7;
        particle.style.animationDuration = duration + 's';

        // Random delay
        particle.style.animationDelay = Math.random() * 5 + 's';

        // Random horizontal drift
        const drift = (Math.random() - 0.5) * 100;
        particle.style.setProperty('--float-x', drift + 'px');

        // Random size variation
        const size = 20 + Math.random() * 100;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        particlesContainer.appendChild(particle);
    }
}

// ===== FADE IN EFFECT =====
function fadeInText(text, element, duration = 3000) {
    return new Promise((resolve) => {
        // แสดงข้อความทั้งหมดทันที
        element.textContent = text;
        element.classList.add('active');

        // รอให้ animation เสร็จ
        setTimeout(() => {
            resolve();
        }, duration);
    });
}

// ===== SHOW MESSAGE =====
function showMessage(text, element) {
    return new Promise((resolve) => {
        element.textContent = text;
        element.classList.add('show');

        // Wait for animation to complete
        setTimeout(() => {
            resolve();
        }, 2000); // Animation duration
    });
}

// ===== AUTO TRANSITION =====
function autoTransition() {
    document.body.classList.add('fade-out');

    setTimeout(() => {
        // ไปหน้า Galaxy
        window.location.href = "../GalaxyPage/galaxy.html";
    }, 2000);
}

// ===== MAIN TIMELINE =====
async function startSequence() {
    // เล่นเพลงพื้นหลัง
    bgMusic.play().catch(e => {
        console.log("Audio autoplay blocked by browser:", e);
        // ถ้า browser block autoplay ให้รอ user interaction
        document.body.addEventListener('click', () => {
            bgMusic.play().catch(err => console.log("Music play failed:", err));
        }, { once: true });
    });

    // Phase 1: Black screen for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Phase 2: Fade in first message
    await fadeInText(FIRST_MESSAGE, firstMessageEl, 3000);

    // Phase 3: Wait 2.5 seconds, then show second message
    await new Promise(resolve => setTimeout(resolve, 2500));
    await showMessage(SECOND_MESSAGE, secondMessageEl);

    // Phase 4: Wait 2.5 seconds, then show third message
    await new Promise(resolve => setTimeout(resolve, 2500));
    await showMessage(THIRD_MESSAGE, thirdMessageEl);

    // Phase 5: Wait 2.5 seconds, then show fourth message
    await new Promise(resolve => setTimeout(resolve, 2500));
    await showMessage(FOURTH_MESSAGE, fourthMessageEl);

    // Phase 6: Wait 3 seconds, then auto-transition
    await new Promise(resolve => setTimeout(resolve, 3000));
    autoTransition();
}

// ===== INITIALIZE =====
window.addEventListener('DOMContentLoaded', () => {
    createParticles();
    startSequence();
});

// ===== RESPONSIVE: Recreate particles on resize =====
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Clear existing particles
        particlesContainer.innerHTML = '';
        // Recreate with new count
        createParticles();
    }, 500);
});
