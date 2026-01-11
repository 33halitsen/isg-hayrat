let questions = [];
let answers = {};
let currentIndex = 0;
let activeIndexes = [];
let correctClicked = false;
let correctShown = false;
let isChallengeMode = false;
let answeredCurrentQuestion = false;
let currentFontSize = 100;
let selectedTerm = null;
let currentStudyMode = 'all';
let questionStatusMap = {};
let stats = { correct: 0, wrong: 0, empty: 0, combo: 0, maxCombo: 0 };
let __ = false;
const _ = 817496384;

// --- Yardım Modalı ---
function showHelpModal() { document.getElementById('helpModal').style.display = 'flex'; }
function closeHelpModal() { document.getElementById('helpModal').style.display = 'none'; }

function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const icon = document.getElementById('themeIcon');
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const icon = document.getElementById('themeIcon');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    document.documentElement.removeAttribute('data-theme');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

async function verifyInput(input) {
  const hash = await hashString(input);
  return hash === _;
}

__1 = false;
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

window._$ = async function () {
  const v = prompt("Enter verification:");
  if (v && simpleHash(v) === _) {
    __1 = true;
    $();
  }
};

function $() {
  if (__1) {
    __ = true;
    console.log("[Dev tools active]");
    if (questions.length) showQuestion();
  }
}

const TERM1_URL = 'questions/questions1.txt';
const TERM1_ANSWERS_URL = 'questions/answers1.txt';
const TERM2_URL = 'questions/questions2.txt';
const TERM2_ANSWERS_URL = 'questions/answers2.txt';

document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  if (!document.getElementById('questionText') || !document.getElementById('options')) {
    showError("Sistem hatası: Sayfa düzgün yüklenemedi");
    return;
  }

  document.getElementById('selectTerm1').addEventListener('click', () => selectTerm(1));
  document.getElementById('selectTerm2').addEventListener('click', () => selectTerm(2));
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);

  document.getElementById('shuffleStart').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('shuffleEnd').focus(); }
  });

  document.getElementById('shuffleEnd').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); shuffleQuestions(); }
  });

  document.getElementById('gotoQuestion').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); goToQuestion(); }
  });

  const navOptions = document.getElementById('navOptions');
  navOptions.style.maxHeight = navOptions.scrollHeight + 'px';

  loadAllSettings();

  let ___ = 0, ____ = null;
  const _toggle = toggleNavOptions;
  toggleNavOptions = function () {
    _toggle.apply(this, arguments);
    clearTimeout(____);
    if (++___ >= 7) { ___ = 0; _$(); }
    ____ = setTimeout(() => ___ = 0, 500);
  };

  addEventListener('keydown', e => {
    if (e.shiftKey && e.ctrlKey && e.key === 'V') _$();
  });
});

function updateTermBasedUI() {
  const quickGotoContainer = document.querySelector('.quick-goto-buttons');
  const quickRangeContainer = document.querySelector('.quick-range-buttons');

  if (selectedTerm == 1) {
    quickGotoContainer.innerHTML = `
      <button onclick="quickGoTo(1)">1</button>
      <button onclick="quickGoTo(250)">250</button>
      <button onclick="quickGoTo(500)">500</button>
    `;
    quickRangeContainer.innerHTML = `
      <button onclick="setRange(1, 500)">1-500</button>
      <button onclick="setRange(500, 800)">500-800</button>
      <button onclick="setRange(1, 800)">1-800</button>
    `;
  } else if (selectedTerm == 2) {
    quickGotoContainer.innerHTML = `
      <button onclick="quickGoTo(501)">501</button>
      <button onclick="quickGoTo(750)">750</button>
      <button onclick="quickGoTo(1000)">1000</button>
    `;
    quickRangeContainer.innerHTML = `
      <button onclick="setRange(500, 1000)">500-1000</button>
      <button onclick="setRange(1000, 1200)">1000-1200</button>
      <button onclick="setRange(500, 1200)">500-1200</button>
    `;
  }
}

