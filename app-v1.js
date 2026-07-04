// Quiz Questions Database
const quizDatabase = [
    {
        question: "What is the capital of France?",
        type: "multiple",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
    },
    {
        question: "Is JavaScript a compiled language?",
        type: "truefalse",
        correct: false
    },
    {
        question: "What year was the internet invented?",
        type: "multiple",
        options: ["1969", "1983", "1991", "2000"],
        correct: 0
    },
    {
        question: "The Great Wall of China is visible from space.",
        type: "truefalse",
        correct: false
    },
    {
        question: "What is the smallest prime number?",
        type: "text",
        answer: "2"
    },
    {
        question: "Which planet is known as the Red Planet?",
        type: "multiple",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        question: "Python was named after a snake.",
        type: "truefalse",
        correct: false
    },
    {
        question: "What does HTML stand for?",
        type: "text",
        answer: "HyperText Markup Language"
    },
    {
        question: "Which of these is a programming language?",
        type: "multiple",
        options: ["HTML", "CSS", "JavaScript", "XML"],
        correct: 2
    },
    {
        question: "1 + 1 = 2",
        type: "truefalse",
        correct: true
    }
];

// Game State
let gameState = {
    currentQuestionIndex: 0,
    score: 0,
    difficulty: 'easy',
    answers: [],
    timePerQuestion: 10,
    timerInterval: null,
    timeRemaining: 10,
    answered: false
};

// Difficulty Settings
const difficultySettings = {
    easy: { timePerQuestion: 10, multiplier: 1 },
    medium: { timePerQuestion: 7, multiplier: 1.5 },
    hard: { timePerQuestion: 5, multiplier: 2 }
};

// Leaderboard
let leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard')) || [];

// Screen Management
function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenName).classList.add('active');
}

// Start Quiz
function startQuiz(difficulty) {
    gameState.difficulty = difficulty;
    gameState.currentQuestionIndex = 0;
    gameState.score = 0;
    gameState.answers = [];
    gameState.timePerQuestion = difficultySettings[difficulty].timePerQuestion;
    gameState.answered = false;

    document.getElementById('totalQuestions').textContent = quizDatabase.length;
    document.getElementById('difficultyIndicator').textContent = 
        difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    document.getElementById('finalDifficulty').textContent = 
        difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    switchScreen('quizScreen');
    loadQuestion();
}

// Load Question
function loadQuestion() {
    const question = quizDatabase[gameState.currentQuestionIndex];
    const questionNumber = gameState.currentQuestionIndex + 1;

    document.getElementById('questionNumber').textContent = questionNumber;
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('currentScore').textContent = gameState.score;

    // Reset UI
    document.getElementById('multipleChoice').innerHTML = '';
    document.getElementById('multipleChoice').style.display = 'none';
    document.getElementById('trueFalse').style.display = 'none';
    document.getElementById('textInput').style.display = 'none';
    document.getElementById('textAnswer').value = '';

    gameState.answered = false;

    // Load question based on type
    if (question.type === 'multiple') {
        loadMultipleChoice(question);
    } else if (question.type === 'truefalse') {
        loadTrueFalse();
    } else if (question.type === 'text') {
        loadTextInput();
    }

    // Start timer
    startTimer();
}

// Load Multiple Choice
function loadMultipleChoice(question) {
    const container = document.getElementById('multipleChoice');
    container.style.display = 'block';

    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'btn btn-answer';
        button.textContent = option;
        button.onclick = () => answerQuestion(index);
        container.appendChild(button);
    });
}

// Load True/False
function loadTrueFalse() {
    document.getElementById('trueFalse').style.display = 'flex';
}

// Load Text Input
function loadTextInput() {
    document.getElementById('textInput').style.display = 'block';
    document.getElementById('textAnswer').focus();
}

// Answer Question
function answerQuestion(selectedAnswer) {
    if (gameState.answered) return;

    gameState.answered = true;
    const question = quizDatabase[gameState.currentQuestionIndex];
    let isCorrect = false;

    if (question.type === 'multiple' || question.type === 'truefalse') {
        isCorrect = selectedAnswer === question.correct;
    }

    recordAnswer(isCorrect);
    showFeedback(isCorrect);
}

// Submit Text Answer
function submitTextAnswer() {
    if (gameState.answered) return;

    gameState.answered = true;
    const question = quizDatabase[gameState.currentQuestionIndex];
    const userAnswer = document.getElementById('textAnswer').value.trim().toLowerCase();
    const correctAnswer = question.answer.toLowerCase();
    const isCorrect = userAnswer === correctAnswer;

    recordAnswer(isCorrect);
    showTextFeedback(isCorrect, correctAnswer);
}

// Handle Text Input Keypress
function handleTextInputKeypress(event) {
    if (event.key === 'Enter') {
        submitTextAnswer();
    }
}

