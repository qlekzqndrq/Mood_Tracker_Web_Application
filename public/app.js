const API_URL = 'http://localhost:5000/api';

// --- HELPER: TOKEN HEADER ---
// Adaugă tokenul la cereri pentru ca serverul să ne dea datele
function getAuthHeaders() {
    const token = localStorage.getItem('mood_user_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// --- 0. PORTARUL (VERIFICARE LOGARE) ---
document.addEventListener('DOMContentLoaded', () => {
    const isAuthPage = window.location.href.includes('auth/');

    if (!isAuthPage) {
        // *** FIX CRITIC AICI ***
        // Înainte era setItem (care returna undefined -> logout). 
        // Acum e getItem (citeste tokenul -> rămâi logat).
        const token = localStorage.getItem('mood_user_token');

        if (!token) {
            window.location.href = 'auth/login.html';
            return;
        }
    }

    initApp();
});

// --- 1. INITIALIZARE APLICAȚIE ---
async function initApp() {
    const options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    };
    const dateElement = document.getElementById('currentDateDisplay');
    if (dateElement) {
        dateElement.innerText = new Date().toLocaleDateString('en-US', options);
    }

    await loadUserProfile();
    await checkTodayStatus();
    await loadStats();
    await loadChart();
}

// --- 2. STATE MANAGEMENT ---
let currentUser = null;
let wizardData = {
    mood: null,
    tags: [],
    reflection: "",
    sleep: null
};

// --- 3. USER PROFILE ---
async function loadUserProfile() {
    try {
        const res = await fetch(`${API_URL}/users/profile`, {
            method: 'GET',
            headers: getAuthHeaders(),
            cache: 'no-store'
        });

        // Dacă tokenul a expirat, delogăm curat
        if (res.status === 401) {
            logout();
            return;
        }

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const user = await res.json();
            currentUser = user;
            updateUserUI(user.name, user.email, user.avatarURL);
        }

    } catch (err) {
        console.warn("Backend loading failed, using local fallback.");
        const localName = localStorage.getItem('mood_username') || 'Friend';
        const localAvatar = localStorage.getItem('mood_user_avatar');
        updateUserUI(localName, 'user@example.com', localAvatar);
    }
}

function updateUserUI(name, email, avatar) {
    const safeName = name && name.trim() !== "" ? name : "User";

    if (document.querySelector('.user-name-display')) {
        document.querySelector('.user-name-display').innerText = safeName;
    }

    const avatarImg = document.getElementById('nav-avatar');
    if (avatarImg) {
        avatarImg.src = avatar && avatar.trim() !== ""
            ? avatar
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}`;
    }

    const ddName = document.getElementById('dropdown-name');
    if (ddName) ddName.innerText = safeName;

    const ddEmail = document.getElementById('dropdown-email');
    if (ddEmail) ddEmail.innerText = email || "";

    const settName = document.getElementById('setting-name');
    if (settName) settName.value = safeName;

    const settAv = document.getElementById('setting-avatar');
    if (settAv) settAv.value = avatar || "";

    const settAvPrev = document.getElementById('setting-avatar-preview');
    if (settAvPrev) {
        settAvPrev.src = avatar && avatar.trim() !== ""
            ? avatar
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}`;
    }
}

// --- 4. TODAY STATUS ---
async function checkTodayStatus() {
    try {
        const res = await fetch(`${API_URL}/logs/recent`, {
            headers: getAuthHeaders() // Adăugat Header
        });
        if (!res.ok) return;

        const logs = await res.json();

        if (logs.length > 0) {
            const lastLogDate = new Date(logs[0].date).toDateString();
            const todayDate = new Date().toDateString();

            if (lastLogDate === todayDate) {
                showLoggedHero(logs[0]);
            } else {
                showEmptyHero();
            }
        } else {
            showEmptyHero();
        }
    } catch (err) {
        console.error(err);
    }
}

function showEmptyHero() {
    const heroEmpty = document.getElementById('hero-empty');
    if (heroEmpty) heroEmpty.style.display = 'block';
    const heroLogged = document.getElementById('hero-logged');
    if (heroLogged) heroLogged.style.display = 'none';
}

