// ===== CONFIGURATION =====
// ⚠️ IMPORTANT: Replace this URL with your Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbzzfUJRWbItKSsJETpkD54CdQ5_vLZPDwf7rOOZwGMNiOlBy1YZ9qTW0QNASS2hGBHrWg/exec';

// ===== GLOBAL VARIABLES =====
let scene, camera, renderer, stars = [], constellations = [];
let memories = [];
let selectedStar = null;
let isZoomed = false;

// ===== ELEMENTS =====
const galaxyContainer = document.getElementById('galaxy-container');
const memoryModal = document.getElementById('memoryModal');
const launchModal = document.getElementById('launchModal');
const loadingScreen = document.getElementById('loadingScreen');
const bgMusic = document.getElementById('bgMusic');

// Modal buttons
const launchBtn = document.getElementById('launchBtn');
const closeBtn = document.getElementById('closeBtn');
const closeLaunchBtn = document.getElementById('closeLaunchBtn');

// Form elements
const launchForm = document.getElementById('launchForm');
const rocketAnimation = document.getElementById('rocketAnimation');

function createStarTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    );

    // ⭐ สีขาวนวล + เรืองแสง
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.5, 'rgba(200,220,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
}


// ===== INITIALIZE THREE.JS SCENE =====
function initScene() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 50;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    galaxyContainer.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    // Create nebula background
    createNebula();

    // Create background stars
    createBackgroundStars();
}

function formatThaiDate(isoString) {
    if (!isoString) return '';

    const date = new Date(isoString);

    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}


// ===== CREATE NEBULA EFFECT =====
function createNebula() {
    const nebulaGeometry = new THREE.SphereGeometry(100, 32, 32);
    const nebulaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec2 uv = vUv;
                vec3 color1 = vec3(0.54, 0.17, 0.89); // Purple
                vec3 color2 = vec3(0.25, 0.41, 0.88); // Blue
                vec3 color = mix(color1, color2, uv.y + sin(time * 0.5 + uv.x * 3.0) * 0.3);
                
                float alpha = 0.15 + sin(time * 0.3 + uv.x * 2.0) * 0.05;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        side: THREE.BackSide
    });

    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);

    // Animate nebula
    function animateNebula() {
        nebulaMaterial.uniforms.time.value += 0.01;
        requestAnimationFrame(animateNebula);
    }
    animateNebula();
}

// ===== CREATE BACKGROUND STARS =====
let backgroundStars; // เพิ่มตัวแปร global ด้านบนได้

function createBackgroundStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starTexture = createStarTexture();

    const starMaterial = new THREE.PointsMaterial({
        map: starTexture,
        color: 0xffffff,
        size: 1.2,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const starVertices = [];
    for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 300;
        const y = (Math.random() - 0.5) * 300;
        const z = (Math.random() - 0.5) * 300;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(starVertices, 3)
    );

    backgroundStars = new THREE.Points(starGeometry, starMaterial);
    scene.add(backgroundStars);
}


// ===== FETCH MEMORIES FROM GOOGLE SHEETS =====
async function fetchMemories() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.success && result.data) {
            memories = result.data;
            createMemoryStars();
            createConstellations();
            hideLoading();
        } else {
            console.error('Failed to fetch memories:', result.error);
            // Create demo stars if API fails
            createDemoMemories();
            hideLoading();
        }
    } catch (error) {
        console.error('Error fetching memories:', error);
        // Create demo stars if fetch fails
        createDemoMemories();
        hideLoading();
    }
}

// ===== CREATE DEMO MEMORIES (Fallback) =====
function createDemoMemories() {
    memories = [
        { Title: 'วันที่เจอกันครั้งแรก', Message: 'วันที่เราเริ่มต้นมิตรภาพ', Category: 'Friendship', Date: '2020-01-15', ImageURL: '' },
        { Title: 'ผจญภัยครั้งแรก', Message: 'เราไปเที่ยวด้วยกัน', Category: 'Adventure', Date: '2020-06-20', ImageURL: '' },
        { Title: 'ช่วงเวลาที่ฮา', Message: 'หัวเราะจนท้องเกร็ง', Category: 'Funny', Date: '2021-03-10', ImageURL: '' },
        { Title: 'ความทรงจำพิเศษ', Message: 'วันที่จะไม่มีวันลืม', Category: 'Special', Date: '2021-12-25', ImageURL: '' },
    ];
    createMemoryStars();
    createConstellations();
}

