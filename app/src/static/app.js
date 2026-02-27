let questions = [];
let currentIndex = 0;
let userAnswers = {}; // {question_id: option_index}
let quizSubmitted = false;

async function loadQuestions() {
    const res = await fetch("/api/questions");
    const data = await res.json();
    questions = data.questions;
    currentIndex = 0;
    userAnswers = {};
    quizSubmitted = false;
    renderCarousel();
}

function renderCarousel() {
    const quiz = document.getElementById("quiz");
    if (questions.length === 0) {
        quiz.innerHTML = "<p>No questions available.</p>";
        return;
    }

    quiz.innerHTML = `
        <div class="carousel">
            <div class="progress-bar-container">
                <div class="progress-bar" id="progress-bar"></div>
            </div>
            <div class="progress-text" id="progress-text"></div>
            <div class="question-carousel-container" id="question-carousel-container"></div>
            <div class="carousel-nav" id="carousel-nav">
                <button id="prev-btn" onclick="navigateQuestion(-1)" aria-label="Previous question">&#8592; Previous</button>
                <button id="next-btn" onclick="navigateQuestion(1)" aria-label="Next question">Next &#8594;</button>
                <button id="submit-btn" onclick="submitAnswers()" class="hidden">Submit Answers</button>
            </div>
        </div>
    `;

    renderQuestion(currentIndex);
    updateNavigation();
}

function renderQuestion(index) {
    const q = questions[index];
    const container = document.getElementById("question-carousel-container");
    const savedAnswer = userAnswers[q.id];

    container.innerHTML = `
        <div class="question-card" id="q-${q.id}">
            <h3>Question ${index + 1} of ${questions.length}</h3>
            <p>${q.question}</p>
            <div class="options" id="options-${q.id}">
                ${q.options
                    .map(
                        (opt, oi) => `
                    <div class="option${savedAnswer === oi ? " selected" : ""}" onclick="selectOption(${q.id}, ${oi})" id="q${q.id}-opt${oi}">
                        <input type="radio" name="q${q.id}" id="q${q.id}-o${oi}" value="${oi}"${savedAnswer === oi ? " checked" : ""}>
                        <label for="q${q.id}-o${oi}">${opt}</label>
                    </div>
                `
                    )
                    .join("")}
            </div>
        </div>
    `;
}

function updateNavigation() {
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-btn");
    const progressText = document.getElementById("progress-text");
    const progressBar = document.getElementById("progress-bar");

    if (!prevBtn || !nextBtn || !submitBtn) return;

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === questions.length - 1;

    prevBtn.disabled = isFirst;

    if (isLast) {
        nextBtn.classList.add("hidden");
        submitBtn.classList.remove("hidden");
    } else {
        nextBtn.classList.remove("hidden");
        submitBtn.classList.add("hidden");
    }

    if (progressText) {
        progressText.textContent = `Question ${currentIndex + 1} / ${questions.length}`;
    }

    if (progressBar) {
        const pct = ((currentIndex + 1) / questions.length) * 100;
        progressBar.style.width = pct + "%";
    }
}

function navigateQuestion(direction) {
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;
    currentIndex = newIndex;
    renderQuestion(currentIndex);
    updateNavigation();
    // Scroll to top of carousel for smooth UX
    const container = document.getElementById("question-carousel-container");
    if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
}

function selectOption(questionId, optionIndex) {
    userAnswers[questionId] = optionIndex;

    const optionsContainer = document.getElementById(`options-${questionId}`);
    if (!optionsContainer) return;
    optionsContainer.querySelectorAll(".option").forEach((el, i) => {
        el.classList.toggle("selected", i === optionIndex);
        el.querySelector("input").checked = i === optionIndex;
    });
}

async function submitAnswers() {
    if (Object.keys(userAnswers).length < questions.length) {
        // Find first unanswered question
        const unansweredIndex = questions.findIndex(
            (q) => userAnswers[q.id] === undefined
        );
        if (unansweredIndex !== -1) {
            currentIndex = unansweredIndex;
            renderQuestion(currentIndex);
            updateNavigation();
        }
        alert(
            `Please answer all questions before submitting. (${Object.keys(userAnswers).length} of ${questions.length} answered)`
        );
        return;
    }

    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Checking...";
    }

    const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: userAnswers }),
    });
    const data = await res.json();

    quizSubmitted = true;
    showResults(data);
}

function showResults(data) {
    const level =
        data.percentage >= 80 ? "high" : data.percentage >= 50 ? "medium" : "low";
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        <div class="score ${level}">${data.percentage}%</div>
        <p class="score-text">${data.score} out of ${data.total} correct</p>
    `;
    resultsDiv.classList.remove("hidden");

    // Hide carousel navigation
    const carouselNav = document.getElementById("carousel-nav");
    if (carouselNav) carouselNav.classList.add("hidden");

    // Show all questions with results
    const quiz = document.getElementById("quiz");
    quiz.innerHTML = `
        <div class="progress-text">Review your answers below</div>
        <div id="results-questions"></div>
    `;

    const resultsQuestions = document.getElementById("results-questions");
    questions.forEach((q, qi) => {
        const result = data.results.find((r) => r.id === q.id);
        const div = document.createElement("div");
        div.className = "question-card";
        div.innerHTML = `
            <h3>Question ${qi + 1} of ${questions.length}</h3>
            <p>${q.question}</p>
            <div class="options">
                ${q.options
                    .map(
                        (opt, oi) => `
                    <div class="option${oi === result.correct_answer ? " correct" : ""}${oi === result.selected && !result.correct ? " wrong" : ""}" style="cursor:default;">
                        <input type="radio" name="result-q${q.id}" value="${oi}"${oi === result.selected ? " checked" : ""} disabled>
                        <label>${opt}</label>
                    </div>
                `
                    )
                    .join("")}
            </div>
            <div class="explanation">${result.explanation}</div>
        `;
        resultsQuestions.appendChild(div);
    });

    resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });
}

loadQuestions();