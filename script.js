// Localized memory core checking algorithms. Each user has unique variables[cite: 1]
let level = parseInt(localStorage.getItem("detective_level")) || 1;
let correct = parseInt(localStorage.getItem("detective_correct")) || 0;
let total = parseInt(localStorage.getItem("detective_total")) || 0;

let caseStart = Date.now();
let suspects = [];
let criminal = "";
let selectedMobileIndex = null;

// Hardware Environment Check
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/* ---------------- AUDIO CONTROLLER MODULE ---------------- */
function safeAudio(src) {
    let a = new Audio(src);
    a.onerror = () => {};
    return a;
}

const correctSound = safeAudio("sounds/correct.mp3");
const wrongSound = safeAudio("sounds/wrong.mp3");
const levelSound = safeAudio("sounds/levelup.mp3");
const clickSound = safeAudio("sounds/click.mp3");

correctSound.volume = 0.5;
wrongSound.volume = 0.5;
levelSound.volume = 0.6;
clickSound.volume = 0.3;

/* ---------------- DATA REGISTRY MODULES (REFRESHED MATRIX) ---------------- */
const names = [
    "Ali Khan", "Ahmed Raza", "Sara Malik", "Fatima Noor", "Zara Hussain", "Hassan Tariq", "Ayesha Khan", "Omar Sheikh", 
    "Hiba Noor", "Areeba Khan", "Usman Ali", "Zain Malik", "Ayesha Tariq", "John Smith", "David Lee", "James Carter", 
    "William Brown", "Noah Ali", "Daniel Scott", "Emily Stone", "Lucas White", "Michael Reed", "Liam Carter", 
    "Chris Morgan", "Elena Smith", "Mason Davis", "Sophia Miller", "Ethan Garcia", "Olivia Rodriguez", "Jacob Wilson", 
    "Ava Martinez", "Logan Anderson", "Isabella Taylor", "Lucas Thomas", "Mia Moore", "Jackson Carter", "Oliver Martin", 
    "Charlotte Lee", "Aiden Thompson", "Amelia White", "Ethan Harris", "Harper Sanchez", "Liam Clark", "Evelyn Ramirez", 
    "Benjamin Lewis", "Abigail Robinson"
];

const crimes = ["Diamond Theft", "Mainframe Hack", "Evidence Swap", "Locker Break-in", "Security Breach"];
const places = ["Vault Room", "Tech Server Room", "Archive Room", "Main Exhibition Hall", "Laboratory Block"];

/* High-Difficulty Cryptic Alibi Matrix (Requires Logical Clue Matching) */
const advancedRiddles = [
    {
        clue: "Forensics detected a faint scent of almond extract and vanilla lingering near the open safe.",
        criminalMatch: "baking a batch of fresh macaroons and pastries in the cafeteria kitchen for tomorrow's meeting",
        strongFake: "brewing an intense pot of dark, unsweetened espresso using the premium coffee machine",
        neutralFake: "sorting through stale boxes of cardboard packing material stacked high in the corridor"
    },
    {
        clue: "The thief left behind a trail of fine, black powdery smudges along the light switch frame.",
        criminalMatch: "shading in a large charcoal portrait sketch on heavy canvas paper for my portfolio project",
        strongFake: "wiping down old ink printers with a clean damp white microfiber cloth and rubbing alcohol",
        neutralFake: "unboxing plastic replacement desktop keyboards and plugging them into the terminal docks"
    },
    {
        clue: "A sharp, distinct smell of citrus and chemical alcohol cleaner was trapped inside the server locker.",
        criminalMatch: "scrubbing down the front greasy window glass with a heavy-duty lemon-scented aerosol spray",
        strongFake: "peeling a couple of juicy oranges and eating them at my desk while watching training videos",
        neutralFake: "sweeping dry dust and loose paper fragments out from underneath the corner display cases"
    },
    {
        clue: "The floor beneath the broken window pane had tiny traces of dried red clay soil.",
        criminalMatch: "re-potting the broken baseline terracotta planters out in the greenhouse courtyard section",
        strongFake: "mopping up water spills near the bathroom sinks using a generic commercial string mop unit",
        neutralFake: "replacing burnt-out fluorescent light tubes along the main ceiling tracks of the north wing"
    },
    {
        clue: "A stray piece of bright purple wool fiber was found snagged directly on the sharp wire fence mesh.",
        criminalMatch: "knitting a heavy winter scarf with a new ball of thick violet yarn during my break time",
        strongFake: "hanging up a dark navy blue silk uniform jacket inside the main employee locker room wardrobe",
        neutralFake: "labeling plastic filing cabinets with adhesive paper stickers using an electronic printer labeler"
    },
    {
        clue: "The crime scene smelled overwhelmingly like burnt toast, setting off the internal ventilation sensors.",
        criminalMatch: "making a late-night snack in the toaster and completely overheating the crust edges",
        strongFake: "brewing a strong cup of spicy cinnamon herbal tea over a portable single-burner stove",
        neutralFake: "shredding boxes of outdated accounting ledgers and financial logs from three years ago"
    },
    {
        clue: "Investigators found microscopic flecks of shining glitter dust shimmering on the stolen display stand.",
        criminalMatch: "helping my kid finish their school arts-and-crafts poster project using glue bottles",
        strongFake: "polishing the historical silver trophies and brass plates inside the central trophy cabinet",
        neutralFake: "dusting off the top rows of old encyclopedia books using a feather duster wand"
    }
];

