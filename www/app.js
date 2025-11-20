// State Management
const state = {
    habitName: '',
    stakeAmount: 0,
    totalDays: 0,
    currentDay: 1,
    lastCheckInDate: null,
    isForfeited: false,
    startDate: null
};

// DOM Elements
const elements = {
    onboarding: document.getElementById('onboarding'),
    dashboard: document.getElementById('dashboard'),
    habitNameInput: document.getElementById('habit-name'),
    stakeAmountInput: document.getElementById('stake-amount'),
    totalDaysInput: document.getElementById('total-days'),
    startBtn: document.getElementById('start-btn'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    currentDayDisplay: document.getElementById('current-day-display'),
    totalDaysDisplay: document.getElementById('total-days-display'),
    checkInBtn: document.getElementById('check-in-btn'),
    btnText: document.getElementById('btn-text'),
    btnSubtext: document.getElementById('btn-subtext'),
    moneyDisplay: document.getElementById('money-display'),
    batteryRing: document.getElementById('battery-ring'),
    clickSound: document.getElementById('click-sound'),
    forfeitOverlay: document.getElementById('forfeit-overlay'),
    resetBtn: document.getElementById('reset-btn')
};

// Constants
const STORAGE_KEY = 'habet_state';
const FULL_DASH_ARRAY = 283; // 2 * pi * 45

// Colors
const COLORS = {
    green: '#00FF00', // Active / Safe
    yellow: '#FFFF00', // Warning / Not Checked In
    red: '#FF0033',   // Danger / Forfeit
    dim: '#333333'
};

// Initialization
function init() {
    loadState();
    checkDateLogic();
    render();

    // Event Listeners
    elements.startBtn.addEventListener('click', handleStart);
    elements.checkInBtn.addEventListener('click', handleCheckIn);
    elements.resetBtn.addEventListener('click', handleReset);
}

// Logic
function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        Object.assign(state, JSON.parse(saved));
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function checkDateLogic() {
    if (!state.startDate || state.isForfeited) return;

    const today = new Date().toISOString().split('T')[0];

    if (!state.lastCheckInDate) {
        // If start date was in the past and we haven't checked in, check if we missed it.
        // For simplicity, we assume Day 1 starts when they create it.
        // If today > startDate + 1 day (approx), then forfeit.
        // But let's stick to the simple "Missed a day" logic relative to last check-in or start.
        return;
    }

    const lastCheck = new Date(state.lastCheckInDate);
    const now = new Date(today);
    const diffTime = Math.abs(now - lastCheck);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
        triggerForfeit();
    }
}

function handleStart() {
    const name = elements.habitNameInput.value;
    const stake = parseInt(elements.stakeAmountInput.value);
    const days = parseInt(elements.totalDaysInput.value);

    if (!name || !stake || !days) {
        shakeElement(elements.onboarding);
        return;
    }

    state.habitName = name;
    state.stakeAmount = stake;
    state.totalDays = days;
    state.currentDay = 1;
    state.lastCheckInDate = null;
    state.isForfeited = false;
    state.startDate = new Date().toISOString().split('T')[0];

    saveState();

    // Animate transition
    anime({
        targets: elements.onboarding,
        opacity: 0,
        duration: 500,
        easing: 'easeInOutQuad',
        complete: () => {
            elements.onboarding.classList.add('hidden');
            elements.dashboard.classList.remove('hidden');
            elements.dashboard.style.opacity = 0;
            renderDashboard();
            anime({
                targets: elements.dashboard,
                opacity: 1,
                duration: 500,
                easing: 'easeInOutQuad'
            });
        }
    });
}

function handleCheckIn() {
    const today = new Date().toISOString().split('T')[0];

    if (state.lastCheckInDate === today) return;

    // Play Sound
    elements.clickSound.currentTime = 0;
    elements.clickSound.play().catch(e => console.log("Audio play failed", e));

    // Animation: Button Press
    anime({
        targets: elements.checkInBtn,
        scale: [1, 0.95],
        duration: 100,
        easing: 'easeOutQuad',
        direction: 'alternate'
    });

    // Update State
    state.lastCheckInDate = today;
    if (state.currentDay < state.totalDays) {
        state.currentDay++;
    }

    saveState();
    renderDashboard();
}