// ===== CREATE MEMORY STARS =====
function createMemoryStars() {
    // Clear existing stars
    stars.forEach(star => scene.remove(star.mesh));
    stars = [];

    // Category colors
    const categoryColors = {
        'Friendship': 0xff6b9d,
        'Adventure': 0xffd700,
        'Funny': 0x00ff88,
        'Special': 0xa8daff,
        'Other': 0xff9500
    };

    memories.forEach((memory, index) => {
        const category = memory.Category || 'Other';
        const color = categoryColors[category] || 0xffffff;

        // Create star geometry
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Position stars in a spiral galaxy pattern
        const angle = index * 0.5;
        const radius = 10 + index * 2;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.y = (Math.random() - 0.5) * 10;
        mesh.position.z = Math.sin(angle) * radius;

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.7, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glow);

        scene.add(mesh);

        stars.push({
            mesh: mesh,
            memory: memory,
            category: category,
            originalScale: 1
        });
    });
}

// ===== CREATE CONSTELLATION LINES =====
function createConstellations() {
    // Clear existing constellations
    constellations.forEach(line => scene.remove(line));
    constellations = [];

    // Group stars by category
    const groupedStars = {};
    stars.forEach(star => {
        if (!groupedStars[star.category]) {
            groupedStars[star.category] = [];
        }
        groupedStars[star.category].push(star);
    });

    // Create lines connecting stars in same category
    Object.keys(groupedStars).forEach(category => {
        const categoryStars = groupedStars[category];

        if (categoryStars.length > 1) {
            for (let i = 0; i < categoryStars.length - 1; i++) {
                const points = [];
                points.push(categoryStars[i].mesh.position);
                points.push(categoryStars[i + 1].mesh.position);

                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({
                    color: categoryStars[i].mesh.material.color,
                    transparent: true,
                    opacity: 0.2
                });

                const line = new THREE.Line(geometry, material);
                scene.add(line);
                constellations.push(line);
            }
        }
    });
}

// ===== RAYCASTING FOR STAR SELECTION =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    if (isZoomed) return; // Don't allow clicking while zoomed

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(stars.map(s => s.mesh));

    if (intersects.length > 0) {
        const clickedStar = stars.find(s => s.mesh === intersects[0].object);
        if (clickedStar) {
            zoomToStar(clickedStar);
        }
    }
}

// ===== ZOOM TO STAR WITH GSAP =====
function zoomToStar(star) {
    selectedStar = star;
    isZoomed = true;

    const targetPosition = star.mesh.position.clone();
    targetPosition.z += 5;

    gsap.to(camera.position, {
        duration: 1.5,
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        ease: 'power2.inOut',
        onComplete: () => {
            showMemoryModal(star.memory);
        }
    });

    // Scale up the star
    gsap.to(star.mesh.scale, {
        duration: 1.5,
        x: 2,
        y: 2,
        z: 2,
        ease: 'power2.inOut'
    });
}

// ===== ZOOM OUT =====
function zoomOut() {
    if (!isZoomed || !selectedStar) return;

    gsap.to(camera.position, {
        duration: 1.5,
        x: 0,
        y: 0,
        z: 50,
        ease: 'power2.inOut'
    });

    // Reset star scale
    gsap.to(selectedStar.mesh.scale, {
        duration: 1.5,
        x: 1,
        y: 1,
        z: 1,
        ease: 'power2.inOut',
        onComplete: () => {
            isZoomed = false;
            selectedStar = null;
        }
    });
}