const innocentActivitiesPool = [
    "counting storage containers back inside the primary secure equipment lockup",
    "checking safety inspections on the universal wall fire extinguishers",
    "tightening a loose metal frame screw on the office backup generator door",
    "sorting digitized backup log files into standard chronological order structures",
    "rearranging empty rolling desk chairs inside the secondary employee lounge area"
];

function r(a) { return a[Math.floor(Math.random() * a.length)]; }
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

/* ---------------- PROGRESS AUTOMATION DATA CORE[cite: 1] ---------------- */
function saveProgressToDevice() {
    localStorage.setItem("detective_level", level);
    localStorage.setItem("detective_correct", correct);
    localStorage.setItem("detective_total", total);
}

function clearSavedProgress() {
    if(confirm("Are you sure you want to completely erase your progress and start over from Case 1?")) {
        localStorage.clear();
        level = 1;
        correct = 0;
        total = 0;
        newCase();
        alertBanner("Dossier progress tracking has been reset completely.", "#64748b");
    }
}

/* ---------------- THEME SHIFTER (DYNAMIC PALETTES) ---------------- */
function applyThemeChanges(currentLevel) {
    const root = document.documentElement;
    let themeIndex = Math.floor((currentLevel - 1) / 5) % 5;
    
    switch(themeIndex) {
        case 0:
            root.style.setProperty('--theme-primary', '#38bdf8');
            root.style.setProperty('--theme-bg-glow', '#0b1326');
            root.style.setProperty('--theme-border', '#334155');
            root.style.setProperty('--theme-accent', 'rgba(56, 189, 248, 0.15)');
            break;
        case 1:
            root.style.setProperty('--theme-primary', '#f87171');
            root.style.setProperty('--theme-bg-glow', '#2d0f0f');
            root.style.setProperty('--theme-border', '#5c1e1e');
            root.style.setProperty('--theme-accent', 'rgba(248, 113, 113, 0.15)');
            break;
        case 2:
            root.style.setProperty('--theme-primary', '#34d399');
            root.style.setProperty('--theme-bg-glow', '#062419');
            root.style.setProperty('--theme-border', '#105b3e');
            root.style.setProperty('--theme-accent', 'rgba(52, 211, 153, 0.15)');
            break;
        case 3:
            root.style.setProperty('--theme-primary', '#fbbf24');
            root.style.setProperty('--theme-bg-glow', '#2a1f07');
            root.style.setProperty('--theme-border', '#634a0c');
            root.style.setProperty('--theme-accent', 'rgba(251, 191, 36, 0.15)');
            break;
        case 4:
            root.style.setProperty('--theme-primary', '#c084fc');
            root.style.setProperty('--theme-bg-glow', '#1e0b36');
            root.style.setProperty('--theme-border', '#4c1d95');
            root.style.setProperty('--theme-accent', 'rgba(192, 132, 252, 0.15)');
            break;
    }
}