// Record Answer
function recordAnswer(isCorrect) {
    clearInterval(gameState.timerInterval);

    if (isCorrect) {
        const multiplier = difficultySettings[gameState.difficulty].multiplier;
        const points = Math.ceil(10 * multiplier);
        gameState.score += points;
    }

    gameState.answers.push({
        question: quizDatabase[gameState.currentQuestionIndex].question,
        isCorrect: isCorrect
    });
}

// Show Feedback
function showFeedback(isCorrect) {
    const buttons = document.querySelectorAll('.btn-answer');
    buttons.forEach((btn, index) => {
        if (index === quizDatabase[gameState.currentQuestionIndex].correct) {
            btn.classList.add('correct');
        }
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
    });

    setTimeout(() => {
        if (gameState.currentQuestionIndex < quizDatabase.length - 1) {
            gameState.currentQuestionIndex++;
            loadQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

// Show Text Feedback
function showTextFeedback(isCorrect, correctAnswer) {
    const container = document.getElementById('textInput');
    const feedback = document.createElement('div');
    feedback.style.marginTop = '10px';
    feedback.style.fontSize = '1.1em';
    feedback.style.fontWeight = 'bold';

    if (isCorrect) {
        feedback.textContent = '✓ Correct!';
        feedback.style.color = '#27ae60';
    } else {
        feedback.textContent = `✗ Incorrect! Answer: ${correctAnswer}`;
        feedback.style.color = '#e74c3c';
    }

    container.appendChild(feedback);
    document.getElementById('textAnswer').disabled = true;
    document.querySelectorAll('#textInput .btn').forEach(btn => btn.disabled = true);

    setTimeout(() => {
        if (gameState.currentQuestionIndex < quizDatabase.length - 1) {
            gameState.currentQuestionIndex++;
            loadQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

// Timer
function startTimer() {
    gameState.timeRemaining = gameState.timePerQuestion;
    updateTimerDisplay();

    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        updateTimerDisplay();

        if (gameState.timeRemaining <= 3) {
            document.getElementById('timer').classList.add('warning');
        }

        if (gameState.timeRemaining <= 0) {
            clearInterval(gameState.timerInterval);
            if (!gameState.answered) {
                gameState.answered = true;
                recordAnswer(false);
                showTimeoutFeedback();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById('timer').textContent = gameState.timeRemaining + 's';
}

function showTimeoutFeedback() {
    document.getElementById('timer').classList.remove('warning');
    const buttons = document.querySelectorAll('.btn-answer');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
    });

    // Show correct answer for multiple choice
    const question = quizDatabase[gameState.currentQuestionIndex];
    if (question.type === 'multiple' && buttons.length > 0) {
        buttons[question.correct].classList.add('correct');
    }

    setTimeout(() => {
        if (gameState.currentQuestionIndex < quizDatabase.length - 1) {
            gameState.currentQuestionIndex++;
            loadQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

// End Quiz
function endQuiz() {
    clearInterval(gameState.timerInterval);
    const correctCount = gameState.answers.filter(a => a.isCorrect).length;

    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('correctCount').textContent = correctCount;

    switchScreen('resultsScreen');
}

// Save Score
function saveScore() {
    const playerName = document.getElementById('playerName').value.trim() || 'Anonymous';
    
    const score = {
        name: playerName,
        score: gameState.score,
        difficulty: gameState.difficulty,
        correctAnswers: gameState.answers.filter(a => a.isCorrect).length,
        totalQuestions: quizDatabase.length,
        date: new Date().toLocaleDateString()
    };

    leaderboard.push(score);
    localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));

    showLeaderboard();
}

// Show Leaderboard
function showLeaderboard() {
    switchScreen('leaderboardScreen');
    switchLeaderboardTab('all');
}

// Switch Leaderboard Tab
function switchLeaderboardTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    let filteredScores = leaderboard;

    if (tab !== 'all') {
        filteredScores = leaderboard.filter(score => score.difficulty === tab);
    }

    // Sort by score (descending)
    filteredScores.sort((a, b) => b.score - a.score);

    // Display leaderboard
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';

    if (filteredScores.length === 0) {
        leaderboardList.innerHTML = '<div class="empty-message">No scores yet. Play a quiz!</div>';
        return;
    }

    filteredScores.forEach((score, index) => {
        const rank = index + 1;
        const item = document.createElement('div');
        item.className = `leaderboard-item rank-${rank <= 3 ? rank : 'default'}`;

        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

        item.innerHTML = `
            <div class="rank-badge">${medal || rank}</div>
            <div class="player-info">
                <div class="player-name">${score.name}</div>
                <div class="player-meta">
                    ${score.difficulty.toUpperCase()} | ${score.correctAnswers}/${score.totalQuestions} correct | ${score.date}
                </div>
            </div>
            <div class="player-score">${score.score} pts</div>
        `;

        leaderboardList.appendChild(item);
    });
}

// Go Home
function goHome() {
    switchScreen('homeScreen');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    switchScreen('homeScreen');
});