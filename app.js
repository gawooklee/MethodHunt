document.addEventListener('DOMContentLoaded', () => {
    let allEntries = [];
    let currentSet = [];
    let currentIndex = 0;
    let score = 0;
    let masteredIds = JSON.parse(localStorage.getItem('mastered_quizzes') || '[]');

    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const feedbackOverlay = document.getElementById('feedback-overlay');
    
    const masteredCountEl = document.getElementById('mastered-count');
    const totalCountEl = document.getElementById('total-count');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('quiz-progress-text');
    
    const scenarioEl = document.getElementById('scenario');
    const sentenceEl = document.getElementById('sentence');
    const translationEl = document.getElementById('translation');
    const logicBeforeQ = document.getElementById('logic-before-q');
    const logicAfterQ = document.getElementById('logic-after-q');
    const hintBox = document.getElementById('hint-box');
    const hintText = document.getElementById('hint-text');
    const optionsGrid = document.getElementById('options-grid');
    
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackTitle = document.getElementById('feedback-title');
    const reviewIpa = document.getElementById('review-ipa');
    const reviewPron = document.getElementById('review-pron');
    const logicBefore = document.getElementById('logic-before');
    const logicAfter = document.getElementById('logic-after');
    const logicDesc = document.getElementById('logic-desc');

    // Init
    async function init() {
        try {
            const response = await fetch('target.json');
            allEntries = await response.json();
            updateStats();
        } catch (err) {
            console.error('Failed to load target.json', err);
            sentenceEl.textContent = "Error: target.json missing";
        }
    }

    function updateStats() {
        masteredCountEl.textContent = masteredIds.length;
        totalCountEl.textContent = allEntries.length;
    }

    function startQuiz() {
        score = 0;
        currentIndex = 0;
        // Pick 10 random entries
        currentSet = [...allEntries].sort(() => 0.5 - Math.random()).slice(0, 10);
        
        startScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        
        showQuestion();
    }

    function showQuestion() {
        const entry = currentSet[currentIndex];
        
        // Reset UI
        hintBox.classList.add('hidden');
        
        // Show the 3-level comprehensive metadata
        scenarioEl.textContent = entry.scenario;
        sentenceEl.textContent = entry.quiz_sentence;
        translationEl.textContent = entry.question;
        hintText.textContent = entry.hint;
        
        // Update Logic Header
        logicBeforeQ.textContent = entry.delta.before;
        logicAfterQ.textContent = entry.delta.after;
        
        // Progress UI
        const progressPercent = ((currentIndex + 1) / currentSet.length) * 100;
        progressFill.style.width = `${progressPercent}%`;
        progressText.textContent = `${currentIndex + 1} / ${currentSet.length}`;
        
        // Generate Distractors
        const options = generateOptions(entry.correct_method);
        optionsGrid.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => handleAnswer(opt === entry.correct_method);
            optionsGrid.appendChild(btn);
        });
    }

    function generateOptions(correct) {
        const others = allEntries
            .map(e => e.correct_method)
            .filter(m => m !== correct);
        
        // Unique options
        const uniqueOthers = [...new Set(others)];
        const distractors = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, 3);
        return [correct, ...distractors].sort(() => 0.5 - Math.random());
    }

    function handleAnswer(isCorrect) {
        const entry = currentSet[currentIndex];
        if (isCorrect) score++;

        // Mark as mastered if correct
        if (isCorrect && !masteredIds.includes(entry.id)) {
            masteredIds.push(entry.id);
            localStorage.setItem('mastered_quizzes', JSON.stringify(masteredIds));
        }

        showFeedback(isCorrect, entry);
    }

    function showFeedback(isCorrect, entry) {
        feedbackIcon.className = `status-icon ${isCorrect ? 'status-correct' : 'status-wrong'}`;
        feedbackTitle.textContent = isCorrect ? 'Great Job!' : 'Keep Going!';
        feedbackTitle.style.color = isCorrect ? '#47c97e' : '#ff5f5f';
        
        reviewIpa.textContent = entry.ipa;
        reviewPron.textContent = entry.pronunciation;
        logicBefore.textContent = entry.delta.before;
        logicAfter.textContent = entry.delta.after;
        
        // Use logic_description for the feedback logic desc
        const completedSentence = entry.quiz_sentence.replace('_____', `[${entry.correct_method}]`).replace('______', `[${entry.correct_method}]`);
        logicDesc.innerHTML = `<p class="completed-sentence">"${completedSentence}"</p><hr>${entry.logic_description}`;
        
        feedbackOverlay.classList.remove('hidden');
    }

    function nextQuestion() {
        feedbackOverlay.classList.add('hidden');
        currentIndex++;
        
        if (currentIndex < currentSet.length) {
            showQuestion();
        } else {
            showResult();
        }
    }

    function showResult() {
        quizScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
        
        document.getElementById('result-stat').textContent = 
            `${currentSet.length}문제 중 ${score}문제를 맞혔습니다.`;
        
        updateStats();
    }

    // Event Listeners
    document.getElementById('start-btn').onclick = startQuiz;
    document.getElementById('restart-btn').onclick = startQuiz;
    document.getElementById('home-btn').onclick = () => {
        resultScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    };
    document.getElementById('exit-btn').onclick = () => {
        if (confirm('종료하시겠습니까? 진행 상황은 저장되지 않습니다.')) {
            quizScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
        }
    };
    document.getElementById('show-hint-btn').onclick = () => {
        hintBox.classList.remove('hidden');
    };
    document.getElementById('next-btn').onclick = nextQuestion;

    init();
});
