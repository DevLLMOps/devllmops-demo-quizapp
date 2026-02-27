let questions = [];

async function loadQuestions() {
    const res = await fetch("/api/questions");
    const data = await res.json();
    questions = data.questions;
    renderQuiz();
}

function renderQuiz() {
    const quiz = document.getElementById("quiz");
    quiz.innerHTML = questions
        .map(
            (q, qi) => `
        <div class="question-card" id="q-${q.id}">
            <h3>Question ${qi + 1} of ${questions.length}</h3>
            <p>${q.question}</p>
            <div class="options">
                ${q.options
                    .map(
                        (opt, oi) => `
                    <div class="option" onclick="selectOption(${q.id}, ${oi})">
                        <input type="radio" name="q${q.id}" id="q${q.id}-o${oi}" value="${oi}">
                        <label for="q${q.id}-o${oi}">${opt}</label>
                    </div>
                `
                    )
                    .join("")}
            </div>
        </div>
    `
        )
        .join("");
    document.getElementById("actions").classList.remove("hidden");
}

function selectOption(questionId, optionIndex) {
    const card = document.getElementById(`q-${questionId}`);
    card.querySelectorAll(".option").forEach((el, i) => {
        el.classList.toggle("selected", i === optionIndex);
        el.querySelector("input").checked = i === optionIndex;
    });
}

async function submitAnswers() {
    const answers = {};
    questions.forEach((q) => {
        const selected = document.querySelector(
            `input[name="q${q.id}"]:checked`
        );
        if (selected) {
            answers[q.id] = parseInt(selected.value);
        }
    });

    if (Object.keys(answers).length < questions.length) {
        alert("Please answer all questions before submitting.");
        return;
    }

    const btn = document.getElementById("submit-btn");
    btn.disabled = true;
    btn.textContent = "Checking...";

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
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        <div class="score ${level}">${data.percentage}%</div>
        <p class="score-text">${data.score} out of ${data.total} correct</p>
    `;
    resultsDiv.classList.remove("hidden");
    document.getElementById("actions").classList.add("hidden");

    data.results.forEach((r) => {
        const card = document.getElementById(`q-${r.id}`);
        card.querySelectorAll(".option").forEach((el, i) => {
            el.classList.remove("selected");
            el.style.cursor = "default";
            el.onclick = null;
            if (i === r.correct_answer) el.classList.add("correct");
            if (i === r.selected && !r.correct) el.classList.add("wrong");
        });
        const explanation = document.createElement("div");
        explanation.className = "explanation";
        explanation.textContent = r.explanation;
        card.appendChild(explanation);
    });
}

loadQuestions();