function showLoggedHero(log) {
    const heroEmpty = document.getElementById('hero-empty');
    if (heroEmpty) heroEmpty.style.display = 'none';

    const heroLogged = document.getElementById('hero-logged');
    if (heroLogged) heroLogged.style.display = 'grid';

    const moodMap = {
        "1": { text: "Very Sad", emoji: "😭" },
        "2": { text: "Sad", emoji: "☹️" },
        "3": { text: "Neutral", emoji: "😐" },
        "4": { text: "Happy", emoji: "🙂" },
        "5": { text: "Very Happy", emoji: "🤩" }
    };

    const moodData = moodMap[log.moodScore] || { text: "Unknown", emoji: "❓" };

    document.getElementById('today-mood-text').innerText = moodData.text;
    document.getElementById('today-emoji').innerText = moodData.emoji;
    document.getElementById('today-sleep').innerText = log.sleepHours + " hours";
    document.getElementById('today-reflection').innerText = log.journalEntry || "No reflection.";

    // --- AICI ESTE MODIFICAREA PENTRU TAG-URI ---
    const tagsContainer = document.getElementById('today-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = ''; // Curățăm conținutul vechi

        // Verificăm dacă avem tag-uri salvate (feelings)
        if (log.feelings && log.feelings.length > 0) {
            log.feelings.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'hashtag';
                span.innerText = `#${tag}`; // Punem # în față
                tagsContainer.appendChild(span);
            });
        }
    }

    loadQuote(log.moodScore);
}

async function loadQuote(score) {
    try {
        const res = await fetch(`${API_URL}/quotes/${score}`, {
            headers: getAuthHeaders() // Adăugat Header (preventiv)
        });
        if (res.ok) {
            const data = await res.json();
            const qEl = document.getElementById('today-quote');
            if (qEl) qEl.innerText = `"${data.quote}"`;
        }
    } catch (e) {
        console.log(e);
    }
}

// --- 5. STATISTICS ---
async function loadStats() {
    try {
        const res = await fetch(`${API_URL}/logs/stats`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) return;

        const data = await res.json();
        const moodCard = document.getElementById('mood-card-container');
        const sleepCard = document.getElementById('sleep-card-container');

        if (!moodCard || !sleepCard) return;

        moodCard.className = 'stat-card';
        sleepCard.className = 'stat-card';

        if (data.hasEnoughData === false) {
            document.getElementById('mood-empty').style.display = 'block';
            document.getElementById('sleep-empty').style.display = 'block';
            document.getElementById('mood-full').style.display = 'none';
            document.getElementById('sleep-full').style.display = 'none';
            moodCard.classList.add('mood-gradient');
            sleepCard.classList.add('sleep-gradient');
        } else {
            document.getElementById('mood-empty').style.display = 'none';
            document.getElementById('sleep-empty').style.display = 'none';
            document.getElementById('mood-full').style.display = 'block';
            document.getElementById('sleep-full').style.display = 'block';

            const avgMood = Math.round(data.recent.mood);
            moodCard.classList.add(`mood-card-${avgMood}`);
            sleepCard.classList.add('sleep-card-active');

            const moodNames = ["", "Very Sad", "Sad", "Neutral", "Happy", "Very Happy"];
            
            // Reparăm afișarea valorilor
            document.getElementById('stats-mood-val').innerText = moodNames[avgMood] || "Neutral";
            document.getElementById('stats-sleep-val').innerText = data.recent.sleep + " Hours";

            // Luăm textul direct din obiectul comparison trimis de serverul tău
            const moodCompEl = document.getElementById('stats-mood-comp');
            const sleepCompEl = document.getElementById('stats-sleep-comp');

            if (data.comparison) {
                if (moodCompEl) moodCompEl.innerText = data.comparison.mood.text;
                if (sleepCompEl) sleepCompEl.innerText = data.comparison.sleep.text;
            } else {
                if (moodCompEl) moodCompEl.innerText = "Collecting more history...";
                if (sleepCompEl) sleepCompEl.innerText = "Collecting more history...";
            }
        }
    } catch (e) {
        console.error("Stats err:", e);
    }
}

