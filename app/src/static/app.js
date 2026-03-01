class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestion = 0;
        this.userAnswers = {};
        this.init();
    }

    async init() {
        try {
            await this.loadQuestions();
            this.setupEventListeners();
            this.displayQuestion();
            this.updateProgress();
        } catch (error) {
            console.error('Failed to initialize quiz:', error);
            this.showError('Failed to load quiz questions. Please refresh the page.');
        }
    }

    async loadQuestions() {
        const response = await fetch('/api/questions');
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        this.questions = data.questions;
    }

    setupEventListeners() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prevQuestion());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitAnswers());
    }

    displayQuestion() {
        const questionDisplay = document.getElementById('question-display');
        const question = this.questions[this.currentQuestion];
        
        if (!question || !questionDisplay) return;

        const choicesHtml = question.choices.map((choice, index) => {
            const isSelected = this.userAnswers[question.id] === index;
            return `
                <div class="choice ${isSelected ? 'selected' : ''}" 
                     data-question-id="${question.id}" 
                     data-choice-index="${index}"
                     tabindex="0"
                     role="radio"
                     aria-checked="${isSelected}">
                    ${choice}
                </div>
            `;
        }).join('');

        questionDisplay.innerHTML = `
            <div class="question" role="group" aria-labelledby="question-${question.id}">
                <h2 id="question-${question.id}">${question.question}</h2>
                <div class="choices" role="radiogroup" aria-labelledby="question-${question.id}">
                    ${choicesHtml}
                </div>
            </div>
        `;

        this.attachChoiceListeners();
        this.updateNavigationButtons();
        
        // Focus the question for screen readers
        const questionElement = document.getElementById(`question-${question.id}`);
        if (questionElement) {
            questionElement.focus();
        }
    }

    attachChoiceListeners() {
        const choices = document.querySelectorAll('.choice');
        choices.forEach(choice => {
            // Mouse/touch events
            choice.addEventListener('click', (e) => this.selectChoice(e));
            
            // Keyboard events
            choice.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectChoice(e);
                }
            });
        });
    }

    selectChoice(event) {
        const choice = event.currentTarget;
        const questionId = parseInt(choice.dataset.questionId);
        const choiceIndex = parseInt(choice.dataset.choiceIndex);

        // Remove selected class from all choices for this question
        const allChoices = document.querySelectorAll(`[data-question-id="${questionId}"]`);
        allChoices.forEach(c => {
            c.classList.remove('selected');
            c.setAttribute('aria-checked', 'false');
        });

        // Add selected class to clicked choice with animation
        choice.classList.add('selected');
        choice.setAttribute('aria-checked', 'true');

        // Store the answer
        this.userAnswers[questionId] = choiceIndex;

        // Add a subtle feedback animation
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            choice.style.transform = 'scale(1.05)';
            setTimeout(() => {
                choice.style.transform = '';
            }, 150);
        }

        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (!prevBtn || !nextBtn || !submitBtn) return;

        // Update previous button
        prevBtn.disabled = this.currentQuestion === 0;

        // Update next/submit buttons
        const isLastQuestion = this.currentQuestion === this.questions.length - 1;
        
        if (isLastQuestion) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }

        // Enable/disable based on whether current question is answered
        const currentQuestionId = this.questions[this.currentQuestion]?.id;
        const isAnswered = this.userAnswers.hasOwnProperty(currentQuestionId);
        
        if (isLastQuestion) {
            submitBtn.disabled = !this.allQuestionsAnswered();
        } else {
            nextBtn.disabled = !isAnswered;
        }
    }

    allQuestionsAnswered() {
        return this.questions.every(q => this.userAnswers.hasOwnProperty(q.id));
    }

    nextQuestion() {
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
            this.displayQuestion();
            this.updateProgress();
        }
    }

    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.displayQuestion();
            this.updateProgress();
        }
    }

    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const progressIndicator = document.getElementById('progress-indicator');
        
        if (progressBar && progressIndicator) {
            const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressIndicator.textContent = `Question ${this.currentQuestion + 1} / ${this.questions.length}`;
        }
    }

    async submitAnswers() {
        if (!this.allQuestionsAnswered()) {
            alert('Please answer all questions before submitting.');
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            // Add submission animation
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                submitBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    submitBtn.style.transform = '';
                }, 150);
            }
        }

        try {
            const response = await fetch('/api/answers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answers: this.userAnswers }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit answers');
            }

            const results = await response.json();
            this.showResults(results);
        } catch (error) {
            console.error('Failed to submit answers:', error);
            this.showError('Failed to submit answers. Please try again.');
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Answers';
            }
        }
    }

    showResults(results) {
        const quizContainer = document.getElementById('quiz');
        const resultsContainer = document.getElementById('results');
        
        if (!quizContainer || !resultsContainer) return;

        quizContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        const scoreClass = this.getScoreClass(results.percentage);
        const resultDetails = this.generateResultDetails(results);

        resultsContainer.innerHTML = `
            <h2>Quiz Results</h2>
            <div class="score ${scoreClass}">
                ${results.score} / ${results.total}
                <div style="font-size: 0.7em; margin-top: 0.5rem;">
                    ${results.percentage}%
                </div>
            </div>
            <p>${this.getScoreMessage(results.percentage)}</p>
            ${resultDetails}
            <button onclick="location.reload()" style="margin-top: 2rem;">
                Take Quiz Again
            </button>
        `;

        // Focus on results for accessibility
        resultsContainer.focus();
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    getScoreClass(percentage) {
        if (percentage >= 80) return 'high';
        if (percentage >= 60) return 'medium';
        return 'low';
    }

    getScoreMessage(percentage) {
        if (percentage >= 90) return 'Excellent! You have a great understanding of DevLLMOps.';
        if (percentage >= 80) return 'Good job! You have a solid grasp of DevLLMOps concepts.';
        if (percentage >= 70) return 'Not bad! You might want to review some DevLLMOps principles.';
        if (percentage >= 60) return 'You\'re getting there. Consider learning more about DevLLMOps.';
        return 'Keep studying! There\'s more to learn about DevLLMOps methodology.';
    }

    generateResultDetails(results) {
        if (!results.details || results.details.length === 0) {
            return '';
        }

        const detailsHtml = results.details.map(detail => {
            const isCorrect = detail.correct;
            const question = this.questions.find(q => q.id === detail.question_id);
            
            if (!question) return '';

            return `
                <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="result-question">${question.question}</div>
                    <div class="result-answer">
                        Your answer: <span class="${isCorrect ? 'correct-answer' : 'incorrect-answer'}">
                            ${question.choices[detail.user_answer]}
                        </span>
                    </div>
                    ${!isCorrect ? `
                        <div class="result-answer">
                            Correct answer: <span class="correct-answer">
                                ${question.choices[detail.correct_answer]}
                            </span>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="results-details">
                <h3 style="margin-bottom: 1rem;">Question Breakdown</h3>
                ${detailsHtml}
            </div>
        `;
    }

    showError(message) {
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #b91c1c;
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 1rem 0;
            text-align: center;
        `;
        errorContainer.textContent = message;

        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(errorContainer, container.firstChild);
            
            // Remove error after 5 seconds
            setTimeout(() => {
                errorContainer.remove();
            }, 5000);
        }
    }
}

// Global functions for button onclick handlers (backwards compatibility)
let quizApp;

function nextQuestion() {
    if (quizApp) quizApp.nextQuestion();
}

function prevQuestion() {
    if (quizApp) quizApp.prevQuestion();
}

function submitAnswers() {
    if (quizApp) quizApp.submitAnswers();
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    quizApp = new QuizApp();
});