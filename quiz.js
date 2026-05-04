// =============================================================
// quiz.js — NCWI Women in STEM Quiz
// =============================================================
// Calls the local Express server (server.js) for all questions.
// To run: make sure server.js is running with `node server.js`
// =============================================================

const API_BASE    = 'http://localhost:3000/api'
const TOTAL_QS    = 5
const LETTERS     = ['A', 'B', 'C', 'D']

// ─────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────
let currentIndex   = 0
let score          = 0
let answered       = false
let quizQuestions  = []
let currentDiff    = ''


// =============================================================
// SCREEN NAV
// =============================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById(id).classList.add('active')
}


// =============================================================
// START QUIZ
// Called when user clicks a difficulty card
// =============================================================
async function startQuiz(difficulty) {
  currentDiff  = difficulty
  currentIndex = 0
  score        = 0
  quizQuestions = []

  showScreen('screen-loading')

  try {
    quizQuestions = await loadQuestions(difficulty)
    showScreen('screen-quiz')
    renderQuestion()
  } catch (err) {
    alert('Failed to load questions. Make sure the server is running.')
    showScreen('screen-difficulty')
  }
}


// =============================================================
// LOAD QUESTIONS
// Picks 5 random endpoints for the chosen difficulty,
// fetches them all in parallel, and builds question objects
// =============================================================
async function loadQuestions(difficulty) {
  const pool    = shuffle([...QUESTION_POOLS[difficulty]])
  const selected = pool.slice(0, TOTAL_QS)
  const results  = await Promise.all(selected.map(fn => fn()))
  return results
}


// =============================================================
// QUESTION POOLS
// Each entry is an async function that hits one API endpoint
// and returns a question object ready for rendering
// =============================================================
const QUESTION_POOLS = {

  // ── EASY: True / False ─────────────────────────────────────
  easy: [
    async () => {
      const d = await get('/tf/countrybirth')
      const isTrue = coinFlip()
      return tfQuestion(
        `${d.firstName} ${d.lastName} was born in ${isTrue ? d.realValue : d.wrongValue}.`,
        isTrue
      )
    },
    async () => {
      const d = await get('/tf/fieldstudy')
      const isTrue = coinFlip()
      return tfQuestion(
        `${d.firstName} ${d.lastName} studied ${isTrue ? d.realValue : d.wrongValue}.`,
        isTrue
      )
    },
    async () => {
      const d = await get('/tf/innovationcategory')
      const isTrue = coinFlip()
      return tfQuestion(
        `${d.innovationName} falls under the ${isTrue ? d.realValue : d.wrongValue} category.`,
        isTrue
      )
    },
    async () => {
      const d = await get('/tf/birthyear')
      const isTrue = coinFlip()
      return tfQuestion(
        `${d.firstName} ${d.lastName} was born in ${isTrue ? d.realValue : d.wrongValue}.`,
        isTrue
      )
    },
    async () => {
      const d = await get('/tf/nationality')
      const isTrue = coinFlip()
      return tfQuestion(
        `${d.firstName} ${d.lastName} is ${isTrue ? d.realValue : d.wrongValue} by nationality.`,
        isTrue
      )
    }
  ],

  // ── MEDIUM: Multiple Choice ─────────────────────────────────
  medium: [
    async () => {
      const d = await get('/mc/fieldstudy')
      return mcQuestion(
        `What field did ${d.firstName} ${d.lastName} study?`,
        d.correctAnswer, d.distractors
      )
    },
    async () => {
      const d = await get('/mc/countrybirth')
      return mcQuestion(
        `Which country was ${d.firstName} ${d.lastName} born in?`,
        d.correctAnswer, d.distractors
      )
    },
    async () => {
      const d = await get('/mc/innovationcategory')
      return mcQuestion(
        `What category does ${d.innovationName} fall under?`,
        d.correctAnswer, d.distractors
      )
    },
    async () => {
      const d = await get('/mc/institution')
      return mcQuestion(
        `Which institution was ${d.firstName} ${d.lastName} associated with?`,
        d.correctAnswer, d.distractors
      )
    },
    async () => {
      const d = await get('/mc/birthyear')
      return mcQuestion(
        `In what year was ${d.firstName} ${d.lastName} born?`,
        d.correctAnswer, d.distractors
      )
    },
    async () => {
      const d = await get('/mc/nationality')
      return mcQuestion(
        `What is ${d.firstName} ${d.lastName}'s nationality?`,
        d.correctAnswer, d.distractors
      )
    },
    async () => {
      const d = await get('/mc/whoinvented')
      return mcQuestion(
        `Who invented ${d.innovationName}?`,
        d.correctAnswer, d.distractors
      )
    },
    async () => {
      const d = await get('/mc/whatdidsheinvent')
      return mcQuestion(
        `Which innovation did ${d.firstName} ${d.lastName} create?`,
        d.correctAnswer, d.distractors
      )
    },
    async () => {
      const d = await get('/mc/nationalitycontribution')
      return mcQuestion(
        `Which woman from ${d.nationality} made a contribution in ${d.category}?`,
        d.correctAnswer, d.distractors
      )
    },
    async () => {
      const d = await get('/mc/innovationcategoryjoin')
      return mcQuestion(
        `Which category did ${d.firstName} ${d.lastName}'s innovation fall under?`,
        d.correctAnswer, d.distractors
      )
    }
  ],

  // ── HARD: Fill in the Blank ─────────────────────────────────
  hard: [
    async () => {
      const d = await get('/fitb/countrybirth')
      return fitbQuestion(`${d.firstName} ${d.lastName} was born in _____.`, d.correctAnswer)
    },
    async () => {
      const d = await get('/fitb/fieldstudy')
      return fitbQuestion(`${d.firstName} ${d.lastName} studied _____.`, d.correctAnswer)
    },
    async () => {
      const d = await get('/fitb/birthyear')
      return fitbQuestion(`${d.firstName} ${d.lastName} was born in _____.`, d.correctAnswer)
    },
    async () => {
      const d = await get('/fitb/nationality')
      return fitbQuestion(`${d.firstName} ${d.lastName} is _____ by nationality.`, d.correctAnswer)
    },
    async () => {
      const d = await get('/fitb/institution')
      return fitbQuestion(`${d.firstName} ${d.lastName} was associated with _____.`, d.correctAnswer)
    },
    async () => {
      const d = await get('/fitb/whatdidsheinvent')
      return fitbQuestion(`${d.firstName} ${d.lastName} invented _____.`, d.correctAnswer)
    },
    async () => {
      const d = await get('/fitb/whoinvented')
      return fitbQuestion(`_____ invented ${d.innovationName}.`, d.correctAnswer)
    },
    async () => {
      const d = await get('/fitb/innovationcategory')
      return fitbQuestion(`${d.innovationName} falls under the _____ category.`, d.correctAnswer)
    },
    async () => {
      const d = await get('/fitb/coinventor')
      return fitbQuestion(`${d.innovationName} was co-invented with _____.`, d.correctAnswer)
    }
  ]
}


