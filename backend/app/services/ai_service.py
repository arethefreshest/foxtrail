from typing import Dict, List, Optional, Any
from openai import OpenAI
import json
from ..core.config import settings
from ..core.logging import logger
import openai
from tenacity import retry, stop_after_attempt, wait_exponential
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class AIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4-turbo-preview"  # or your preferred model
        self.embedding_model = "text-embedding-3-small"
        
    def _get_message_content(self, response) -> str:
        """Safely extract message content from OpenAI response"""
        if not response.choices:
            return "No content generated"
        message = response.choices[0].message
        return message.content if message and message.content else "No content generated"
        
    async def generate_content(self, topic: str, difficulty: str) -> Dict:
        """Generate learning content using GPT-4"""
        prompt = f"""Create a comprehensive learning module about {topic} at a {difficulty} level.
        Structure the response as follows:
        1. A catchy title
        2. Main content with clear explanations
        3. Key takeaways
        4. Examples
        Make it engaging and conversational, similar to Duolingo's style."""

        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert teacher who creates engaging learning content."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        content = self._get_message_content(response)
        
        return {
            "title": f"Learning {topic}",
            "content": content
        }

    async def generate_quiz(self, content: str) -> List[Dict]:
        """Generate quiz questions based on content"""
        prompt = f"""Based on this content: {content}
        Create 5 multiple-choice questions. Format as JSON with:
        - question
        - options (4 choices)
        - correct_answer
        - explanation
        Make questions engaging and varied in difficulty.
        Return ONLY valid JSON."""

        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert at creating educational assessments. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Parse the response into structured questions
        try:
            content = self._get_message_content(response)
            if content == "No content generated":
                raise ValueError("No content generated")
            
            questions = json.loads(content)
            if isinstance(questions, list):
                return questions
            return [questions]  # Handle case where single question is returned
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing quiz response: {e}")
            # Fallback questions if parsing fails
            return [
                {
                    "question": "What is the main topic of this content?",
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": "A",
                    "explanation": "Please try again with the content."
                }
            ]

    async def analyze_prerequisites(self, topic: str) -> Dict:
        """Analyze topic to determine prerequisites and complexity"""
        prompt = f"""Analyze this topic: {topic}
        Provide a JSON object with:
        1. Prerequisites (what should be learned first)
        2. Complexity level (1-10)
        3. Suggested difficulty (beginner/intermediate/advanced/expert)
        Return ONLY valid JSON."""

        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert at curriculum design and educational pathways. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        try:
            content = self._get_message_content(response)
            if content == "No content generated":
                raise ValueError("No content generated")
                
            return json.loads(content)
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing prerequisites response: {e}")
            return {
                "prerequisites": [],
                "complexity": 1,
                "difficulty": "beginner"
            }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def analyze_content_relationships(self, content_texts: List[str]) -> Dict[str, Any]:
        """Analyze relationships between content pieces using embeddings"""
        try:
            # Get embeddings for all content
            embeddings = []
            for text in content_texts:
                response = self.client.embeddings.create(
                    input=text[:8000],  # Truncate to fit token limit
                    model=self.embedding_model
                )
                embeddings.append(response.data[0].embedding)

            # Convert list to numpy array for cosine similarity
            embeddings_array = np.array(embeddings)
            
            # Calculate similarity matrix
            similarity_matrix = cosine_similarity(embeddings_array)

            # Find related concepts
            related_concepts = await self._extract_concepts(content_texts)

            return {
                "embeddings": embeddings,
                "similarity_matrix": similarity_matrix.tolist(),
                "related_concepts": related_concepts
            }
        except Exception as e:
            logger.error(f"Error in content relationship analysis: {str(e)}")
            return {"embeddings": [], "similarity_matrix": [], "related_concepts": []}

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def calculate_content_similarity(self, content: str, reference_texts: List[str]) -> float:
        """Calculate similarity between content and reference texts"""
        try:
            # Get embedding for new content
            content_embedding = self.client.embeddings.create(
                input=str(content)[:8000],  # Convert to string and truncate
                model=self.embedding_model
            )
            content_vector = np.array([content_embedding.data[0].embedding])

            # Get embeddings for reference texts
            reference_embeddings = []
            for text in reference_texts:
                response = self.client.embeddings.create(
                    input=str(text)[:8000],  # Convert to string and truncate
                    model=self.embedding_model
                )
                reference_embeddings.append(response.data[0].embedding)
            
            # Convert to numpy array
            reference_array = np.array(reference_embeddings)

            # Calculate similarity
            similarity = cosine_similarity(content_vector, reference_array)[0]
            return float(np.mean(similarity))

        except Exception as e:
            logger.error(f"Error calculating content similarity: {str(e)}")
            return 0.0

    async def _extract_concepts(self, texts: List[str]) -> List[str]:
        """Extract key concepts from texts using GPT"""
        try:
            combined_text = " ".join(str(text) for text in texts)[:4000]
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Extract key concepts from the following text. Return them as a comma-separated list."},
                    {"role": "user", "content": combined_text}
                ]
            )
            content = response.choices[0].message.content
            if not content:
                return []
            concepts = content.split(",")
            return [concept.strip() for concept in concepts]
        except Exception as e:
            logger.error(f"Error extracting concepts: {str(e)}")
            return []

    async def enhance_search_query(self, query: str) -> str:
        """
        Enhances search query using AI to improve search results
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Enhance this search query for educational content search. Keep it concise."},
                    {"role": "user", "content": query}
                ]
            )
            enhanced = response.choices[0].message.content
            return enhanced if enhanced else query
        except Exception as e:
            logger.error(f"Query enhancement failed: {str(e)}")
            return query 