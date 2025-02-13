from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ...database.connection import get_db
from ...models.quiz import Quiz
from ...models.quiz_result import QuizResult
from ...models.user import User
from ...models.content import Content
from ...core.auth import get_current_user
from ...services.ai_service import AIService
from ...services.quiz_generator import QuizGenerator
from ...schemas.quiz_schema import QuizResponse, QuizSubmission, QuizResultResponse

router = APIRouter()

@router.get("/quizzes/{content_id}", response_model=QuizResponse)
async def get_quiz(
    content_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get content first
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    # Get or create quiz
    quiz = db.query(Quiz).filter(Quiz.content_id == content_id).first()
    if not quiz:
        ai_service = AIService()
        content_text = str(getattr(content, 'content', ''))
        questions = await ai_service.generate_quiz(content_text)
        quiz = Quiz(
            title=f"Quiz: {content.title}",
            content_id=content_id,
            questions=questions
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
    return quiz

@router.post("/quizzes/{quiz_id}/submit", response_model=QuizResultResponse)
async def submit_quiz(
    quiz_id: int,
    submission: QuizSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )

    # Evaluate answers
    quiz_generator = QuizGenerator(AIService())
    questions_list = getattr(quiz, 'questions', [])
    total_questions = len(questions_list)
    correct_answers = 0

    if questions_list:
        for question, answer in submission.answers.items():
            question_data = next(
                (q for q in questions_list if str(q.get("question", "")) == question),
                None
            )
            if question_data and isinstance(question_data, dict):
                result = quiz_generator.evaluate_answer(question_data, answer)
                if result.get("correct", False):
                    correct_answers += 1

    score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

    # Save result
    quiz_result = QuizResult(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=score,
        answers=submission.answers
    )
    db.add(quiz_result)
    db.commit()
    db.refresh(quiz_result)

    return {
        "score": score,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "feedback": "Great job!" if score >= 70 else "Keep practicing!"
    }

@router.get("/progress", response_model=List[QuizResultResponse])
async def get_user_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(QuizResult).filter(
        QuizResult.user_id == current_user.id
    ).order_by(QuizResult.created_at.desc()).all()
    return results 