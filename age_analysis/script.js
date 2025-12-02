// --- State Management ---
let viewMode = 'standard'; 
let calculatedData = {}; 

document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split('T')[0];
    const currentDateInput = document.getElementById("current-date");
    const dobInput = document.getElementById("dob");

    if(currentDateInput) currentDateInput.value = today;
    if(dobInput) dobInput.setAttribute("max", today);

    loadHistory();
});

function calculateAge() {
    const nameInput = document.getElementById("name-input").value.trim();
    const dobInput = document.getElementById("dob").value;
    const currentInput = document.getElementById("current-date").value;
    const resultWrapper = document.getElementById("result");
    const errorMsg = document.getElementById("error-msg");

    // Reset UI
    resultWrapper.classList.remove("show");
    resultWrapper.classList.add("hidden"); // Hide initially to restart animation
    errorMsg.innerText = "";

    if (!dobInput || !currentInput) {
        errorMsg.innerText = "Please fill in valid dates.";
        return;
    }

    const dob = new Date(dobInput);
    const current = new Date(currentInput);

    if (dob > current) {
        errorMsg.innerText = "Birth date cannot be in the future!";
        return;
    }

    // --- Core Calculation ---
    let years = current.getFullYear() - dob.getFullYear();
    let months = current.getMonth() - dob.getMonth();
    let days = current.getDate() - dob.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(current.getFullYear(), current.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    // Detailed Stats
    const diffTime = Math.abs(current - dob);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;

    // Next Birthday Logic
    const nextBday = new Date(current.getFullYear(), dob.getMonth(), dob.getDate());
    if (current > nextBday) {
        nextBday.setFullYear(current.getFullYear() + 1);
    }
    const diffBday = Math.ceil((nextBday - current) / (1000 * 60 * 60 * 24));
    const nextBdayText = diffBday === 0 ? "Today! 🎂" : `${diffBday} Days`;

    // Zodiac & Day
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayBorn = daysOfWeek[dob.getDay()];
    const zodiac = getZodiac(dob.getDate(), dob.getMonth() + 1);

    // Save Data
    calculatedData = { years, months, days, totalWeeks, totalHours, totalDays };

    // Save History
    if (nameInput) {
        addToHistory(nameInput, dobInput);
        document.getElementById("name-input").value = ""; 
    }

    // --- Update UI ---
    // Update text fields immediately
    document.getElementById("next-bday").innerText = nextBdayText;
    document.getElementById("zodiac").innerText = zodiac;
    document.getElementById("day-born").innerText = dayBorn;

    // Small delay for animation effect
    setTimeout(() => {
        resultWrapper.classList.remove("hidden"); // <--- VITAL FIX HERE
        resultWrapper.classList.add("show");
        renderView();
    }, 50);
}

// --- View Toggle Logic ---
function switchView(mode, btnElement) {
    viewMode = mode;
    
    // Update Button Styles
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    renderView();
}

function renderView() {
    if (Object.keys(calculatedData).length === 0) return;

    if (viewMode === 'standard') {
        animateValue("card-1-val", calculatedData.years);
        document.getElementById("card-1-label").innerText = "Years";
        
        animateValue("card-2-val", calculatedData.months);
        document.getElementById("card-2-label").innerText = "Months";
        
        animateValue("card-3-val", calculatedData.days);
        document.getElementById("card-3-label").innerText = "Days";
    } else {
        animateValue("card-1-val", calculatedData.totalWeeks);
        document.getElementById("card-1-label").innerText = "Total Weeks";
        
        animateValue("card-2-val", calculatedData.totalDays);
        document.getElementById("card-2-label").innerText = "Total Days";
        
        animateValue("card-3-val", calculatedData.totalHours);
        document.getElementById("card-3-label").innerText = "Total Hours";
    }
}

// --- History Logic ---
function addToHistory(name, date) {
    let history = JSON.parse(localStorage.getItem("ageCalcHistory")) || [];
    history = history.filter(item => item.name !== name);
    history.unshift({ name, date });
    if (history.length > 5) history.pop();
    localStorage.setItem("ageCalcHistory", JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const historyList = document.getElementById("history-list");
    const container = document.getElementById("history-section");
    let history = JSON.parse(localStorage.getItem("ageCalcHistory")) || [];

    historyList.innerHTML = "";
    
    if (history.length > 0) {
        container.classList.remove("hidden");
        history.forEach(item => {
            const div = document.createElement("div");
            div.className = "history-item";
            div.innerHTML = `
                <span onclick="loadFromHistory('${item.date}', '${item.name}')">${item.name}</span>
                <i class="fa-solid fa-times delete-history" onclick="deleteHistory('${item.name}')"></i>
            `;
            historyList.appendChild(div);
        });
    } else {
        container.classList.add("hidden");
    }
}

function loadFromHistory(date, name) {
    document.getElementById("dob").value = date;
    document.getElementById("name-input").value = name;
    calculateAge();
}

function deleteHistory(name) {
    let history = JSON.parse(localStorage.getItem("ageCalcHistory")) || [];
    history = history.filter(item => item.name !== name);
    localStorage.setItem("ageCalcHistory", JSON.stringify(history));
    loadHistory();
}

// --- Helper Functions ---
function getZodiac(day, month) {
    const zodiacs = [
        { char: '♑ Capricorn', start: [12, 22], end: [1, 19] },
        { char: '♒ Aquarius', start: [1, 20], end: [2, 18] },
        { char: '♓ Pisces', start: [2, 19], end: [3, 20] },
        { char: '♈ Aries', start: [3, 21], end: [4, 19] },
        { char: '♉ Taurus', start: [4, 20], end: [5, 20] },
        { char: '♊ Gemini', start: [5, 21], end: [6, 20] },
        { char: '♋ Cancer', start: [6, 21], end: [7, 22] },
        { char: '♌ Leo', start: [7, 23], end: [8, 22] },
        { char: '♍ Virgo', start: [8, 23], end: [9, 22] },
        { char: '♎ Libra', start: [9, 23], end: [10, 22] },
        { char: '♏ Scorpio', start: [10, 23], end: [11, 21] },
        { char: '♐ Sagittarius', start: [11, 22], end: [12, 21] },
        { char: '♑ Capricorn', start: [12, 22], end: [12, 31] }
    ];

    return zodiacs.find(z => 
        (month === z.start[0] && day >= z.start[1]) || 
        (month === z.end[0] && day <= z.end[1])
    ).char;
}

function animateValue(id, end) {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    let start = 0;
    if(end === 0) { obj.innerText = "0"; return; }
    
    let duration = 1000;
    let startTime = null;

    function step(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        obj.innerHTML = Math.floor(progress * end).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    window.requestAnimationFrame(step);
}

function downloadImage() {
    const resultElement = document.querySelector(".glass-container");
    html2canvas(resultElement, {
        backgroundColor: "#0f172a",
        scale: 2
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'age-result.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}