// =============================================================
// QUESTION OBJECT BUILDERS
// =============================================================
function tfQuestion(questionText, isTrue) {
  return { type: 'tf', questionText, correctAnswer: isTrue ? 'true' : 'false' }
}

function mcQuestion(questionText, correctAnswer, distractors) {
  const options = shuffle([correctAnswer, ...distractors.slice(0, 3)])
  return {
    type: 'mc',
    questionText,
    answers: options,
    correctAnswer,
    correctIndex: options.indexOf(correctAnswer)
  }
}

function fitbQuestion(questionText, correctAnswer) {
  return { type: 'fitb', questionText, correctAnswer }
}


// =============================================================
// RENDER QUESTION
// =============================================================
function renderQuestion() {
  answered = false

  const total = quizQuestions.length
  const q     = quizQuestions[currentIndex]

  document.getElementById('q-counter').textContent     = `Question ${currentIndex + 1} of ${total}`
  document.getElementById('score-display').textContent = `Score: ${score}`
  document.getElementById('progress-bar').style.width  = `${(currentIndex / total) * 100}%`
  document.getElementById('question-text').textContent = q.questionText
  document.getElementById('feedback-text').textContent = ''
  document.getElementById('feedback-text').className   = 'feedback-text'
  document.getElementById('next-btn').classList.remove('visible')

  // Hide all answer areas
  document.getElementById('answers-grid').style.display = 'none'
  document.getElementById('tf-grid').style.display      = 'none'
  document.getElementById('fitb-wrap').style.display    = 'none'

  if (q.type === 'mc') {
    document.getElementById('question-type-tag').textContent = 'Multiple Choice'
    renderMC(q)
  } else if (q.type === 'tf') {
    document.getElementById('question-type-tag').textContent = 'True or False'
    renderTF()
  } else if (q.type === 'fitb') {
    document.getElementById('question-type-tag').textContent = 'Fill in the Blank'
    renderFITB()
  }
}

function renderMC(q) {
  const grid = document.getElementById('answers-grid')
  grid.style.display = 'grid'
  grid.innerHTML = ''
  q.answers.forEach((ans, i) => {
    const btn = document.createElement('button')
    btn.className = 'answer-btn'
    btn.innerHTML = `<span class="letter">${LETTERS[i]}</span>${ans}`
    btn.onclick   = () => selectMC(i)
    grid.appendChild(btn)
  })
}

function renderTF() {
  document.getElementById('tf-grid').style.display = 'grid'
  const t = document.getElementById('tf-true')
  const f = document.getElementById('tf-false')
  t.className = 'tf-btn'; t.disabled = false
  f.className = 'tf-btn'; f.disabled = false
}

