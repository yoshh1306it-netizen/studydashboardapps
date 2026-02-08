// Global State
let currentDate = new Date();
let currentClass = localStorage.getItem('selectedClass') || '21HR';
let settings = {
    class: currentClass
};

// Pomodoro State
let timerInterval;
let timeLeft = 25 * 60;
let isTimerRunning = false;
let totalTime = 25 * 60; // プログレスバー用

// DOM Elements Loading
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    updateGreeting(); // 3. 挨拶の初期化
    initializeClock();
    loadScheduleData();
    initializePomodoro();
    initializeTodo();
    
    // 定期的な挨拶の更新（時間が変わったとき用）
    setInterval(updateGreeting, 60000); 
});

// Settings Manager
function loadSettings() {
    const saved = localStorage.getItem('dashboardSettings');
    if (saved) {
        settings = JSON.parse(saved);
        currentClass = settings.class;
    }
    // ヘッダーのクラス表示を更新
    const classDisplay = document.getElementById('header-class-name');
    if (classDisplay) classDisplay.textContent = currentClass;
}

// 3. Time-based Greeting
function updateGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.getElementById('greeting-message');
    let message = "今日も頑張りましょう！";

    if (hour >= 5 && hour < 11) {
        message = "おはようございます！今日も一日頑張りましょう。";
    } else if (hour >= 11 && hour < 17) {
        message = "こんにちは！適度な休憩も忘れずに。";
    } else if (hour >= 17 && hour < 22) {
        message = "こんばんは！今日の復習をしておきましょう。";
    } else {
        message = "こんばんは！遅くまでお疲れ様です。無理せず休みましょう。";
    }

    if (greetingEl) greetingEl.textContent = message;
}

// Clock & Date
function initializeClock() {
    function update() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ja-JP', { hour12: false });
        const dateStr = now.toLocaleDateString('ja-JP', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'short' 
        });

        document.getElementById('current-time').textContent = timeStr;
        document.getElementById('current-date').textContent = dateStr;
        
        checkCurrentClass(now);
    }
    setInterval(update, 1000);
    update();
}

// Schedule Logic
let scheduleData = null;

async function loadScheduleData() {
    // 実際にはfetch()等を使うが、ここでは埋め込みデータを想定
    // data.jsonの内容を使用
    if(typeof jsonData !== 'undefined') {
        scheduleData = jsonData;
    } else {
        // Fallback for demo if data.json script not loaded first
        try {
            const response = await fetch('data.json');
            scheduleData = await response.json();
        } catch (e) {
            console.error("Data load failed", e);
            return;
        }
    }
    renderSchedule();
    updateTestCountdown();
}

