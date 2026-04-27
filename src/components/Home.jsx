import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const handleStart = (e) => {
    e.preventDefault();
    if (!userId.trim()) return alert('PLEASE ENTER ID');
    
    // 將 userId 存入 sessionStorage 供後續使用
    sessionStorage.setItem('pixel_game_userId', userId.trim());
    navigate('/game');
  };

  return (
    <div className="container">
      <h1 className="blink">INSERT COIN TO PLAY</h1>
      <h2>PIXEL QUIZ</h2>
      <form onSubmit={handleStart}>
        <input
          type="text"
          className="pixel-input"
          placeholder="ENTER YOUR ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          autoFocus
        />
        <br />
        <button type="submit" className="pixel-btn">START GAME</button>
      </form>
    </div>
  );
};

export default Home;
