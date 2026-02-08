// --- 初期設定とデータ読み込み ---
document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
    initClock();
    initTodo();
    initPomodoro();
    updateCountdown();
    // 本来はdata.jsonをfetchするが、ここではモックとして動作
    renderSchedule(); 
});

// 1. 挨拶機能
function updateGreeting() {
    const hour = new Date().getHours();
    const msg = document.getElementById('greeting-message');
    if (hour >= 5 && hour < 11) msg.textContent = "おはようございます！今日も一日頑張りましょう。";
    else if (hour >= 11 && hour < 17) msg.textContent = "こんにちは！午後の授業も集中しましょう。";
    else msg.textContent = "こんばんは！今日もお疲れ様でした。";
}

// 2. 時計
function initClock() {
    const update = () => {
        const now = new Date();
        document.getElementById('clockTime').textContent = now.toLocaleTimeString('ja-JP');
        document.getElementById('clockDate').textContent = now.toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric', weekday:'short' });
    };
    setInterval(update, 1000);
    update();
}

// 3. ToDoリスト
function initTodo() {
    const input = document.getElementById('newTodo');
    const btn = document.getElementById('addTodoBtn');
    const list = document.getElementById('todoList');

    btn.onclick = () => {
        if (!input.value) return;
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.innerHTML = `<input type="checkbox"> <span>${input.value}</span>`;
        list.appendChild(li);
        input.value = '';
    };
}

// 4. カウントダウン (例: 2026年3月2日)
function updateCountdown() {
    const target = new Date('2026-03-02').getTime();
    const now = new Date().getTime();
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    document.getElementById('testTimer').textContent = `あと ${days} 日`;
}

// 5. ポモドーロ (簡易版)
function initPomodoro() {
    let timeLeft = 25 * 60;
    let timerId = null;
    const btn = document.getElementById('pomoBtn');
    const bar = document.getElementById('timerBar');

    btn.onclick = () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            btn.textContent = "開始";
        } else {
            btn.textContent = "停止";
            timerId = setInterval(() => {
                timeLeft--;
                const m = Math.floor(timeLeft / 60);
                const s = timeLeft % 60;
                document.getElementById('pomoTimer').textContent = `${m}:${s.toString().padStart(2,'0')}`;
                bar.style.width = (timeLeft / (25*60) * 100) + "%";
            }, 1000);
        }
    };
}

function renderSchedule() {
    const list = document.getElementById('scheduleList');
    const subjects = ["数学", "論理国語", "古典探求", "物理", "体育", "化学", "LHR"];
    document.getElementById('scheduleDay').textContent = "月曜日";
    list.innerHTML = subjects.map((s, i) => `<li class="schedule-item"><span>${i+1}限</span><strong>${s}</strong></li>`).join('');
}