// ===== SHOW MEMORY MODAL =====
function showMemoryModal(memory) {
    document.getElementById('modalTitle').textContent = memory.Title || 'Untitled';
    //document.getElementById('modalDate').textContent = memory.Date || '';
    document.getElementById('modalDate').textContent = formatThaiDate(memory.Date || memory.CreatedAt);
    document.getElementById('modalMessage').textContent = memory.Message || '';
    document.getElementById('modalCategory').textContent = memory.Category || 'General';

    const imageContainer = document.getElementById('modalImage');
    if (memory.ImageURL && memory.ImageURL.trim() !== '') {
        imageContainer.innerHTML = `<img src="${memory.ImageURL}" alt="${memory.Title}">`;
        imageContainer.classList.remove('hidden');
    } else {
        imageContainer.classList.add('hidden');
    }

    memoryModal.classList.add('active');
}

// ===== CLOSE MEMORY MODAL =====
function closeMemoryModal() {
    memoryModal.classList.remove('active');
    zoomOut();
}

// ===== SHOW LAUNCH MODAL =====
function showLaunchModal() {
    launchModal.classList.add('active');
}

// ===== CLOSE LAUNCH MODAL =====
function closeLaunchModal() {
    launchModal.classList.remove('active');
    launchForm.reset();
}

// ===== HANDLE FORM SUBMISSION =====
async function handleLaunchSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('memoryTitle').value;
    const date = document.getElementById('memoryDate').value;
    const category = document.getElementById('memoryCategory').value;
    const message = document.getElementById('memoryMessage').value;
    const imageFile = document.getElementById('memoryImage').files[0];

    let imageBase64 = '';

    // Convert image to base64 if provided
    if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
    }

    // Show rocket animation
    rocketAnimation.classList.add('active');

    // Prepare data
    const data = {
        title: title,
        date: date,
        category: category,
        message: message,
        imageBase64: imageBase64
    };

    try {
        // Send to Google Apps Script
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            // Wait for rocket animation
            setTimeout(() => {
                rocketAnimation.classList.remove('active');
                closeLaunchModal();
                // Reload memories
                fetchMemories();
                alert('🎉 ความทรงจำถูกส่งไปยังจักรวาลแล้ว!');
            }, 2000);
        } else {
            alert('เกิดข้อผิดพลาด: ' + result.error);
            rocketAnimation.classList.remove('active');
        }
    } catch (error) {
        console.error('Error submitting memory:', error);
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
        rocketAnimation.classList.remove('active');
    }
}

// ===== CONVERT FILE TO BASE64 =====
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ===== ANIMATION LOOP =====
function animate() {
    requestAnimationFrame(animate);

    // Rotate camera slowly
    if (!isZoomed) {
        camera.position.x = Math.sin(Date.now() * 0.0001) * 2;
    }

    // Pulse stars
    stars.forEach((star, index) => {
        const pulse = Math.sin(Date.now() * 0.001 + index) * 0.1 + 1;
        if (!isZoomed || star !== selectedStar) {
            star.mesh.children[0].scale.set(pulse, pulse, pulse);
        }
    });

    if (backgroundStars) {
    backgroundStars.material.opacity = 0.7 + Math.sin(Date.now() * 0.0003) * 0.1;
}


    renderer.render(scene, camera);
}

// ===== HIDE LOADING SCREEN =====
function hideLoading() {
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 500);
}

// ===== HANDLE MUSIC =====
function handleMusic() {
    bgMusic.play().catch(e => {
        console.log("Audio autoplay blocked:", e);
        document.body.addEventListener('click', () => {
            bgMusic.play().catch(err => console.log("Music play failed:", err));
        }, { once: true });
    });
}

// ===== EVENT LISTENERS =====
window.addEventListener('click', onMouseClick);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

launchBtn.addEventListener('click', showLaunchModal);
closeBtn.addEventListener('click', closeMemoryModal);
closeLaunchBtn.addEventListener('click', closeLaunchModal);
launchForm.addEventListener('submit', handleLaunchSubmit);

// ===== INITIALIZE =====
window.addEventListener('DOMContentLoaded', () => {
    initScene();
    fetchMemories();
    animate();
    handleMusic();
});
