let level = 1;
let correct = 0;
let total = 0;

let caseStart = Date.now();
let inspectStart = Date.now();

let suspects = [];
let criminal = "";

/* ---------------- SAFE AUDIO (NO CRASH IF FILE MISSING) ---------------- */

function safeAudio(src){
let a = new Audio(src);
a.onerror = ()=>{};
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

/* ---------------- DATA ---------------- */

const names = [
"Ali Khan","Ahmed Raza","John Smith","David Lee","Sara Malik",
"Fatima Noor","James Carter","William Brown","Noah Ali","Zara Hussain",
"Daniel Scott","Hassan Tariq","Emily Stone","Lucas White","Ayesha Khan",
"Michael Reed","Omar Sheikh","Hiba Noor","Liam Carter","Areeba Khan",
"Chris Morgan","Elena Smith","Usman Ali","Zain Malik","Ayesha Tariq"
];

const crimes = ["Robbery","Murder","Heist","Sabotage","Kidnapping"];
const places = ["Bank Vault","Airport Terminal","Train Station","Museum Hall","Laboratory Wing"];

const incidentLines = [
"Security alert triggered after unusual movement detected in restricted zone.",
"CCTV captured brief unauthorized access during operational window.",
"Alarm logs indicate sudden disruption in monitored sector.",
"Multiple sensors recorded irregular activity near critical area.",
"Facility control reports missing item after short surveillance gap."
];

function r(a){
return a[Math.floor(Math.random()*a.length)];
}

/* ---------------- UI ---------------- */

function updateUI(){
let acc = total ? Math.round((correct/total)*100) : 100;
let t = Math.floor((Date.now()-caseStart)/1000);

document.getElementById("box1").innerText = "Case " + level;
document.getElementById("box2").innerText = "Accuracy " + acc + "%";
document.getElementById("box3").innerText = "Time " + t + "s";
}

/* ---------------- POPUP ---------------- */

function openSuspect(i){
inspectStart = Date.now();

let s = suspects[i];

document.getElementById("popupData").innerHTML =
"<b>Name:</b> " + s.name + "<br><br>" +
"<b>Statement:</b> " + s.statement;

document.getElementById("popup").classList.remove("hidden");
}

function closePopup(){
document.getElementById("popup").classList.add("hidden");
}

/* ---------------- STATEMENTS ---------------- */

function statement(role, seed){

const verbs = [
"noticed","cross-checked","reviewed","verified","observed",
"documented","inspected","followed","recorded","tracked",
"recalled","handled","passed through","examined","logged"
];

const actions = [
"security logs","movement trails","entry records","camera feeds",
"system alerts","access history","facility data","shift notes",
"control reports","checkpoint logs","digital trace data"
];

const places = [
"north corridor","south wing","upper hall","storage bay",
"control room","service tunnel","entry gate","admin block",
"restricted section","loading dock","side passage"
];

const time = [
"before the incident window","during transition period",
"around peak hours","in mid-shift cycle","shortly before alarm",
"just after shift change","during routine check cycle"
];

const extras = [
"nothing unusual appeared at the time",
"no direct anomaly was recorded on my side",
"everything seemed aligned with normal activity",
"no unusual interruption was flagged in my logs",
"standard procedure was being followed as usual"
];

function pick(arr, i){
return arr[(seed * (i+3) + i*7) % arr.length];
}

/* role influence (but NOT obvious) */
let v = pick(verbs,1);
let ac = pick(actions,2);
let pl = pick(places,3);
let tm = pick(time,4);
let ex = pick(extras,5);

/* sentence templates (VARIED, NOT REPEATED STYLE) */
let templates = [
`${v} ${ac} around ${pl} ${tm}. ${ex}.`,
`During ${tm}, I ${v} ${ac} near ${pl}. ${ex}.`,
`I ${v} ${ac} at ${pl} ${tm}, and ${ex}.`,
`${ac} were ${v} by me near ${pl} ${tm}. ${ex}.`,
`While ${tm}, ${ac} were being ${v} across ${pl}. ${ex}.`
];

/* role weighting (subtle, not obvious) */
let modifier = "";
if(role === "killer"){
modifier = "One detail feels slightly inconsistent compared to system logs.";
}
if(role === "near"){
modifier = "A small irregularity exists in timing alignment.";
}
if(role === "strong"){
modifier = "Minor mismatch in recorded sequence exists.";
}
if(role === "light"){
modifier = "Everything appears mostly consistent.";
}
if(role === "neutral"){
modifier = "No relevant anomaly detected in my activity.";
}

return templates[seed % templates.length] + " " + modifier;
}

/* ---------------- CASE GENERATION ---------------- */

function newCase(){

caseStart = Date.now();

let board = document.getElementById("board");
if(!board) return; // prevents blank screen crash

board.innerHTML = "";
suspects = [];

let crime = r(crimes);
let place = r(places);

let incident = r(incidentLines);

let caseBox = document.getElementById("caseTitle");
let infoBox = document.getElementById("caseInfo");

if(caseBox) caseBox.innerText = "Case " + level;

if(infoBox){
infoBox.innerHTML =
"<b>" + crime + "</b> at <b>" + place + "</b><br><br>" +
"<i>" + incident + "</i><br><br>" +
"Analyze carefully. Nothing is obvious.";
}

/* SUSPECTS */
let pool = [];
while(pool.length < 5){
let n = r(names);
if(!pool.includes(n)) pool.push(n);
}

pool.sort(()=>Math.random()-0.5);

criminal = r(pool);

let roles = ["neutral","light","strong","near","strong"];

pool.forEach((name,i)=>{

let role = roles[i];

if(name === criminal){
role = "killer";
}

let seed = level*1000 + i*77 + Math.floor(Math.random()*999);

let st = statement(role, seed);

suspects.push({name:name, statement:st});

let div = document.createElement("div");
div.className = "suspect";
div.innerHTML = "🕵️ " + name;

div.onclick = ()=>{
clickSound.play();
guess(name);
};

div.oncontextmenu = (e)=>{
e.preventDefault();
openSuspect(i);
};

board.appendChild(div);
});

updateUI();
}

/* ---------------- GUESS ---------------- */

function guess(name){

total++;

let timeTaken = Math.floor((Date.now()-inspectStart)/1000);

let box = document.getElementById("result");

if(name === criminal){
correct++;
level++;

correctSound.play();
levelSound.play();

box.innerText = "Correct! Time: " + timeTaken + "s";
}else{
wrongSound.play();
box.innerText = "Wrong! Time: " + timeTaken + "s";
}

box.style.display = "block";

setTimeout(()=>{
box.style.display = "none";
newCase();
},1200);

updateUI();
}

/* ---------------- START ---------------- */

newCase();
updateUI();