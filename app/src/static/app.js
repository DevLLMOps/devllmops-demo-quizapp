let questions = [];
let currentIndex = 0;
// answers keyed by question id
const answers = {};

async function loadQuestions() {
    const res = await fetch("/api/questions");
    const data = await res.json();
    questions = data.questions;
    currentIndex = 0;
    document.getElementById("carousel").classList.remove("hidden");
    renderQuestion();
}

function renderQuestion() {
    const q = questions[currentIndex];
    const total = questions.length;
    const position = currentIndex + 1;

    // Update progress
    document.getElementById("progress-label").textContent = `Question ${position} / ${total}`;
    const progressBar = document.getElementById("progress-bar");
    progressBar.style.width = `${(position / total) * 100}%`;

    // Render question card
    const quiz = document.getElementById("quiz");
    quiz.innerHTML = `
        <div class="question-card" id="q-${q.id}">
            <p class="question-text">${q.question}</p>
            <div class="options">
                ${q.options
                    .map(
                        (opt, oi) => `
                    <div class="option${answers[q.id] === oi ? " selected" : ""}" onclick="selectOption(${q.id}, ${oi})">
                        <input type="radio" name="q${q.id}" id="q${q.id}-o${oi}" value="${oi}"${answers[q.id] === oi ? " checked" : ""}>
                        <label for="q${q.id}-o${oi}">${opt}</label>
                    </div>
                `
                    )
                    .join("")}
            </div>
        </div>
    `;

    // Update navigation buttons
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-btn");

    prevBtn.disabled = currentIndex === 0;

    const isLast = currentIndex === total - 1;
    nextBtn.classList.toggle("hidden", isLast);
    submitBtn.classList.toggle("hidden", !isLast);

    // Scroll to top of card on mobile
    quiz.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function selectOption(questionId, optionIndex) {
    answers[questionId] = optionIndex;
    const card = document.getElementById(`q-${questionId}`);
    card.querySelectorAll(".option").forEach((el, i) => {
        el.classList.toggle("selected", i === optionIndex);
        el.querySelector("input").checked = i === optionIndex;
    });
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    }
}

async function submitAnswers() {
    if (Object.keys(answers).length < questions.length) {
        const unanswered = questions.filter((q) => answers[q.id] === undefined);
        const firstUnansweredIndex = questions.findIndex((q) => q.id === unanswered[0].id);
        alert(`Please answer all questions before submitting. You have ${unanswered.length} unanswered question(s).`);
        currentIndex = firstUnansweredIndex;
        renderQuestion();
        return;
    }

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Checking...";

    const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
    });
    const data = await res.json();

    showResults(data);
}

function showResults(data) {
    const level =
        data.percentage >= 80 ? "high" : data.percentage >= 50 ? "medium" : "low";

    // Hide carousel
    document.getElementById("carousel").classList.add("hidden");

    // Show score summary
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        <div class="score ${level}">${data.percentage}%</div>
        <p class="score-text">${data.score} out of ${data.total} correct</p>
    `;
    resultsDiv.classList.remove("hidden");

    // Show all questions with corrections
    const resultsQuestions = document.getElementById("results-questions");
    resultsQuestions.innerHTML = data.results
        .map((r, ri) => {
            const q = questions.find((q) => q.id === r.id);
            return `
            <div class="question-card" id="result-q-${r.id}">
                <p class="question-label">Question ${ri + 1} of ${data.total}</p>
                <p class="question-text">${q.question}</p>
                <div class="options">
                    ${q.options
                        .map(
                            (opt, i) => `
                        <div class="option${i === r.correct_answer ? " correct" : ""}${i === r.selected && !r.correct ? " wrong" : ""}" style="cursor:default;">
                            <input type="radio" disabled${i === r.selected ? " checked" : ""}>
                            <label>${opt}</label>
                        </div>
                    `
                        )
                        .join("")}
                </div>
                <div class="explanation">${r.explanation}</div>
            </div>
        `;
        })
        .join("");

    resultsQuestions.classList.remove("hidden");
    resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Keyboard navigation
document.addEventListener("keydown", (e) => {
    const carousel = document.getElementById("carousel");
    if (carousel.classList.contains("hidden")) return;
    if (e.key === "ArrowRight") nextQuestion();
    if (e.key === "ArrowLeft") prevQuestion();
});

loadQuestions();