function renderFITB() {
  document.getElementById('fitb-wrap').style.display = 'flex'
  const input  = document.getElementById('fitb-input')
  const submit = document.getElementById('fitb-submit')
  input.value     = ''
  input.className = 'fitb-input'
  input.disabled  = false
  submit.disabled = false
  input.onkeydown = e => { if (e.key === 'Enter') submitFITB() }
  setTimeout(() => input.focus(), 50)
}


// =============================================================
// ANSWER HANDLERS
// =============================================================
function selectMC(index) {
  if (answered) return
  answered = true

  const q       = quizQuestions[currentIndex]
  const buttons = document.querySelectorAll('.answer-btn')
  buttons.forEach(b => b.disabled = true)

  if (index === q.correctIndex) {
    buttons[index].classList.add('correct')
    showFeedback(true)
    score++
  } else {
    buttons[index].classList.add('incorrect')
    buttons[q.correctIndex].classList.add('correct')
    showFeedback(false, q.correctAnswer)
  }

  finishAnswer()
}

function selectTF(userSaidTrue) {
  if (answered) return
  answered = true

  const q        = quizQuestions[currentIndex]
  const trueBtn  = document.getElementById('tf-true')
  const falseBtn = document.getElementById('tf-false')
  trueBtn.disabled = falseBtn.disabled = true

  const isCorrect   = (userSaidTrue && q.correctAnswer === 'true') ||
                      (!userSaidTrue && q.correctAnswer === 'false')
  const clickedBtn  = userSaidTrue ? trueBtn : falseBtn
  const correctBtn  = q.correctAnswer === 'true' ? trueBtn : falseBtn

  if (isCorrect) {
    clickedBtn.classList.add('correct')
    showFeedback(true)
    score++
  } else {
    clickedBtn.classList.add('incorrect')
    correctBtn.classList.add('correct')
    showFeedback(false, q.correctAnswer === 'true' ? 'True' : 'False')
  }

  finishAnswer()
}

function submitFITB() {
  if (answered) return
  answered = true

  const q      = quizQuestions[currentIndex]
  const input  = document.getElementById('fitb-input')
  const submit = document.getElementById('fitb-submit')
  input.disabled = submit.disabled = true

  const isCorrect = input.value.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()

  if (isCorrect) {
    input.classList.add('correct')
    showFeedback(true)
    score++
  } else {
    input.classList.add('incorrect')
    showFeedback(false, q.correctAnswer)
  }

  finishAnswer()
}


// =============================================================
// SHARED POST-ANSWER
// =============================================================
function finishAnswer() {
  document.getElementById('score-display').textContent = `Score: ${score}`
  document.getElementById('next-btn').classList.add('visible')
}

function showFeedback(isCorrect, correctAnswer = null) {
  const el = document.getElementById('feedback-text')
  if (isCorrect) {
    el.textContent = '✓ Correct!'
    el.className   = 'feedback-text correct'
  } else {
    el.textContent = correctAnswer ? `✗ Correct answer: ${correctAnswer}` : '✗ Incorrect'
    el.className   = 'feedback-text incorrect'
  }
}


// =============================================================
// NEXT QUESTION
// =============================================================
function nextQuestion() {
  currentIndex++
  if (currentIndex < quizQuestions.length) {
    renderQuestion()
  } else {
    showResults()
  }
}


// =============================================================
// RESULTS
// =============================================================
function showResults() {
  const total = quizQuestions.length
  const pct   = Math.round((score / total) * 100)

  document.getElementById('final-score').textContent = `${score}/${total}`
  document.getElementById('score-pct').textContent   = `${pct}% correct`

  let msg = ''
  if (pct === 100) msg = '🏆 Perfect score! You\'re a true champion of women in STEM.'
  else if (pct >= 80) msg = '🌟 Excellent! You clearly know your history.'
  else if (pct >= 60) msg = '🔬 Good effort! Keep exploring these incredible stories.'
  else if (pct >= 40) msg = '📚 Not bad — there\'s so much more to discover!'
  else msg = '🌱 A great start! These women\'s stories are worth knowing.'

  document.getElementById('result-msg').textContent    = msg
  document.getElementById('share-confirm').textContent = ''
  showScreen('screen-results')
}

function shareResults() {
  const total = quizQuestions.length
  const pct   = Math.round((score / total) * 100)
  copyToClipboard(
    `I scored ${score}/${total} (${pct}%) on the NCWI Women in STEM Quiz! 🏆 Test your knowledge at ncwi.org`,
    'share-confirm'
  )
}

function goHome() {
  showScreen('screen-difficulty')
}


// =============================================================
// UTILITIES
// =============================================================
async function get(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`)
  if (!res.ok) throw new Error(`API error on ${endpoint}`)
  return res.json()
}

function coinFlip() {
  return Math.random() > 0.5
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function copyToClipboard(text, confirmId) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      document.getElementById(confirmId).textContent = '✓ Copied to clipboard — ready to paste anywhere!'
    })
  } else {
    document.getElementById(confirmId).textContent = text
  }
}