function triggerForfeit() {
    state.isForfeited = true;
    saveState();
    renderDashboard();
}

function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
}

// Rendering
function render() {
    if (state.habitName) {
        elements.onboarding.classList.add('hidden');
        elements.dashboard.classList.remove('hidden');
        renderDashboard();
    } else {
        elements.onboarding.classList.remove('hidden');
        elements.dashboard.classList.add('hidden');
    }
}

function renderDashboard() {
    // Update Header
    elements.currentDayDisplay.textContent = String(state.currentDay).padStart(2, '0');
    elements.totalDaysDisplay.textContent = String(state.totalDays).padStart(2, '0');

    // Update Money
    const currentMoney = state.isForfeited ? 0 : state.stakeAmount;
    elements.moneyDisplay.textContent = currentMoney;

    // Update Status & Battery Color
    const today = new Date().toISOString().split('T')[0];
    const isCheckedIn = state.lastCheckInDate === today;

    let ringColor = COLORS.yellow; // Default: Warning/Pending
    let statusMsg = "PENDING";

    if (state.isForfeited) {
        ringColor = COLORS.red;
        statusMsg = "FAILED";
        elements.statusDot.className = "w-1.5 h-1.5 rounded-full bg-accent";
        elements.statusText.className = "text-[10px] tracking-widest text-accent uppercase";
        elements.forfeitOverlay.classList.remove('hidden');
    } else if (isCheckedIn) {
        ringColor = COLORS.green;
        statusMsg = "COMPLETED";
        elements.statusDot.className = "w-1.5 h-1.5 rounded-full bg-green-500";
        elements.statusText.className = "text-[10px] tracking-widest text-green-500 uppercase";

        // Button State: Subtle Done
        elements.checkInBtn.disabled = true;
        elements.checkInBtn.classList.add('border-dim', 'opacity-80');
        elements.checkInBtn.classList.remove('hover:border-white');
        elements.btnText.textContent = "DONE";
        elements.btnSubtext.textContent = "See you tomorrow";
    } else {
        // Pending
        ringColor = COLORS.yellow;
        statusMsg = "ACTION REQUIRED";
        elements.statusDot.className = "w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse";
        elements.statusText.className = "text-[10px] tracking-widest text-yellow-400 uppercase";

        // Button State: Active
        elements.checkInBtn.disabled = false;
        elements.checkInBtn.classList.remove('border-dim', 'opacity-80');
        elements.checkInBtn.classList.add('hover:border-white');
        elements.btnText.textContent = "CHECK IN";
        elements.btnSubtext.textContent = "Tap to confirm";
    }

    elements.statusText.textContent = statusMsg;

    // Update Battery Ring
    updateBatteryRing(ringColor);
}

function updateBatteryRing(color) {
    // Logic: 
    // If Forfeited: Empty (or Red full?) -> Let's make it Red Full to show the "Blood" or "Loss". Or Empty.
    // User said "changes color to yellow and then red".
    // Let's keep the ring full but change color to indicate status.
    // OR, let's make the ring represent the STAKE.
    // If active, 100% full.
    // If forfeited, 0%? Or 100% Red?
    // Let's go with 100% stroke, changing color.

    elements.batteryRing.style.stroke = color;

    // Optional: We could animate the stroke dashoffset to show "filling up" on load
    // But for now, let's keep it full circle as a "Battery" container.
    elements.batteryRing.style.strokeDashoffset = 0;

    if (state.isForfeited) {
        // Maybe drain it?
        elements.batteryRing.style.strokeDashoffset = FULL_DASH_ARRAY; // Empty
        elements.batteryRing.style.stroke = COLORS.red;
    }
}

// Animations
function shakeElement(el) {
    anime({
        targets: el,
        translateX: [
            { value: -5, duration: 50 },
            { value: 5, duration: 50 },
            { value: -5, duration: 50 },
            { value: 5, duration: 50 },
            { value: 0, duration: 50 }
        ],
        easing: 'easeInOutQuad'
    });
}

// Run
init();
