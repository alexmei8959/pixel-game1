import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, submitAnswers } from '../api';

const Game = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const questionCount = parseInt(import.meta.env.VITE_QUESTION_COUNT) || 5;
  const passThreshold = parseInt(import.meta.env.VITE_PASS_THRESHOLD) || 3;

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      const data = await fetchQuestions(questionCount);
      setQuestions(data);
      setLoading(false);
    };
    loadQuestions();
  }, [questionCount]);

  const handleAnswer = async (idx) => {
    const currentQ = questions[currentIndex];
    const letter = ['A', 'B', 'C', 'D'][idx];
    const newAnswers = [...userAnswers, { id: currentQ.id, selected: letter }];
    setUserAnswers(newAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setLoading(true);
      const userId = sessionStorage.getItem('pixel_game_userId') || 'Anonymous';
      const result = await submitAnswers(userId, newAnswers, passThreshold);
      
      const finalScore = result.score !== undefined ? result.score : 0;
      sessionStorage.setItem('pixel_game_score', finalScore);
      navigate('/result');
    }
  };

  if (loading) {
    return <div className="loading blink">LOADING...</div>;
  }

  if (questions.length === 0) {
    return <div>ERROR: NO QUESTIONS FOUND</div>;
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="container">
      <div className="avatar-container">
        <img 
          src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=boss_${currentQ.id}`} 
          alt="Enemy Avatar" 
          className="avatar-img"
        />
      </div>
      
      <h3>STAGE {currentIndex + 1} / {questions.length}</h3>
      <p style={{ minHeight: '80px', margin: '2rem 0' }}>{currentQ.question}</p>

      <div className="options-grid">
        {currentQ.options.map((opt, idx) => (
          <button 
            key={idx} 
            className="pixel-btn"
            onClick={() => handleAnswer(idx)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Game;
