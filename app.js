/**
 * Logic Master v7.0 Engine
 * Progress-based System Patch Learning
 */

let allData = [];
let currentIndex = 0; // JSON 배열의 인덱스 (0-49)

const elements = {
    categoryBadge: document.getElementById('categoryBadge'),
    currentIndex: document.getElementById('currentIndex'),
    totalCount: document.getElementById('totalCount'),
    beforeText: document.getElementById('beforeText'),
    guideText: document.getElementById('guideText'),
    quizSentence: document.getElementById('quizSentence'),
    optionsGrid: document.getElementById('optionsGrid'),
    feedbackOverlay: document.getElementById('feedbackOverlay'),
    afterText: document.getElementById('afterText'),
    resultIpa: document.getElementById('resultIpa'),
    nextBtn: document.getElementById('nextBtn'),
    mainCard: document.querySelector('.main-card')
};

// 1. 초기 데이터 로드
async function init() {
    try {
        const res = await fetch('target.json');
        allData = await res.json();
        
        // 로컬스토리지에서 이진 진행 정보 로드 (저장된 ID가 없으면 1번부터)
        const savedId = localStorage.getItem('lastLogicId');
        if (savedId) {
            currentIndex = allData.findIndex(item => item.id == savedId);
            // 만약 찾지 못하거나 범위를 벗어나면 0으로 초기화
            if (currentIndex === -1) currentIndex = 0;
        }

        renderQuiz();
    } catch (err) {
        console.error("Critical: Data Load Failed", err);
    }
}

// 2. 퀴즈 렌더링 루틴
function renderQuiz() {
    const item = allData[currentIndex];
    if (!item) return;

    // UI 텍스트 업데이트
    elements.categoryBadge.textContent = `SYSTEM SCAN: ${item.category}`;
    elements.currentIndex.textContent = currentIndex + 1;
    elements.totalCount.textContent = allData.length;
    
    elements.beforeText.textContent = item.logic_flow.before;
    elements.guideText.textContent = item.logic_flow.method_guide;
    
    // 빈칸 처리: answer가 들어갈 자리를 _____로 표시 (데이터에 이미 포함되어 있을 가능성 높지만 보장)
    elements.quizSentence.innerHTML = item.quiz.sentence.replace(/_{2,}/g, '<span style="color:var(--primary)">_____</span>');

    // 선택지 생성 (정답 + 오답 섞기)
    const options = [item.quiz.answer, ...item.quiz.distractors];
    shuffleArray(options);

    elements.optionsGrid.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `<span>${opt}</span> <small>PATCH_CMD</small>`;
        btn.onclick = () => checkAnswer(opt, item.quiz.answer);
        elements.optionsGrid.appendChild(btn);
    });

    // 메인 카드 애니메이션 초기화
    elements.mainCard.classList.remove('animate');
    void elements.mainCard.offsetWidth; // reflow
    elements.mainCard.classList.add('animate');
}

// 3. 정답 체크 및 로컬스토리지 저장
function checkAnswer(selected, correct) {
    const buttons = elements.optionsGrid.querySelectorAll('.option-btn');
    
    if (selected === correct) {
        // 정답 효과
        buttons.forEach(btn => {
            if (btn.innerText.includes(correct)) btn.classList.add('correct');
        });
        
        // 로컬스토리지에 현재 ID 저장 (이어서 공부하기용)
        localStorage.setItem('lastLogicId', allData[currentIndex].id);
        
        // 피드백 오버레이 표시
        setTimeout(() => {
            showFeedback();
        }, 600);
    } else {
        // 오답 효과
        buttons.forEach(btn => {
            if (btn.innerText.includes(selected)) btn.classList.add('wrong');
        });
        // 햅틱/에러 느낌의 흔들림 효과 추가 가능
    }
}

// 4. 결과 피드백 표시
function showFeedback() {
    const item = allData[currentIndex];
    elements.afterText.textContent = item.logic_flow.after;
    elements.resultIpa.textContent = item.ipa || '';
    elements.feedbackOverlay.style.display = 'flex';
}

// 5. 다음 문항 이동 또는 리셋
elements.nextBtn.addEventListener('click', () => {
    elements.feedbackOverlay.style.display = 'none';
    
    currentIndex++;
    
    // 마지막 번호까지 공부가 끝나면 다시 1번으로 복귀
    if (currentIndex >= allData.length) {
        currentIndex = 0;
        localStorage.setItem('lastLogicId', allData[0].id);
        alert("CONGRATULATIONS: All patches deployed. System Rebooting to Index 1.");
    }
    
    renderQuiz();
});

// 헬퍼: 배열 셔플
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 엔진 가동
init();