// --- AYAR VE DATA YÖNETİMİ ---

function loadAllSettings() {
  const savedShuffleMode = localStorage.getItem('shuffleMode') === 'true';
  const savedChallengeMode = localStorage.getItem('challengeMode') === 'true';

  if (savedShuffleMode) {
    document.getElementById('shuffleMode').checked = true;
    document.getElementById('shuffleInputs').style.display = 'block';
    document.getElementById('gotoContainer').style.display = 'none';

    const savedStart = localStorage.getItem('shuffleStart');
    const savedEnd = localStorage.getItem('shuffleEnd');
    if (savedStart) document.getElementById('shuffleStart').value = savedStart;
    if (savedEnd) document.getElementById('shuffleEnd').value = savedEnd;
  }

  if (savedChallengeMode) {
    document.getElementById('challengeMode').checked = true;
    isChallengeMode = true;
    document.getElementById('stats').style.display = 'flex';
    document.getElementById('showCorrectContainer').style.display = 'none';
  }

  if (localStorage.getItem('showCorrectAlways') === 'true') {
    document.getElementById('showCorrectAlways').checked = true;
  }

  const savedFontSize = localStorage.getItem('fontSize');
  if (savedFontSize) {
    currentFontSize = parseInt(savedFontSize);
    applyFontSize();
  }

  const savedStudyMode = localStorage.getItem('studyMode');
  if (savedStudyMode) {
    currentStudyMode = savedStudyMode;
  }
  updateStudyModeVisuals();
  updateResetButtonVisibility();

  const savedTerm = localStorage.getItem('selectedTerm');
  if (savedTerm) {
    selectedTerm = savedTerm;
    updateTermBasedUI();
    loadData().catch(error => {
      showError("Sorular yüklenirken hata oluştu: " + error.message);
    });
  } else {
    showModal();
  }
}

function loadQuestionStatus() {
  const key = `questionStatus_Term${selectedTerm}`;
  const data = localStorage.getItem(key);
  questionStatusMap = data ? JSON.parse(data) : {};
}

function saveQuestionStatus() {
  const key = `questionStatus_Term${selectedTerm}`;
  localStorage.setItem(key, JSON.stringify(questionStatusMap));
}

function getQuestionStatus(id) {
  return questionStatusMap[id] || 0;
}

function setQuestionStatus(status) {
  if (activeIndexes.length === 0) return;
  const q = questions[activeIndexes[currentIndex]];
  questionStatusMap[q.id] = status;
  saveQuestionStatus();
  updateStatusButtons(status);
}

function updateStatusButtons(status) {
  const btns = document.querySelectorAll('.status-btn');
  btns.forEach(b => b.classList.remove('active'));

  if (status === 0) document.querySelector('.btn-unknown').classList.add('active');
  if (status === 1) document.querySelector('.btn-review').classList.add('active');
  if (status === 2) document.querySelector('.btn-master').classList.add('active');
}

// --- GÖRSEL VE MOD GÜNCELLEMELERİ ---

