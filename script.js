// --- 3. 時間帯に合わせた挨拶 ---
function updateGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.getElementById('greeting-message');
    let message = "今日も頑張りましょう！";

    if (hour >= 5 && hour < 11) message = "おはようございます！今日も一日頑張りましょう。";
    else if (hour >= 11 && hour < 17) message = "こんにちは！午後の授業も集中して取り組みましょう。";
    else if (hour >= 17 && hour < 22) message = "こんばんは！今日の復習は終わりましたか？";
    else message = "遅くまでお疲れ様です。無理せず早めに休みましょうね。";

    greetingEl.textContent = message;
}

// --- 時計 ---
function initClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clockTime').textContent = now.toLocaleTimeString('ja-JP');
        document.getElementById('clockDate').textContent = now.toLocaleDateString('ja-JP');
    }, 1000);
}

// --- 4. ポモドーロタイマー（バー連動） ---
let timer;
let timeLeft = 25 * 60;
const totalTime = 25 * 60;
let isRunning = false;

function initPomodoro() {
    const btn = document.getElementById('pomoBtn');
    const display = document.getElementById('pomoTimer');
    const bar = document.getElementById('timerBar');

    btn.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(timer);
            btn.innerHTML = '<i class="fas fa-play"></i> 開始';
        } else {
            timer = setInterval(() => {
                timeLeft--;
                const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                const s = (timeLeft % 60).toString().padStart(2, '0');
                display.textContent = `${m}:${s}`;
                
                // バーの長さを更新
                bar.style.width = (timeLeft / totalTime * 100) + "%";

                if (timeLeft <= 0) {
                    clearInterval(timer);
                    alert("お疲れ様でした！休憩しましょう。");
                }
            }, 1000);
            btn.innerHTML = '<i class="fas fa-pause"></i> 一時停止';
        }
        isRunning = !isRunning;
    });
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
    initClock();
    initPomodoro();
    // 挨拶を1時間ごとに更新
    setInterval(updateGreeting, 3600000);
});
