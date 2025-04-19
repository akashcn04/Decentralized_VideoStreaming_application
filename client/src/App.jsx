import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Upload from './components/Upload';
import VideoPlayer from './components/VideoPlayer';
import MyVideos from './components/MyVideos';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Navbar />
        <main className="container mx-auto px-4 pt-20 pb-12 min-h-[calc(100vh-5rem)]">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/video/:id" element={<VideoPlayer />} />
              <Route path="/my-videos" element={<MyVideos />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