// --- 6. CHART (FINAL: LUNA + ZIUA BOLD) ---
async function loadChart() {
    try {
        const res = await fetch(`${API_URL}/logs/recent`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) return;

        const logs = await res.json();
        const logsRev = logs.reverse();

        const canvas = document.getElementById('trendsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const barColors = logsRev.map(l => {
            const score = l.moodScore;
            if (score === 1) return '#FF9B99';
            if (score === 2) return '#B8B1FF';
            if (score === 3) return '#89CAFF';
            if (score === 4) return '#89E780';
            if (score === 5) return '#FFC97C';
            return '#CBCDD0';
        });

        const moodTexts = ["", "Very Sad", "Sad", "Neutral", "Happy", "Very Happy"];
        const moodEmojis = ["", "😭", "☹️", "😐", "🙂", "🤩"];

        if (typeof Chart !== 'undefined') {
            if (window.myMoodChart instanceof Chart) {
                window.myMoodChart.destroy();
            }

            window.myMoodChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    // AICI MODIFICĂM: Pregătim datele (Lună și Zi separate)
                    labels: logsRev.map(l => {
                        const d = new Date(l.date);
                        const month = d.toLocaleString('en-US', { month: 'long' }); // ex: April
                        const day = d.getDate(); // ex: 16
                        return [month, day]; // Le trimitem ca listă
                    }),
                    datasets: [{
                        label: 'Sleep',
                        data: logsRev.map(l => {
                            const sleep = l.sleepHours;
                            if (sleep >= 9) return 5;
                            if (sleep >= 7) return 4;
                            if (sleep >= 5) return 3;
                            if (sleep >= 3) return 2;
                            return 1;
                        }),
                        backgroundColor: barColors,
                        borderRadius: 20,
                        barThickness: 30,
                        extraData: logsRev.map(l => ({
                            realSleep: l.sleepHours,
                            moodScore: l.moodScore,
                            reflection: l.journalEntry || "No reflection.",
                            tags: l.feelings || []
                        }))
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            bottom: 30 // Facem loc jos pentru textul nostru
                        }
                    },
                    // --- ÎNLOCUIEȘTE BLOCUL 'plugins' DIN INTERIORUL OPTIUNILOR CHART-ULUI ---
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            backgroundColor: '#21214D', // Fundal închis (Navy)
                            titleColor: '#FFFFFF', // Titlu alb
                            bodyColor: '#E0E6FA', // Text corp gri-albăstrui
                            padding: 12, // Spațiu interior mai mare
                            cornerRadius: 12, // Colțuri rotunjite
                            displayColors: false, // Pătrățelul de culoare din stânga
                            boxPadding: 6, // Spațiu între pătrățel și text

                            // AICI E TRUCUL PENTRU ALINIERE
                            bodyAlign: 'left', // Forțează textul la stânga
                            titleAlign: 'left',

                            callbacks: {
                                // Titlul (Ex: 🤩 Very Happy)
                                title: function(context) {
                                    const idx = context[0].dataIndex;
                                    const extra = context[0].dataset.extraData[idx];
                                    return `${moodEmojis[extra.moodScore]} ${moodTexts[extra.moodScore]}`;
                                },
                                // Corpul (Liniile cu Sleep, Reflection, Tags)
                                label: function(context) {
                                    const idx = context.dataIndex;
                                    const extra = context.dataset.extraData[idx];

                                    // Construim liniile
                                    let lines = [
                                        `💤 Sleep: ${extra.realSleep} hours`
                                    ];

                                    // Reflection (tăiată dacă e prea lungă)
                                    if (extra.reflection) {
                                        const shortRef = extra.reflection.length > 30 ?
                                            extra.reflection.substring(0, 30) + '...' :
                                            extra.reflection;
                                        lines.push(`📝 Reflection: ${shortRef}`);
                                    }

                                    // Tags
                                    if (extra.tags && extra.tags.length > 0) {
                                        lines.push(`🏷️ Tags: ${extra.tags.join(', ')}`);
                                    }

                                    return lines;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            display: true,
                            min: 0,
                            sugestedmax: 5,
                            grid: {
                                drawBorder: false,
                                color: (context) => {
                                    if (context.tick.value === 5) {
                                        return 'transparent';
                                    }
                                    return '#E5E5EF'
                                }
                            },
                            ticks: {
                                callback: function(val) {
                                    if (val === 5) return '9+ h';
                                    if (val === 4) return '7-8 h';
                                    if (val === 3) return '5-6 h';
                                    if (val === 2) return '3-4 h';
                                    if (val === 1) return '0-2 h';
                                    return '';
                                },
                                font: { size: 11 },
                                color: '#9393B7',
                                padding: 10
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                display: false // ASCUNDEM ETICHETELE STANDARD
                            }
                        }
                    }
                },
                // --- PLUGIN CUSTOM PENTRU TEXT BOLD ---
                plugins: [{
                    id: 'customLabels',
                    afterDraw: function(chart) {
                        const ctx = chart.ctx;
                        const xAxis = chart.scales.x;
                        const yPos = chart.chartArea.bottom;

                        chart.data.labels.forEach((label, index) => {
                            const x = xAxis.getPixelForValue(index);
                            const month = label[0];
                            const day = label[1];

                            // 1. Desenăm LUNA (Normal, Gri)
                            ctx.fillStyle = '#9393B7';
                            ctx.font = '12px sans-serif'; // Font normal
                            ctx.textAlign = 'center';
                            ctx.fillText(month, x, yPos + 20);

                            // 2. Desenăm ZIUA (Bold, Albastru închis)
                            ctx.fillStyle = '#9393B7';
                            ctx.font = 'bold 15px sans-serif'; // <--- AICI E BOLD-UL
                            ctx.fillText(day, x, yPos + 38);
                        });
                    }
                }]
            });
        }
    } catch (err) {
        console.error(err);
    }
}