function updateStudyModeVisuals() {
  document.querySelectorAll('.mode-select-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const activeBtn = document.getElementById(`btn-mode-${currentStudyMode}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

function updateResetButtonVisibility() {
  const btn = document.getElementById('resetListBtn');
  if (currentStudyMode === 'all') {
    btn.style.display = 'none';
  } else {
    btn.style.display = 'block';
    let text = "Listeyi Temizle";
    if (currentStudyMode === 'review') text = "Tekrar Listesini Boşalt";
    if (currentStudyMode === 'mastered') text = "Öğrenilenleri Sıfırla (Geri Al)";
    if (currentStudyMode === 'learning') text = "Tüm İlerlemeyi Sıfırla!";
    btn.innerHTML = `<i class="fas fa-trash-alt"></i> ${text}`;
  }
}

function resetCurrentList() {
  let confirmMsg = "Bu işlem geri alınamaz. Emin misiniz?";

  if (currentStudyMode === 'review') confirmMsg = "Tekrar listenizdeki tüm sorular 'Bilmiyorum' olarak işaretlenecek ve listeden çıkarılacak. Emin misiniz?";
  if (currentStudyMode === 'mastered') confirmMsg = "Öğrenilenler arşiviniz boşaltılacak ve sorular havuza geri dönecek. Emin misiniz?";
  if (currentStudyMode === 'learning') confirmMsg = "DİKKAT: Tüm çalışma ilerlemeniz (Öğrenilenler ve Tekrar dahil) silinecek! Her şeye sıfırdan başlayacaksınız. Emin misiniz?";

  if (!confirm(confirmMsg)) return;

  const keys = Object.keys(questionStatusMap);
  let changed = false;

  keys.forEach(id => {
    const status = questionStatusMap[id];

    if (currentStudyMode === 'learning') {
      delete questionStatusMap[id];
      changed = true;
    } else if (currentStudyMode === 'review' && status === 1) {
      questionStatusMap[id] = 0;
      changed = true;
    } else if (currentStudyMode === 'mastered' && status === 2) {
      questionStatusMap[id] = 0;
      changed = true;
    }
  });

  if (changed) {
    saveQuestionStatus();
    alert("Liste başarıyla temizlendi.");
    generateActiveList(true);
  } else {
    alert("Listede silinecek veri bulunamadı.");
  }
}

function changeStudyMode(newMode) {
  saveCurrentPosition();
  currentStudyMode = newMode;
  localStorage.setItem('studyMode', currentStudyMode);
  updateStudyModeVisuals();
  updateResetButtonVisibility();
  generateActiveList(true);
}

function generateActiveList(resetToSavedPosition = false) {
  let filtered = [];
  questions.forEach((q, index) => {
    const status = getQuestionStatus(q.id);
    let include = false;

    switch (currentStudyMode) {
      case 'all': include = true; break;
      case 'learning': include = (status === 0); break; // SADECE 0. SARI VE YEŞİL YOK.
      case 'review': include = (status === 1); break;
      case 'mastered': include = (status === 2); break;
    }

    if (include) {
      if (document.getElementById('shuffleMode').checked) {
        let start = parseFloat(document.getElementById('shuffleStart').value || (selectedTerm == 1 ? 1 : 500));
        let end = parseFloat(document.getElementById('shuffleEnd').value || (selectedTerm == 1 ? 800 : 1200));
        let qNum = parseFloat(q.num.split('-')[0]);
        if (qNum >= start && qNum <= end) {
          filtered.push(index);
        }
      } else {
        filtered.push(index);
      }
    }
  });

  if (document.getElementById('shuffleMode').checked) {
    activeIndexes = filtered.sort(() => Math.random() - 0.5);
  } else {
    activeIndexes = filtered.sort((a, b) => a - b);
  }

  if (activeIndexes.length === 0) {
    currentIndex = 0;
    showQuestion();
    return;
  }

  if (resetToSavedPosition) {
    loadSavedPosition();
  } else {
    currentIndex = 0;
  }
  showQuestion();
}

function saveCurrentPosition() {
  const key = `pos_Term${selectedTerm}_${currentStudyMode}_${document.getElementById('shuffleMode').checked ? 'shuffled' : 'ordered'}`;
  localStorage.setItem(key, currentIndex.toString());
}

function loadSavedPosition() {
  const key = `pos_Term${selectedTerm}_${currentStudyMode}_${document.getElementById('shuffleMode').checked ? 'shuffled' : 'ordered'}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    currentIndex = parseInt(saved);
    if (currentIndex >= activeIndexes.length) currentIndex = 0;
  } else {
    currentIndex = 0;
  }
}

function saveAllSettings() {
  saveCurrentPosition();
  localStorage.setItem('showCorrectAlways', document.getElementById('showCorrectAlways').checked.toString());
  localStorage.setItem('challengeMode', isChallengeMode.toString());
  localStorage.setItem('shuffleMode', document.getElementById('shuffleMode').checked.toString());
  localStorage.setItem('fontSize', currentFontSize.toString());
  localStorage.setItem('stats', JSON.stringify(stats));

  localStorage.setItem('shuffleStart', document.getElementById('shuffleStart').value);
  localStorage.setItem('shuffleEnd', document.getElementById('shuffleEnd').value);
}

async function loadData() {
  try {
    document.getElementById('questionText').innerText = "Sorular yükleniyor...";

    let questionsUrl = selectedTerm == 1 ? TERM1_URL : TERM2_URL;
    let answersUrl = selectedTerm == 1 ? TERM1_ANSWERS_URL : TERM2_ANSWERS_URL;

    const [questionsResponse, answersResponse] = await Promise.all([
      fetch(questionsUrl),
      fetch(answersUrl)
    ]);

    if (!questionsResponse.ok) throw new Error("Sorular dosyası bulunamadı (404)");
    if (!answersResponse.ok) throw new Error("Cevaplar dosyası bulunamadı (404)");

    const questionsText = await questionsResponse.text();
    const answersText = await answersResponse.text();

    questions = parseFullBlocks(questionsText);
    answers = parseAnswers(answersText);

    if (questions.length === 0) throw new Error("Dosyada hiç soru bulunamadı");

    const savedStats = localStorage.getItem('stats');
    if (savedStats) stats = JSON.parse(savedStats);
    updateStats();

    loadQuestionStatus();
    generateActiveList(true);

  } catch (error) {
    showError(`Yükleme hatası: ${error.message}`);
    throw error;
  }
}

function parseAnswers(text) {
  const parts = text.match(/\d+(-\d+)?\s+[A-D](-[A-D])?/g) || [];
  const answers = {};
  parts.forEach(part => {
    const [rawNum, val] = part.split(/\s+/);
    if (val.includes('-')) {
      const subAnswers = val.split('-');
      subAnswers.forEach((ans, i) => {
        answers[`${rawNum.split('-')[0]}-${i + 1}`] = [ans];
      });
    } else {
      answers[rawNum] = [val];
    }
  });
  return answers;
}

function parseFullBlocks(text) {
  const lines = text.split(/\r?\n/);
  let blocks = [];
  let buffer = [];
  for (let line of lines) {
    buffer.push(line);
    if (/^d\./i.test(line.trim())) {
      blocks.push([...buffer]);
      buffer = [];
    }
  }
  return blocks.map(block => {
    const fullText = block.join('\n');
    const numMatch = fullText.match(/(\d+(-\d+)?)/);
    if (!numMatch) return null;
    const num = numMatch[1];
    const opts = block.filter(l => /^[a-d]\./i.test(l.trim())).map(l => l.replace(/^[a-d]\./i, '').trim());
    const text = block.filter(l => !/^[a-d]\./i.test(l.trim())).join('\n').replace(/^(\d+(-\d+)?\.)/, '').trim();
    return { id: num, num, text, options: opts };
  }).filter(q => q && q.options.length === 4);
}

function toggleCorrectImmediately() {
  const isChecked = document.getElementById('showCorrectAlways').checked;
  localStorage.setItem('showCorrectAlways', isChecked.toString());
  if (questions.length > 0) showQuestion();
}

function toggleChallengeMode() {
  isChallengeMode = document.getElementById('challengeMode').checked;
  localStorage.setItem('challengeMode', isChallengeMode.toString());
  document.getElementById('stats').style.display = isChallengeMode ? 'flex' : 'none';
  document.getElementById('showCorrectContainer').style.display = isChallengeMode ? 'none' : 'block';
  if (questions.length > 0) showQuestion();
}

function showQuestion() {
  answeredCurrentQuestion = false;
  correctClicked = false;
  correctShown = false;

  if (activeIndexes.length === 0) {
    document.getElementById('questionText').innerText = "Bu filtrede soru bulunamadı! Lütfen modu değiştirin veya filtreleri sıfırlayın.";
    document.getElementById('options').innerHTML = "";
    document.getElementById('statusActions').style.display = 'none';
    document.getElementById('progress').innerText = "0 / 0";
    return;
  }

  document.getElementById('statusActions').style.display = 'flex';

  const qIndex = activeIndexes[currentIndex];
  const q = questions[qIndex];

  const status = getQuestionStatus(q.id);
  updateStatusButtons(status);

  let statusText = "";
  if (status === 1) statusText = " (Tekrar)";
  if (status === 2) statusText = " (Öğrenildi)";

  document.getElementById('questionText').innerText = `${q.num}. ${q.text}${statusText}`;
  document.getElementById('questionText').style.fontSize = `${currentFontSize}%`;

  const opts = document.getElementById('options');
  opts.innerHTML = '';

  ['A', 'B', 'C', 'D'].forEach((letter, i) => {
    const btn = document.createElement('button');
    btn.innerText = `${letter}) ${q.options[i]}`;
    btn.onclick = () => handleAnswer(q.id, letter, btn);
    btn.dataset.letter = letter;
    btn.style.fontSize = `${currentFontSize}%`;
    opts.appendChild(btn);
  });

  if ((document.getElementById('showCorrectAlways').checked && !isChallengeMode) || (isChallengeMode && __)) {
    highlightCorrect(q.id);
    correctShown = true;
  }

  updateProgress();
  updateStats();
  saveAllSettings();
}

function handleAnswer(id, chosen, btn) {
  answeredCurrentQuestion = true;
  const correctArray = answers[id];
  const allButtons = document.querySelectorAll('#options button');

  if (!correctArray) return;

  if (isChallengeMode && btn.classList.contains('locked')) {
    if (correctArray.includes(chosen)) nextQuestion();
    return;
  }

  if (correctArray.includes(chosen)) {
    if (isChallengeMode) {
      stats.correct++; stats.combo++;
      if (stats.combo > stats.maxCombo) stats.maxCombo = stats.combo;
      allButtons.forEach(b => {
        b.classList.add('locked');
        if (correctArray.includes(b.dataset.letter)) b.classList.add('correct');
      });
    } else {
      if (correctShown || correctClicked) {
        nextQuestion();
        return;
      }
      correctClicked = true;
      allButtons.forEach(b => b.classList.remove('wrong'));
      btn.classList.add('correct');
    }
  } else {
    if (isChallengeMode) {
      stats.wrong++; stats.combo = 0;
      allButtons.forEach(b => {
        b.classList.add('locked');
        if (correctArray.includes(b.dataset.letter)) b.classList.add('correct');
      });
      btn.classList.add('wrong');
    } else {
      allButtons.forEach(b => b.classList.remove('wrong'));
      btn.classList.add('wrong');
      allButtons.forEach(b => {
        if (correctArray.includes(b.dataset.letter)) {
          b.classList.add('correct');
        }
      });
      correctShown = true;
    }
  }
  updateStats();
  saveAllSettings();
}

function highlightCorrect(id) {
  const correctArray = answers[id];
  document.querySelectorAll('#options button').forEach(btn => {
    if (correctArray.includes(btn.dataset.letter)) btn.classList.add('correct');
  });
}

function nextQuestion() {
  if (currentIndex < activeIndexes.length - 1) {
    if (!answeredCurrentQuestion && isChallengeMode) {
      stats.empty++; updateStats();
    }
    currentIndex++;
    showQuestion();
  } else {
    alert("Bu listedeki son soruya geldiniz.");
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    stats.combo = 0;
    currentIndex--;
    showQuestion();
    updateStats();
  }
}

function goToQuestion() {
  const num = document.getElementById('gotoQuestion').value.trim();
  const foundIndex = activeIndexes.findIndex(idx => questions[idx].num === num);

  if (foundIndex >= 0) {
    if (!answeredCurrentQuestion && isChallengeMode) stats.empty++;
    currentIndex = foundIndex;
    showQuestion();
    updateStats();
  } else {
    alert("Bu numara şu anki filtreleme modunda (veya aralığında) bulunamadı.");
  }
}

function quickGoTo(questionNum) {
  document.getElementById('gotoQuestion').value = questionNum;
  goToQuestion();
}

function setRange(start, end) {
  document.getElementById('shuffleStart').value = start;
  document.getElementById('shuffleEnd').value = end;
  shuffleQuestions();
}

function shuffleQuestions() {
  generateActiveList();
  adjustNavOptionsHeight();
  saveAllSettings();
}

function toggleShuffleInputs() {
  const checked = document.getElementById('shuffleMode').checked;
  document.getElementById('shuffleInputs').style.display = checked ? 'block' : 'none';
  document.getElementById('gotoContainer').style.display = checked ? 'none' : 'inline-block';
  generateActiveList();
  adjustNavOptionsHeight();
  saveAllSettings();
}

function adjustNavOptionsHeight() {
  const navOptions = document.getElementById('navOptions');
  if (navOptions.classList.contains('collapsed')) return;
  navOptions.style.maxHeight = navOptions.scrollHeight + 'px';
}

function updateProgress() {
  const total = activeIndexes.length;
  const index = currentIndex + 1;
  document.getElementById('progress').innerText = `Soru: ${index} / ${total} (${questions[activeIndexes[currentIndex]].num})`;
}

function updateStats() {
  document.getElementById('correctCount').textContent = stats.correct;
  document.getElementById('wrongCount').textContent = stats.wrong;
  document.getElementById('emptyCount').textContent = stats.empty;
  document.getElementById('comboCount').textContent = `${stats.combo}x`;
  document.getElementById('maxCombo').textContent = `${stats.maxCombo}x`;
}

function applyFontSize() {
  document.getElementById('questionText').style.fontSize = `${currentFontSize}%`;
  document.querySelectorAll('.options button').forEach(btn => {
    btn.style.fontSize = `${currentFontSize}%`;
  });
}

function adjustFontSize(change) {
  currentFontSize += change * 5;
  currentFontSize = Math.max(50, Math.min(150, currentFontSize));
  applyFontSize();
  saveAllSettings();
}

function resetFontSize() {
  currentFontSize = 100;
  applyFontSize();
  saveAllSettings();
}

function toggleNavOptions() {
  const navOptions = document.getElementById('navOptions');
  const icon = document.getElementById('navToggleIcon');
  navOptions.classList.toggle('collapsed');
  if (navOptions.classList.contains('collapsed')) {
    navOptions.style.maxHeight = '0';
    icon.classList.remove('fa-chevron-up');
    icon.classList.add('fa-chevron-down');
  } else {
    adjustNavOptionsHeight();
    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-chevron-up');
  }
}

function resetStats() {
  stats = { correct: 0, wrong: 0, empty: 0, combo: 0, maxCombo: 0 };
  updateStats();
  saveAllSettings();
}

function showModal() {
  const modal = document.getElementById('selectionModal');
  modal.style.display = 'flex';
  const closeBtn = document.getElementById('closeModalBtn');
  closeBtn.style.display = localStorage.getItem('selectedTerm') ? 'block' : 'none';
  if (selectedTerm) {
    document.getElementById(`selectTerm${selectedTerm}`).style.fontWeight = 'bold';
    document.getElementById(`selectTerm${selectedTerm}`).style.backgroundColor = '#e0e0e0';
  }
}

function closeModal() {
  document.getElementById('selectTerm1').style.fontWeight = '';
  document.getElementById('selectTerm1').style.backgroundColor = '';
  document.getElementById('selectTerm2').style.fontWeight = '';
  document.getElementById('selectTerm2').style.backgroundColor = '';
  document.getElementById('selectionModal').style.display = 'none';
}

function selectTerm(term) {
  currentIndex = 0;
  selectedTerm = term;
  localStorage.setItem('selectedTerm', term);
  closeModal();
  updateTermBasedUI();
  loadData().catch(error => showError("Hata: " + error.message));
}

function showTermSelection() { showModal(); }
function showError(message) {
  const questionBox = document.getElementById('questionBox');
  if (questionBox) questionBox.innerHTML = `<div class="error-message">${message}</div>`;
}