/* ---------------- CASE ENGINE BUILDER ---------------- */
function buildFreshCaseMatrix(currentLevel) {
    let selectedCrime = r(crimes);
    let selectedPlace = r(places);
    let selectedRiddle = r(advancedRiddles);

    let caseNames = shuffle([...names]).slice(0, 5);
    let suspectRoles = shuffle(["Innocent1", "RedHerring", "Innocent2", "Innocent3", "Criminal"]);

    let temporarySuspectDeck = [];
    let allocatedCriminalName = "";

    const phrasingStyles = [
        (act) => `I spent most of my time tonight ${act}. I was completely focused on that task.`,
        (act) => `If you verify my logs, you will find I was busy ${act}. I didn't see anything unusual.`,
        (act) => `My assignment had me working in the back room ${act}. I stayed there until shift change.`,
        (act) => `I was strictly tasked with ${act} during the hours in question. I didn't leave my area.`
    ];

    suspectRoles.forEach((role, index) => {
        let name = caseNames[index];
        let compiledStatement = "";
        let activeStructure = r(phrasingStyles);
        let uniqueInnocentActivities = shuffle([...innocentActivitiesPool]);

        switch(role) {
            case "Innocent1":
                compiledStatement = activeStructure(uniqueInnocentActivities[0]);
                break;
            case "Innocent2":
                compiledStatement = activeStructure(uniqueInnocentActivities[1]);
                break;
            case "Innocent3":
                compiledStatement = activeStructure(uniqueInnocentActivities[2]);
                break;
            case "RedHerring":
                // The Red Herring mentions an activity that sounds highly suspicious but lacks the critical scientific side-effect
                compiledStatement = activeStructure(selectedRiddle.strongFake);
                break;
            case "Criminal":
                allocatedCriminalName = name;
                // The Criminal describes a normal task that indirectly triggers the crime scene residue clue
                compiledStatement = activeStructure(selectedRiddle.criminalMatch);
                break;
        }

        temporarySuspectDeck.push({
            name: name,
            statement: compiledStatement,
            isCriminal: (role === "Criminal"),
            hasBeenRead: false
        });
    });

    let briefDescriptionHTML = `🚨 <b>INCIDENT RADAR REPORT:</b> A high-profile <b>${selectedCrime}</b> was carried out inside the <b>${selectedPlace}</b>!<br><br>` +
                               `🔍 <b>CRIME SCENE FORENSICS ELEVATION:</b> ${selectedRiddle.clue}<br><br>` +
                               `<i>Warning: Suspects will not admit to leaving the clue behind. Use logic to determine which activity naturally causes the residue mentioned above!</i>`;

    return {
        briefHTML: briefDescriptionHTML,
        cardsDeck: temporarySuspectDeck,
        targetCriminal: allocatedCriminalName
    };
}

function updateUI() {
    let currentAccuracy = total ? Math.round((correct / total) * 100) : 100;
    let liveSeconds = Math.floor((Date.now() - caseStart) / 1000);

    document.getElementById("box1").innerText = "Case " + level;
    document.getElementById("box2").innerText = "Accuracy " + currentAccuracy + "%";
    document.getElementById("box3").innerText = "Time " + liveSeconds + "s";
}

