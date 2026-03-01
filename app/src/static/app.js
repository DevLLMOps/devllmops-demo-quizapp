let currentQuestion = 0;
let questions = [];
let answers = {};

// Load questions when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
});

async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        const data = await response.json();
        questions = data.questions;
        displayQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('question-display').innerHTML = 
            '<p class="error">Error loading questions. Please refresh the page.</p>';
    }
}

function displayQuestion() {
    const questionContainer = document.getElementById('question-display');
    const question = questions[currentQuestion];
    
    if (!question) return;
    
    const choicesHtml = question.options.map((option, index) => {
        const isSelected = answers[question.id] === index;
        return `
            <div class="choice ${isSelected ? 'selected' : ''}" 
                 onclick="selectChoice(${question.id}, ${index})"
                 tabindex="0" 
                 role="button" 
                 aria-pressed="${isSelected}">
                <input type="radio" name="q${question.id}" value="${index}" ${isSelected ? 'checked' : ''}>
                ${option}
            </div>
        `;
    }).join('');
    
    questionContainer.innerHTML = `
        <div class="question">
            <h2>Q${currentQuestion + 1}: ${question.question}</h2>
            <div class="choices">
                ${choicesHtml}
            </div>
        </div>
    `;
    
    updateProgress();
    updateNavigationButtons();
    
    // Add keyboard support for choices
    const choices = questionContainer.querySelectorAll('.choice');
    choices.forEach(choice => {
        choice.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                choice.click();
            }
        });
    });
}

function selectChoice(questionId, optionIndex) {
    // Add selection animation class
    const clickedChoice = event.currentTarget;
    
    // Remove animation class from all choices first
    document.querySelectorAll('.choice').forEach(choice => {
        choice.classList.remove('selecting');
    });
    
    // Apply selection animation if motion is allowed
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        clickedChoice.classList.add('selecting');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            clickedChoice.classList.remove('selecting');
        }, 300);
    }
    
    // Update answer
    answers[questionId] = optionIndex;
    
    // Update visual selection
    document.querySelectorAll('.choice').forEach((choice, index) => {
        choice.classList.toggle('selected', index === optionIndex);
        choice.setAttribute('aria-pressed', index === optionIndex);
        const radio = choice.querySelector('input[type="radio"]');
        if (radio) radio.checked = index === optionIndex;
    });
    
    updateNavigationButtons();
}

function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        displayQuestion();
    }
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

function updateProgress() {
    const progressBar = document.getElementById('progress-bar');
    const progressIndicator = document.getElementById('progress-indicator');
    
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    progressBar.style.width = progress + '%';
    progressIndicator.textContent = `Question ${currentQuestion + 1} / ${questions.length}`;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    prevBtn.disabled = currentQuestion === 0;
    
    const isLastQuestion = currentQuestion === questions.length - 1;
    const currentAnswered = answers.hasOwnProperty(questions[currentQuestion].id);
    
    if (isLastQuestion) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
        submitBtn.disabled = !currentAnswered;
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
        nextBtn.disabled = !currentAnswered;
    }
}

async function submitAnswers() {
    try {
        const response = await fetch('/api/answers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answers: answers })
        });
        
        const results = await response.json();
        displayResults(results);
    } catch (error) {
        console.error('Error submitting answers:', error);
        alert('Error submitting answers. Please try again.');
    }
}

function displayResults(results) {
    document.getElementById('quiz').classList.add('hidden');
    const resultsContainer = document.getElementById('results');
    resultsContainer.classList.remove('hidden');
    
    let scoreClass = 'score-poor';
    if (results.percentage >= 90) scoreClass = 'score-excellent';
    else if (results.percentage >= 70) scoreClass = 'score-good';
    else if (results.percentage >= 50) scoreClass = 'score-needs-improvement';
    
    let detailedResults = '';
    results.detailed_results.forEach(result => {
        const userAnswer = result.user_answer !== null ? questions
            .find(q => q.id === result.question_id)?.options[result.user_answer] || 'No answer' : 'No answer';
        
        const correctAnswer = questions
            .find(q => q.id === result.question_id)?.options[result.correct_answer];
        
        const question = questions.find(q => q.id === result.question_id);
        
        detailedResults += `
            <div class="result-question">
                <h3>Q${result.question_id}: ${question.question}</h3>
                <div class="result-choice ${result.is_correct ? 'correct' : 'incorrect'} user-selected">
                    Your answer: ${userAnswer}
                </div>
                ${!result.is_correct ? `
                    <div class="result-choice correct">
                        Correct answer: ${correctAnswer}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    resultsContainer.innerHTML = `
        <div class="score ${scoreClass}">
            <h2>Quiz Complete!</h2>
            <p>Your Score: ${results.score}/${results.total} (${results.percentage}%)</p>
        </div>
        <div class="results-details">
            <h3>Detailed Results:</h3>
            ${detailedResults}
        </div>
        <button onclick="restartQuiz()">Take Quiz Again</button>
    `;
}

function restartQuiz() {
    currentQuestion = 0;
    answers = {};
    document.getElementById('quiz').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    displayQuestion();
}