// --- 7. MODALE & WIZARD ---
function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(el => {
        el.style.display = 'none';
    });
}

function toggleDropdown() {
    const dd = document.getElementById('userDropdown');
    if (dd) dd.classList.toggle('show');
}

function openSettings(event) {
    if (event) event.stopPropagation();
    closeAllModals();
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'flex';
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
}

function openLogModal() {
    closeAllModals();
    const modal = document.getElementById('logModal');
    if (modal) {
        modal.style.display = 'flex';
        goToStep(1);
        wizardData = { mood: null, tags: [], reflection: "", sleep: null };
        resetWizardStyles();
    }
}

function closeLogModal() {
    const modal = document.getElementById('logModal');
    if (modal) modal.style.display = 'none';
}

function goToStep(stepNumber) {
    document.querySelectorAll('.wizard-step').forEach(el => el.style.display = 'none');
    const stepEl = document.getElementById(`step-${stepNumber}`);
    if (stepEl) stepEl.style.display = 'block';

    document.querySelectorAll('.step-dash').forEach((dash, index) => {
        if (index < stepNumber) dash.classList.add('active');
        else dash.classList.remove('active');
    });
}

function showErrorEffect(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.classList.add('input-error');
        setTimeout(() => el.classList.remove('input-error'), 2000);
    }
}

function nextStep(targetStep) {
    if (targetStep === 2 && !wizardData.mood) {
        showErrorEffect('mood-options');
        return;
    }
    goToStep(targetStep);
}

function selectMood(value, element) {
    wizardData.mood = value;
    document.querySelectorAll('#mood-options .option-btn').forEach(b => b.classList.remove('selected'));
    element.classList.add('selected');
}

function toggleTag(element) {
    const tagText = element.innerText;
    if (wizardData.tags.includes(tagText)) {
        wizardData.tags = wizardData.tags.filter(t => t !== tagText);
        element.classList.remove('selected');
    } else {
        if (wizardData.tags.length >= 3) return alert("Max 3 tags!");
        wizardData.tags.push(tagText);
        element.classList.add('selected');
    }
}

function updateCharCount(textarea) {
    const cnt = document.getElementById('char-current');
    if (cnt) cnt.innerText = textarea.value.length;
    wizardData.reflection = textarea.value;
}

function selectSleep(value, element) {
    wizardData.sleep = value;
    document.querySelectorAll('#sleep-options .option-btn').forEach(b => b.classList.remove('selected'));
    element.classList.add('selected');
}

function resetWizardStyles() {
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    const ref = document.getElementById('wizard-reflection');
    if (ref) ref.value = "";
    const cnt = document.getElementById('char-current');
    if (cnt) cnt.innerText = "0";
}

