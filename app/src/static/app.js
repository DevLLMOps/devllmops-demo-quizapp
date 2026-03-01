let questions = [];
let currentIndex = 0;
let answers = {}; // { questionId: optionIndex }

async function loadQuestions() {
    const res = await fetch("/api/questions");
    const data = await res.json();
    questions = data.questions;
    if (questions.length > 0) {
        showQuestion(0);
    }
}

function showQuestion(index) {
    if (index < 0 || index >= questions.length) return;
    currentIndex = index;

    const q = questions[index];
    const display = document.getElementById("question-display");

    display.innerHTML = `
        <div class="question-card" id="q-${q.id}">
            <h3>Question ${index + 1} of ${questions.length}</h3>
            <p class="question-text">${q.question}</p>
            <div class="options">
                ${q.options
                    .map(
                        (opt, oi) => `
                    <div class="option" id="q${q.id}-opt${oi}" onclick="selectOption(${q.id}, ${oi})">
                        <input type="radio" name="q${q.id}" id="q${q.id}-o${oi}" value="${oi}"
                            ${answers[q.id] === oi ? "checked" : ""}>
                        <label for="q${q.id}-o${oi}">${opt}</label>
                    </div>
                `
                    )
                    .join("")}
            </div>
        </div>
    `;

    // Restore previously selected answer styling
    if (answers[q.id] !== undefined) {
        const card = document.getElementById(`q-${q.id}`);
        card.querySelectorAll(".option").forEach((el, i) => {
            el.classList.toggle("selected", i === answers[q.id]);
        });
    }

    updateUI();
}

function updateUI() {
    const total = questions.length;
    const current = currentIndex + 1;
    const currentQuestion = questions[currentIndex];
    const hasAnswerForCurrentQuestion = currentQuestion && answers[currentQuestion.id] !== undefined;

    // Update progress indicator text
    document.getElementById("progress-indicator").textContent =
        `Question ${current} of ${total}`;

    // Update progress bar
    const pct = total > 1 ? ((currentIndex) / (total - 1)) * 100 : 100;
    document.getElementById("progress-bar").style.width = pct + "%";

    // Update Previous button
    const prevBtn = document.getElementById("prev-btn");
    prevBtn.disabled = currentIndex === 0;

    // Update Next / Submit visibility and disabled state
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-btn");
    const isLast = currentIndex === total - 1;

    if (isLast) {
        nextBtn.classList.add("hidden");
        submitBtn.classList.remove("hidden");
        // Disable Submit button if current question not answered
        submitBtn.disabled = !hasAnswerForCurrentQuestion;
    } else {
        nextBtn.classList.remove("hidden");
        submitBtn.classList.add("hidden");
        // Disable Next button if current question not answered
        nextBtn.disabled = !hasAnswerForCurrentQuestion;
    }
}

function selectOption(questionId, optionIndex) {
    answers[questionId] = optionIndex;

    const card = document.getElementById(`q-${questionId}`);
    card.querySelectorAll(".option").forEach((el, i) => {
        el.classList.toggle("selected", i === optionIndex);
        el.querySelector("input").checked = i === optionIndex;
    });

    // Add selecting animation class to the chosen option
    const selectedOption = document.getElementById(`q${questionId}-opt${optionIndex}`);
    if (selectedOption) {
        // Remove any existing animation class first
        selectedOption.classList.remove("selecting");
        
        // Force a reflow to restart the animation
        selectedOption.offsetHeight;
        
        // Add the animation class
        selectedOption.classList.add("selecting");
        
        // Remove the animation class after it completes
        setTimeout(() => {
            selectedOption.classList.remove("selecting");
        }, 400);
    }

    // Update UI immediately to enable Next/Submit button
    updateUI();
}

function prevQuestion() {
    if (currentIndex > 0) {
        // Add button click animation
        addButtonClickAnimation("prev-btn");
        showQuestion(currentIndex - 1);
    }
}

function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        // Add button click animation
        addButtonClickAnimation("next-btn");
        showQuestion(currentIndex + 1);
    }
}

async function submitAnswers() {
    if (Object.keys(answers).length < questions.length) {
        const unanswered = questions.filter(q => answers[q.id] === undefined);
        const firstUnanswered = questions.indexOf(unanswered[0]);
        alert(`Please answer all questions before submitting. You have ${unanswered.length} unanswered question(s).`);
        showQuestion(firstUnanswered);
        return;
    }

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Checking...";

    // Add button click animation
    addButtonClickAnimation("submit-btn");

    try {
        const res = await fetch("/api/answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers }),
        });
        const data = await res.json();
        showResults(data);
    } catch (error) {
        alert("Error submitting quiz. Please try again.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Answers";
    }
}

function showResults(data) {
    const level =
        data.percentage >= 80 ? "high" : data.percentage >= 50 ? "medium" : "low";

    // Hide carousel
    document.getElementById("quiz").classList.add("hidden");

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        <div class="score ${level}">${data.percentage}%</div>
        <p class="score-text">${data.score} out of ${data.total} correct</p>
        <div id="results-questions"></div>
        <button class="restart-btn" onclick="restartQuiz()">Try Again</button>
    `;
    resultsDiv.classList.remove("hidden");

    const resultsQuestions = document.getElementById("results-questions");
    data.results.forEach((r, idx) => {
        const q = questions.find(q => q.id === r.id);
        if (!q) return;

        const optionsHtml = q.options
            .map((opt, i) => {
                let cls = "option";
                if (i === r.correct_answer) cls += " correct";
                else if (i === r.selected && !r.correct) cls += " wrong";
                return `
                    <div class="${cls}" style="cursor:default;">
                        <input type="radio" ${i === r.selected ? "checked" : ""} disabled>
                        <label>${opt}</label>
                    </div>
                `;
            })
            .join("");

        const cardHtml = `
            <div class="question-card result-card">
                <h3>Question ${idx + 1} of ${data.total}</h3>
                <p class="question-text">${q.question}</p>
                <div class="options">${optionsHtml}</div>
                <div class="explanation">${r.explanation}</div>
            </div>
        `;
        resultsQuestions.insertAdjacentHTML("beforeend", cardHtml);
    });
}

function restartQuiz() {
    answers = {};
    currentIndex = 0;

    // Add button click animation
    const restartBtn = document.querySelector(".restart-btn");
    if (restartBtn) {
        addButtonClickAnimation(null, restartBtn);
    }

    document.getElementById("results").classList.add("hidden");
    document.getElementById("quiz").classList.remove("hidden");

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Answers";

    showQuestion(0);
}

// Helper function to add click animation to buttons
function addButtonClickAnimation(buttonId, buttonElement = null) {
    const button = buttonElement || (buttonId ? document.getElementById(buttonId) : null);
    if (!button || button.disabled) return;

    // Remove existing animation class
    button.classList.remove("clicked");
    
    // Force a reflow to restart the animation
    button.offsetHeight;
    
    // Add the animation class
    button.classList.add("clicked");
    
    // Remove the animation class after it completes
    setTimeout(() => {
        button.classList.remove("clicked");
    }, 400);
}

// Keyboard navigation support
document.addEventListener("keydown", (e) => {
    // Only handle arrow keys when quiz is visible and not in results
    if (document.getElementById("quiz").classList.contains("hidden")) return;
    
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        // Only allow navigation if current question is answered
        const currentQuestion = questions[currentIndex];
        const hasAnswer = currentQuestion && answers[currentQuestion.id] !== undefined;
        if (hasAnswer && currentIndex < questions.length - 1) nextQuestion();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIndex > 0) prevQuestion();
    }
});

// Initialize the quiz
loadQuestions();