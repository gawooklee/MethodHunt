/**
 * Logic Master v7.5 - 3-Layer Architecture
 * Layer 1: Console (Main)
 * Layer 2: Inspector (Detail Overlay)
 * Layer 3: Delta Visualizer (Result)
 */

let allData = [];
let currentIndex = 0;

const el = {
    // Console Layer
    layerConsole: document.getElementById('layerConsole'),
    categoryBadge: document.getElementById('categoryBadge'),
    scenarioSelect: document.getElementById('scenarioSelect'),
    currentIndex: document.getElementById('currentIndex'),
    totalCount: document.getElementById('totalCount'),
    consoleScenario: document.getElementById('consoleScenario'),
    consoleQuiz: document.getElementById('consoleQuiz'),
    optionsGrid: document.getElementById('optionsGrid'),
    actionFooter: document.getElementById('actionFooter'),
    btnInspect: document.getElementById('btnInspect'),
    btnDeploy: document.getElementById('btnDeploy'),
    
    // Inspector Layer
    layerInspector: document.getElementById('layerInspector'),
    btnCloseInspector: document.getElementById('btnCloseInspector'),
    inspectorMethod: document.getElementById('inspectorMethod'),
    inspectorIpa: document.getElementById('inspectorIpa'),
    inspectorNouns: document.getElementById('inspectorNouns'),
    inspectorAdjs: document.getElementById('inspectorAdjs'),
    inspectorTip: document.getElementById('inspectorTip'),

    // Delta Layer
    layerDelta: document.getElementById('layerDelta'),
    deltaBefore: document.getElementById('deltaBefore'),
    deltaCheck: document.getElementById('deltaCheck'),
    deltaAfter: document.getElementById('deltaAfter'),
    btnNext: document.getElementById('btnNext')
};

async function init() {
    try {
        const res = await fetch('LogicEngine_Data.json');
        allData = await res.json();
        
        // 로컬스토리지에서 진행률 복원
        const savedId = localStorage.getItem('lastLogicId');
        if (savedId) {
            currentIndex = allData.findIndex(item => item.id == savedId);
            if (currentIndex === -1) currentIndex = 0;
        }

        populateScenarioSelect();
        setupEventListeners();
        renderConsole();
    } catch (err) {
        console.error("Critical: Data Load Failed", err);
    }
}

function populateScenarioSelect() {
    el.scenarioSelect.innerHTML = '';
    allData.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${index + 1}. ${item.method}`;
        el.scenarioSelect.appendChild(option);
    });
    
    el.scenarioSelect.addEventListener('change', (e) => {
        currentIndex = parseInt(e.target.value, 10);
        localStorage.setItem('lastLogicId', allData[currentIndex].id);
        renderConsole();
    });
}

function setupEventListeners() {
    el.btnInspect.addEventListener('click', openInspector);
    el.btnCloseInspector.addEventListener('click', closeInspector);
    el.btnDeploy.addEventListener('click', transitionToDelta);
    el.btnNext.addEventListener('click', loadNextScenario);
}

function renderConsole() {
    const item = allData[currentIndex];
    if (!item) return;

    // Reset visibility state
    el.layerConsole.classList.remove('hidden');
    el.layerDelta.classList.add('hidden');
    closeInspector();
    
    el.optionsGrid.style.display = 'grid';
    el.actionFooter.classList.add('hidden');

    // Populate Console Text
    el.categoryBadge.textContent = `SYSTEM SCAN: ${item.category || item.layer || 'CORE'}`;
    if (el.scenarioSelect) el.scenarioSelect.value = currentIndex;
    if (el.currentIndex) el.currentIndex.textContent = currentIndex + 1;
    if (el.totalCount) el.totalCount.textContent = allData.length;
    
    el.consoleScenario.textContent = item.logic_flow.before;
    
    // Format Quiz Sentence (replace underscores with a span)
    const sentenceHtml = item.quiz.sentence.replace(
        /_{2,}/g, 
        '<span class="blank" id="quizBlank">_____</span>'
    );
    el.consoleQuiz.innerHTML = sentenceHtml;

    // Generate Options
    const options = [item.quiz.answer, ...item.quiz.distractors];
    shuffleArray(options);

    el.optionsGrid.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `<span>${opt}</span> <small>CMD</small>`;
        btn.onclick = () => handleOptionClick(btn, opt, item.quiz.answer);
        el.optionsGrid.appendChild(btn);
    });
}

function handleOptionClick(btn, selected, correct) {
    const allBtns = el.optionsGrid.querySelectorAll('.option-btn');
    
    if (selected === correct) {
        // Correct Action
        allBtns.forEach(b => {
            b.style.pointerEvents = 'none'; // disable clicks
            if (b.innerText.includes(correct)) {
                b.classList.add('correct');
            }
        });
        
        // Fill the blank
        const blank = document.getElementById('quizBlank');
        if (blank) {
            blank.textContent = correct;
            blank.classList.add('filled');
        }

        // Save Progress
        localStorage.setItem('lastLogicId', allData[currentIndex].id);
        
        // Show next actions
        setTimeout(() => {
            el.optionsGrid.style.display = 'none';
            el.actionFooter.classList.remove('hidden');
        }, 600);
        
    } else {
        // Wrong Action
        btn.classList.add('wrong');
        setTimeout(() => btn.classList.remove('wrong'), 400);
    }
}

function openInspector() {
    const item = allData[currentIndex];
    
    el.inspectorMethod.textContent = item.method;
    
    // Some data might not have IPA mapping
    if (item.ipa) {
        el.inspectorIpa.style.display = 'inline';
        el.inspectorIpa.textContent = item.ipa;
    } else {
        el.inspectorIpa.style.display = 'none';
    }
    
    el.inspectorNouns.innerHTML = (item.extensions && item.extensions.nouns && item.extensions.nouns.length > 0)
        ? item.extensions.nouns.map(n => `<span class="tag">${n.w} <small style="opacity:0.7">(${n.m})</small></span>`).join('')
        : '<span class="tag">N/A</span>';
        
    el.inspectorAdjs.innerHTML = (item.extensions && item.extensions.adjectives && item.extensions.adjectives.length > 0)
        ? item.extensions.adjectives.map(a => `<span class="tag">${a.w} <small style="opacity:0.7">(${a.m})</small></span>`).join('')
        : '<span class="tag">N/A</span>';
    
    el.inspectorTip.textContent = item.tip || "No specific tips for this scenario.";
    
    el.layerInspector.classList.add('open');
}

function closeInspector() {
    el.layerInspector.classList.remove('open');
}

function transitionToDelta() {
    const item = allData[currentIndex];
    
    closeInspector();
    
    // Populate Delta Layer
    el.deltaBefore.textContent = item.logic_flow.before;
    el.deltaCheck.textContent = item.delta_check ? item.delta_check.result : "State modified";
    el.deltaAfter.textContent = item.logic_flow.after;
    
    // Execute transition
    el.layerConsole.classList.add('hidden');
    
    // Small delay to make it feel natural
    setTimeout(() => {
        el.layerDelta.classList.remove('hidden');
    }, 200);
}

function loadNextScenario() {
    currentIndex++;
    if (currentIndex >= allData.length) {
        currentIndex = 0;
        localStorage.setItem('lastLogicId', allData[0].id);
        alert("CONGRATULATIONS: All patches deployed. System Rebooting to SCENARIO 1.");
    }
    renderConsole();
}

// Utility: Array Shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Start Engine
init();
