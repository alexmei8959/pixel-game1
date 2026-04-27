import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Game from './components/Game';
import Result from './components/Result';

function App() {
  return (
    <BrowserRouter basename="/pixel-game/">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
