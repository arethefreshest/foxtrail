from typing import List, Dict

class QuizGenerator:
    def __init__(self, ai_service):
        self.ai_service = ai_service

    async def create_quiz(self, content: str, num_questions: int = 5) -> List[Dict]:
        """Create a quiz based on content"""
        questions = await self.ai_service.generate_quiz(content)
        return questions[:num_questions]

    def evaluate_answer(self, question: Dict, user_answer: str) -> Dict:
        """Evaluate user's answer and provide feedback"""
        is_correct = user_answer == question["correct_answer"]
        return {
            "correct": is_correct,
            "feedback": "Great job!" if is_correct else "Let's try again!"
        } 