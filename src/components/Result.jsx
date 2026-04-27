import { useNavigate } from 'react-router-dom';

const Result = () => {
  const navigate = useNavigate();
  const score = parseInt(sessionStorage.getItem('pixel_game_score')) || 0;
  const passThreshold = parseInt(import.meta.env.VITE_PASS_THRESHOLD) || 3;
  const total = parseInt(import.meta.env.VITE_QUESTION_COUNT) || 5;

  const isPassed = score >= passThreshold;

  const handleReplay = () => {
    navigate('/');
  };

  return (
    <div className="container">
      <h1>GAME OVER</h1>
      
      <div style={{ margin: '3rem 0' }}>
        <h2>SCORE: {score} / {total}</h2>
        {isPassed ? (
          <h2 className="blink" style={{ color: '#00ff00' }}>MISSION CLEAR!</h2>
        ) : (
          <h2 style={{ color: 'var(--error-color)' }}>YOU DIED</h2>
        )}
      </div>

      <button className="pixel-btn" onClick={handleReplay}>
        PLAY AGAIN
      </button>
    </div>
  );
};

export default Result;