function newCase() {
    if (level > 50) {
        triggerEndGameUI();
        return;
    }

    applyThemeChanges(level);
    
    const promptElement = document.getElementById("deviceInstruction");
    if (promptElement) {
        promptElement.innerText = isMobileDevice 
            ? "Tap any suspect to bring up the Inspect or Arrest option menu." 
            : "Click 'Inspect' to read statements. You can only arrest after checking their files.";
    }

    caseStart = Date.now();
    
    let board = document.getElementById("board");
    if (!board) return;
    board.innerHTML = "";
    
    let activeCaseData = buildFreshCaseMatrix(level);
    suspects = activeCaseData.cardsDeck;
    criminal = activeCaseData.targetCriminal;

    let caseBox = document.getElementById("caseTitle");
    let infoBox = document.getElementById("caseInfo");

    if (caseBox) caseBox.innerText = `Active Inquiry File #${level} / 50`;
    if (infoBox) infoBox.innerHTML = activeCaseData.briefHTML;

    renderSuspectCards();
    updateUI();
}

function renderSuspectCards() {
    let board = document.getElementById("board");
    if (!board) return;
    board.innerHTML = "";

    suspects.forEach((sus, idx) => {
        let div = document.createElement("div");
        div.className = `suspect ${sus.hasBeenRead ? 'read' : ''}`;
        
        let statusMarker = sus.hasBeenRead ? "ANALYZED ✅" : "UNREAD 🔒";

        if (isMobileDevice) {
            div.innerHTML = `
                <div class="suspect-meta-info">👤 ${sus.name}</div>
                <div class="suspect-status-tag">${statusMarker}</div>
            `;
            div.onclick = () => {
                clickSound.play();
                triggerMobileMenuOverlay(idx);
            };
        } else {
            div.innerHTML = `
                <div class="suspect-meta-info">👤 ${sus.name} <span style="font-size: 0.8rem; font-weight: normal; margin-left:10px; color:#64748b;">${statusMarker}</span></div>
                <div class="pc-action-tray">
                    <button class="pc-btn read-btn" onclick="event.stopPropagation(); openSuspectFileCard(${idx})">Inspect</button>
                    <button class="pc-btn arrest-btn" onclick="event.stopPropagation(); processAccusation('${sus.name}')">Arrest</button>
                </div>
            `;
            div.onclick = () => {
                clickSound.play();
                openSuspectFileCard(idx);
            };
        }

        board.appendChild(div);
    });
}

/* ---------------- ACTION HANDLERS & MODALS ---------------- */
function triggerMobileMenuOverlay(index) {
    selectedMobileIndex = index;
    let suspect = suspects[index];
    
    document.getElementById("menuSuspectName").innerText = `Inquiry Action Profile: ${suspect.name}`;
    
    let inspectBtn = document.getElementById("menuInspectBtn");
    let arrestBtn = document.getElementById("menuArrestBtn");

    inspectBtn.onclick = () => {
        closeMobileMenu();
        openSuspectFileCard(index);
    };

    if (suspect.hasBeenRead) {
        arrestBtn.className = "menu-btn arrest";
        arrestBtn.onclick = () => {
            closeMobileMenu();
            processAccusation(suspect.name);
        };
    } else {
        arrestBtn.className = "menu-btn arrest locked";
        arrestBtn.onclick = () => {
            alertBanner("You must inspect this suspect's dossier file before making an arrest!", "#64748b");
        };
    }

    document.getElementById("mobileMenu").classList.remove("hidden");
}

function closeMobileMenu() {
    document.getElementById("mobileMenu").classList.add("hidden");
}

function openSuspectFileCard(index) {
    suspects[index].hasBeenRead = true;
    let selectedSuspect = suspects[index];
    
    const profileEmojis = ["🕵️‍♂️", "🧐", "🔎", "📝", "📁", "📂"];
    let chosenEmoji = r(profileEmojis);

    document.getElementById("popupData").innerHTML =
        `<span class="emoji-pop">${chosenEmoji}</span>` +
        `<b>Suspect Subject Name:</b> ${selectedSuspect.name}<br><br>` +
        `<b>Interview Alibi:</b><br><span style="color:#a7f3d0; font-style:italic;">"${selectedSuspect.statement}"</span>`;

    document.getElementById("popup").classList.remove("hidden");
    renderSuspectCards();
}