function renderSchedule() {
    if (!scheduleData) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const dayKey = days[now.getDay()];
    const dayName = now.toLocaleDateString('ja-JP', { weekday: 'long' });

    document.getElementById('schedule-day').textContent = dayName;
    const listEl = document.getElementById('schedule-list');
    listEl.innerHTML = '';

    const classSchedule = scheduleData.schedules[currentClass];
    
    if (!classSchedule || !classSchedule[dayKey]) {
        listEl.innerHTML = '<div class="empty-state">本日は授業がありません</div>';
        document.getElementById('next-subject').textContent = '授業なし';
        return;
    }

    const todaysSubjects = classSchedule[dayKey];
    const times = scheduleData.timeSettings;

    todaysSubjects.forEach((subject, index) => {
        const periodInfo = times[index];
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <div class="period-badge">${periodInfo.period}</div>
            <div class="subject-info">
                <span class="subject-name">${subject}</span>
                <span class="subject-time">${periodInfo.start} - ${periodInfo.end}</span>
            </div>
        `;
        listEl.appendChild(item);
    });
}

function checkCurrentClass(now) {
    if (!scheduleData) return;
    
    // Simplified logic to find current/next class
    // In a real app, compare HH:MM strings to current time
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayKey = days[now.getDay()];
    const classSchedule = scheduleData.schedules[currentClass];
    
    if (!classSchedule || !classSchedule[dayKey]) return;

    // Demo: Just find first class not started or currently active
    // This is a simplified display logic
    const timeSettings = scheduleData.timeSettings;
    const currentHM = now.getHours() * 60 + now.getMinutes();

    let foundNext = false;

    // Reset styles
    document.querySelectorAll('.schedule-item').forEach(el => {
        el.classList.remove('active');
        const badge = el.querySelector('.now-badge');
        if(badge) badge.remove();
    });

    timeSettings.forEach((period, idx) => {
        const [sh, sm] = period.start.split(':').map(Number);
        const [eh, em] = period.end.split(':').map(Number);
        const startVal = sh * 60 + sm;
        const endVal = eh * 60 + em;

        if (currentHM >= startVal && currentHM <= endVal) {
            // Active Class
            const items = document.querySelectorAll('.schedule-item');
            if(items[idx]) {
                items[idx].classList.add('active');
                items[idx].querySelector('.subject-info').innerHTML += '<span class="now-badge">現在</span>';
            }
            document.getElementById('next-subject').textContent = classSchedule[dayKey][idx];
            document.getElementById('next-period').textContent = `${period.period}限目 (現在)`;
            document.getElementById('time-remaining').textContent = `終了まで ${endVal - currentHM}分`;
            foundNext = true;
        } else if (!foundNext && currentHM < startVal) {
            // Next Class
            document.getElementById('next-subject').textContent = classSchedule[dayKey][idx];
            document.getElementById('next-period').textContent = `${period.period}限目 (${period.start}~)`;
            document.getElementById('time-remaining').textContent = `あと ${startVal - currentHM}分`;
            foundNext = true;
        }
    });

    if (!foundNext) {
        document.getElementById('next-subject').textContent = '本日の授業終了';
        document.getElementById('next-period').textContent = '';
        document.getElementById('time-remaining').textContent = '';
    }
}

// Test Countdown
function updateTestCountdown() {
    if(!scheduleData || !scheduleData.tests) return;
    
    // Sort tests by date
    const futureTests = scheduleData.tests
        .map(t => ({...t, dateObj: new Date(t.date)}))
        .filter(t => t.dateObj > new Date())
        .sort((a,b) => a.dateObj - b.dateObj);

    const container = document.getElementById('test-card');
    const nameEl = document.getElementById('test-name');
    const countEl = document.getElementById('test-countdown');

    if (futureTests.length > 0) {
        const nextTest = futureTests[0];
        nameEl.textContent = nextTest.name;
        
        const diff = nextTest.dateObj - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        countEl.textContent = `あと ${days} 日`;
    } else {
        nameEl.textContent = "予定されているテストはありません";
        countEl.textContent = "";
        container.style.background = "linear-gradient(135deg, #9ca3af, #6b7280)";
    }
}

// 4. Pomodoro Timer with Progress Bar
function initializePomodoro() {
    const display = document.getElementById('pomodoro-timer');
    const status = document.getElementById('timer-status');
    const toggleBtn = document.getElementById('timer-toggle');
    const resetBtn = document.getElementById('timer-reset');
    const bar = document.getElementById('timer-bar');

    function updateDisplay() {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        display.textContent = `${m}:${s}`;
        
        // Update Bar Width
        const percentage = (timeLeft / totalTime) * 100;
        bar.style.width = `${percentage}%`;
    }

    toggleBtn.addEventListener('click', () => {
        if (isTimerRunning) {
            clearInterval(timerInterval);
            toggleBtn.innerHTML = '<i class="fas fa-play"></i> 再開';
            isTimerRunning = false;
        } else {
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    toggleBtn.innerHTML = '<i class="fas fa-play"></i> 開始';
                    status.textContent = "休憩しましょう！";
                    alert("時間です！");
                }
            }, 1000);
            toggleBtn.innerHTML = '<i class="fas fa-pause"></i> 一時停止';
            isTimerRunning = true;
        }
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timeLeft = 25 * 60;
        totalTime = 25 * 60; // Reset total for calculation
        updateDisplay();
        toggleBtn.innerHTML = '<i class="fas fa-play"></i> 開始';
        status.textContent = "25分集中";
        bar.style.width = '100%';
    });
}

// Todo List (Simple implementation)
function initializeTodo() {
    const input = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-todo');
    const list = document.getElementById('todo-list');
    const countEl = document.getElementById('todo-count');
    
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    function renderTodos() {
        list.innerHTML = '';
        if (todos.length === 0) {
            list.innerHTML = '<li class="empty-state">タスクがありません</li>';
            countEl.textContent = '0/0 完了';
            return;
        }

        let completed = 0;
        todos.forEach((todo, index) => {
            if(todo.done) completed++;
            const li = document.createElement('li');
            li.className = `todo-item ${todo.done ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.done ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <i class="fas fa-trash delete-todo"></i>
            `;
            
            li.querySelector('.todo-checkbox').addEventListener('change', () => {
                todos[index].done = !todos[index].done;
                saveTodos();
            });

            li.querySelector('.delete-todo').addEventListener('click', () => {
                todos.splice(index, 1);
                saveTodos();
            });

            list.appendChild(li);
        });
        
        countEl.textContent = `${completed}/${todos.length} 完了`;
    }

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    }

    addBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {
            todos.push({ text, done: false });
            input.value = '';
            saveTodos();
        }
    });

    renderTodos();
}
