"""DevLLMOps Quiz App - FastAPI backend."""

import os

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from questions import QUESTIONS

app = FastAPI(title="DevLLMOps Quiz", version="1.0.0")

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", response_class=FileResponse)
async def root():
    """Serve the quiz frontend."""
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/api/questions")
async def get_questions():
    """Return all quiz questions without correct answers."""
    safe_questions = []
    for q in QUESTIONS:
        safe_questions.append(
            {
                "id": q["id"],
                "question": q["question"],
                "options": q["options"],
            }
        )
    return {"questions": safe_questions}


class AnswerSubmission(BaseModel):
    answers: dict[int, int]  # {question_id: selected_option_index}


@app.post("/api/answers")
async def check_answers(submission: AnswerSubmission):
    """Check submitted answers and return score with corrections."""
    results = []
    correct_count = 0

    for q in QUESTIONS:
        qid = q["id"]
        selected = submission.answers.get(qid)
        is_correct = selected == q["correct"]
        if is_correct:
            correct_count += 1
        results.append(
            {
                "id": qid,
                "correct": is_correct,
                "correct_answer": q["correct"],
                "selected": selected,
                "explanation": q["explanation"],
            }
        )

    return {
        "score": correct_count,
        "total": len(QUESTIONS),
        "percentage": round(correct_count / len(QUESTIONS) * 100),
        "results": results,
    }