function closePopup() {
    document.getElementById("popup").classList.add("hidden");
}

function processAccusation(chosenName) {
    total++;
    let alertBannerWindow = document.getElementById("result");

    if (chosenName === criminal) {
        correct++;
        level++;
        correctSound.play();
        levelSound.play();

        alertBannerWindow.innerText = `Case Solved! Clear for next file.`;
        alertBannerWindow.style.background = "#10b981";
        alertBannerWindow.style.color = "#ffffff";
    } else {
        wrongSound.play();
        alertBannerWindow.innerText = `False Arrest! Clues re-verified.`;
        alertBannerWindow.style.background = "#ef4444";
        alertBannerWindow.style.color = "#ffffff";
    }

    // Save state variables seamlessly to individual browser cache pipelines[cite: 1]
    saveProgressToDevice();
    alertBannerWindow.style.display = "block";

    setTimeout(() => {
        alertBannerWindow.style.display = "none";
        newCase();
    }, 1600);

    updateUI();
}

function alertBanner(msg, color) {
    let b = document.getElementById("result");
    b.innerText = msg;
    b.style.background = color;
    b.style.color = "#ffffff";
    b.style.display = "block";
    setTimeout(() => b.style.display = "none", 2000);
}

function triggerEndGameUI() {
    const primaryBox = document.querySelector(".game-container");
    if (primaryBox) {
        primaryBox.innerHTML = `
            <div class="victory-card">
                <h1>Congratulations!</h1>
                <p>You have completed the game. I appreciate you that you have completed this game.</p>
                <p>I am still working on this games development. I hope you will find another version in some days.</p>
                <em>Final Grade Metrics: Completed all 50 operational modules smoothly!</em>
            </div>
        `;
    }
}

// Global clock processing ticks
setInterval(() => {
    if (level <= 50) {
        updateUI();
    }
}, 1000);

/* -------- ADVANCED PHYSICS BACKGROUND PARTICLES ENGINE -------- */
const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.onresize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
};

const raindrops = [];
const splashes = [];
const ambientEbers = [];

for (let i = 0; i < 40; i++) {
    ambientEbers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: -(0.3 + Math.random() * 0.7),
        opacity: 0.1 + Math.random() * 0.4
    });
}

function animateWeatherEngine() {
    ctx.clearRect(0, 0, width, height);

    ambientEbers.forEach(p => {
        ctx.fillStyle = `rgba(148, 163, 184, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
        }
        if (p.x < -10 || p.x > width + 10) {
            p.x = Math.random() * width;
        }
    });

    if (raindrops.length < 65) {
        raindrops.push({
            x: Math.random() * width,
            y: -20,
            length: 12 + Math.random() * 14,
            speed: 12 + Math.random() * 6,
            opacity: 0.06 + Math.random() * 0.12
        });
    }

    ctx.lineWidth = 1.0;
    raindrops.forEach((drop, idx) => {
        ctx.strokeStyle = `rgba(148, 163, 184, ${drop.opacity})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;

        if (drop.y > height - 12) {
            if (Math.random() > 0.5) {
                splashes.push({
                    x: drop.x,
                    y: height - 6,
                    vx: (Math.random() - 0.5) * 2.2,
                    vy: -Math.random() * 2.0,
                    radius: 0.7 + Math.random() * 0.8,
                    life: 1.0
                });
            }
            raindrops.splice(idx, 1);
        }
    });

    splashes.forEach((splash, idx) => {
        ctx.fillStyle = `rgba(148, 163, 184, ${splash.life * 0.18})`;
        ctx.beginPath();
        ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI * 2);
        ctx.fill();

        splash.x += splash.vx;
        splash.y += splash.vy;
        splash.vy += 0.15; 
        splash.life -= 0.08;

        if (splash.life <= 0) {
            splashes.splice(idx, 1);
        }
    });

    requestAnimationFrame(animateWeatherEngine);
}

/* ---------------- INITIALIZATION RUNNERS ---------------- */
newCase();
animateWeatherEngine();