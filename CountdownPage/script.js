// --- 1. CONFIGURATION ---
// ตั้งเวลาเป้าหมาย: ปี 2025, เดือนกุมภาพันธ์ (Index คือ 1), วันที่ 11, เวลา 00:00:00
// *** อย่าลืมเปลี่ยน '2025' เป็นปีปัจจุบันหรือปีหน้าที่ต้องการเซอร์ไพรส์ ***
const birthday = new Date(2026, 1, 11, 21, 30, 00).getTime();

// ข้อความกวนๆ ตอนยังไม่ถึงเวลา
const funnyMessages = [
    "ยังไม่ถึงวันมึงเกิด ใจเย็น!",
    "จะรีบไปไหนนนน ยังไม่ถึงเวลา",
    "กดให้ตายก็ไม่เปิดหรอกแบร่ 😜",
    "รออีกแปปดิ วัยรุ่นใจร้อน",
    "หิวเค้กเหรอ? รอไปก่อนนะจ๊ะ",
    "ปุ่มสีเทาไง คงกดได้มั้ง",
    "กดแรงไปนะ เดี๋ยวปุ่มบุบหรอก",
    "เช็กดวงมาแล้ว วันนี้ไม่ใช่ฤกษ์เปิดจ้า",
    "ว้ายยย กดไม่ได้ล่ะสิ เสียใจด้วยนะ",
    "ไปนอนเถอะ อย่าฝืนเลย",
    "นี่ปุ่มเอง ไม่ใช่ตู้ ATM กดจังเลยนะ!",
    "แจ้งเตือน: ความอดทนของคุณต่ำกว่าเกณฑ์",
    "รอก่อนดิ จะรีบไปเป็นประธานบริษัทเหรอ?",
    "ใจเย็นนะวัยรุ่น พักจิบน้ำก่อนไหม",
    "สิทธิ์ในการกดของคุณยังมาไม่ถึง โปรดรอชาติหน้า... ล้อเล่น!",
    "รออีกนิดจะตายไหมมมม",
    "อย่าดื้อดิ บอกว่าอย่าเพิ่งกดไง",
    "ขยันกดจัง เอาเวลาไปอาบน้ำไป๊!",
    "เห็นความพยายามนะ แต่เสียใจด้วย ไม่ให้เข้า",
    "ตื่นเต้นแหละดูออก แต่รอหน่อยเถอะ",
    "Error 404: อารมณ์อยากให้กดหาไม่เจอ",
    "นับ 1 ถึงล้านรอไปก่อน เดี๋ยวเปิดให้"

];

// --- 2. ELEMENTS ---
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const msgEl = document.getElementById('dynamicMessage');
const enterBtn = document.getElementById('enterBtn');
const soundBtn = document.getElementById('soundBtn');
const tickAudio = document.getElementById('tickSound');
const alarmAudio = document.getElementById('alarmSound');
const toast = document.getElementById('toast');
const mainContainer = document.getElementById('mainContainer');

let isUnlocked = false;
let isMuted = true;

// --- 3. SOUND CONTROL ---
soundBtn.addEventListener('click', () => {
    if (isMuted) {
        // ต้องมี user interaction ก่อนถึงจะเล่นเสียงได้ (Browser Policy)
        tickAudio.play().catch(e => console.log("Audio play failed req interaction"));
        soundBtn.textContent = "🔊";
        isMuted = false;
    } else {
        tickAudio.pause();
        soundBtn.textContent = "🔇";
        isMuted = true;
    }
});

// --- 4. COUNTDOWN LOGIC ---
const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = birthday - now;

    // คำนวณเวลา
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // อัพเดทหน้าจอ
    if (distance > 0) {
        daysEl.innerText = String(days).padStart(2, '0');
        hoursEl.innerText = String(hours).padStart(2, '0');
        minutesEl.innerText = String(minutes).padStart(2, '0');
        secondsEl.innerText = String(seconds).padStart(2, '0');

        // เปลี่ยนข้อความตามช่วงเวลา
        updateMoodMessage(days, hours);
    }

    // ถึงเวลาแล้ว! (Unlock)
    else {
        clearInterval(timer);
        unlockSurprise();
    }
}, 1000);

// --- 5. FUNCTIONS ---

function updateMoodMessage(d, h) {
    if (d > 1) {
        msgEl.innerText = `อีก ${d} วัน... สภาพนี้จะอยู่ถึงวันเกิดมั้ย สู้เขานะวัยรุ่น!`;
    } else if (d === 1) {
        msgEl.innerText = "พรุ่งนี้แล้วนะ เตรียมซ้อมรำหน้านาคยัง? อ้าว ผิดงาน...";
    } else if (h > 0) {
        msgEl.innerText = "อีกไม่กี่ชั่วโมง... กายพร้อม ใจพร้อม ยานวดตราถ้วยทองพร้อม!";
    } else {
        msgEl.innerText = "โชคดีนะ... วัยรุ่น (เหลือน้อย)";
    }
}

function showToast(message) {
    toast.innerText = message;
    toast.className = "toast show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 5000);
}

// ปุ่มกด (Logic หลัก)
enterBtn.addEventListener('click', () => {
    if (!isUnlocked) {
        // สุ่มข้อความกวนๆ
        const randomMsg = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        showToast(randomMsg);
    } else {
        // Smooth transition ไปหน้า Welcome Page
        document.body.style.transition = 'opacity 0.8s ease-out';
        document.body.style.opacity = '0';

        setTimeout(() => {
            window.location.href = "../WelcomePage/welcome.html";
        }, 800);
    }
});

function unlockSurprise() {
    isUnlocked = true;

    // UI Change
    document.body.classList.add('shake-screen'); // สั่นจอ
    document.body.style.backgroundColor = "#bbdefb"; // เปลี่ยนสีพื้นหลัง

    // 🔊 SOUND CHANGE
    tickAudio.pause();      // หยุดเสียงติ๊กๆ
    tickAudio.currentTime = 0; // รีเซ็ตเสียงติ๊ก

    // สั่งเล่นเสียงกริ่ง (Alarm)
    alarmAudio.play().catch(e => console.log("Alarm play failed: " + e));

    // 🎊 CONFETTI EFFECT - Paper Shoot Animation
    // ยิงกระดาษสีสันแบบระเบิดครั้งแรก
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });

    // ยิงกระดาษจากซ้ายและขวา
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });
    }, 250);

    // ยิงกระดาษสีทองและสีเงินแบบต่อเนื่อง
    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.7 },
            colors: ['#FFD700', '#FFA500', '#FF69B4', '#00FF00', '#1E90FF']
        });
    }, 500);

    // ยิงกระดาษแบบฝนตกลงมา
    setTimeout(() => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FFD700', '#FFA500', '#FF1493']
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#00FF00', '#1E90FF', '#FF69B4']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, 750);

    // เปลี่ยนเลขเป็น 00
    daysEl.innerText = "00";
    hoursEl.innerText = "00";
    minutesEl.innerText = "00";
    secondsEl.innerText = "00";

    // เปลี่ยนข้อความ
    msgEl.innerHTML = "🎉 <b>Happy Birthday!</b> ถึงเวลาของขวัญแล้ว";

    // เปลี่ยนปุ่ม
    enterBtn.innerHTML = "🎁 เปิดกล่องของขวัญ";
    enterBtn.classList.add('unlocked');
    enterBtn.classList.remove('enter-btn-locked');

}