// --- SUBMIT FINAL ---
async function submitWizard() {
    if (!wizardData.sleep) {
        showErrorEffect('sleep-options');
        return;
    }

    try {
        const payload = {
            moodScore: wizardData.mood,
            sleepHours: wizardData.sleep,
            journalEntry: wizardData.reflection,
            feelings: wizardData.tags
        };

        const response = await fetch(`${API_URL}/logs`, {
            method: 'POST',
            headers: getAuthHeaders(), // TOKEN ADĂUGAT
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            closeAllModals();
            window.location.reload();
        } else {
            alert("Eroare la salvare. Verifică dacă MongoDB e pornit!");
        }
    } catch (e) {
        console.error(e);
    }
}

// --- LOGOUT ---
function logout() {
    // 1. Șterge datele din LocalStorage (unde am salvat token-ul ca să reziste la refresh)
    localStorage.removeItem('mood_user_token');
    localStorage.removeItem('mood_username');
    localStorage.removeItem('mood_user_avatar');

    // 2. Șterge și din SessionStorage (pentru siguranță)
    sessionStorage.clear();

    // 3. Trimite utilizatorul la pagina de Login
    window.location.href = "auth/login.html"; // Sau calea corectă către login.html
}

// --- SETĂRI PROFIL (Fix Imagine + Update Instant) ---
const settingsForm = document.getElementById('settingsForm');

// 1. LOGICA DE PREVIZUALIZARE (Live Preview)
const avatarInput = document.getElementById('setting-avatar');
const avatarPreview = document.getElementById('setting-avatar-preview');

if (avatarInput && avatarPreview) {
    // Când utilizatorul scrie sau dă paste la un link
    avatarInput.addEventListener('input', (e) => {
        const val = e.target.value;
        // Dacă e gol, punem o imagine default, altfel încercăm să încărcăm link-ul
        avatarPreview.src = val ? val : `https://ui-avatars.com/api/?name=${localStorage.getItem('mood_username')}`;
    });

    // Dacă imaginea e greșită (link stricat), punem un fallback
    avatarPreview.addEventListener('error', () => {
        avatarPreview.src = "https://ui-avatars.com/api/?name=Error";
    });
}

// 2. LOGICA DE SALVARE (Submit)
if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI Feedback: Arătăm că se lucrează
        const btn = settingsForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = "Saving...";
        btn.disabled = true;

        const name = document.getElementById('setting-name').value;
        const avatar = document.getElementById('setting-avatar').value;

        try {
            // Trimitem la server
            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    name,
                    avatarURL: avatar
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();

                // === PASUL CRITIC PENTRU PERSISTENȚĂ ===

                // A. Actualizăm "memoria" browserului
                localStorage.setItem('mood_username', updatedUser.name);
                localStorage.setItem('mood_user_avatar', updatedUser.avatarURL || '');

                // B. Actualizăm variabila globală
                currentUser = updatedUser;

                // C. Actualizăm VIZUAL pagina imediat (fără refresh)
                updateUserUI(updatedUser.name, updatedUser.email, updatedUser.avatarURL);

                // D. Închidem fereastra
                closeSettings();
            } else {
                alert("Eroare la salvare.");
            }
        } catch (err) {
            console.error(err);
            alert("Nu s-a putut conecta la server.");
        } finally {
            // Resetăm butonul
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// textul dinamic ("Same as previous", "Better than usual")
function getComparisonText(currentVal, previousVal, type) {
    // Dacă nu există date vechi, afișăm textul de așteptare
    if (previousVal === null || previousVal === undefined) {
        return "Collecting more history...";
    }

    // Calculăm diferența
    let diff = currentVal - previousVal;
    diff = Math.round(diff * 10) / 10;

    if (diff === 0) return "Same as the previous 5 check-ins";

    // Text pentru MOOD
    if (type === 'mood') {
        if (diff > 0) return "Feeling better than usual 📈";
        return "Feeling lower than usual 📉";
    }

    // Text pentru SLEEP
    if (type === 'sleep') {
        if (diff > 0) return `+${diff}h vs previous check-ins`;
        return `${diff}h vs previous check-ins`;
    }
}