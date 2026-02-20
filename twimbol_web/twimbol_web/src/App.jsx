import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import CheckLogin from './components/auth/CheckLogin'

// Public Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
// import Signup from './pages/Signup'
// import ForgotPassword from './pages/ForgotPassword'

// // Protected Pages
import Home from './pages/Home'
// import ReelWatch from './pages/ReelWatch'
// import Posts from './pages/Posts'
// import ReadPost from './pages/ReadPost'
// import UserProfile from './pages/UserProfile'
// import Settings from './pages/Settings'
// import ApplyCreator from './pages/ApplyCreator'
// import CreatorDashboard from './pages/CreatorDashboard'



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<CheckLogin><Landing /></CheckLogin>} />
        <Route path="/login" element={<CheckLogin><Login /></CheckLogin>} />
        {/* <Route path="/signup" element={<CheckLogin><Signup /></CheckLogin>} />
        <Route path="/forgot-password" element={<CheckLogin><ForgotPassword /></CheckLogin>} /> */}

        {/* Protected */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        {/* <Route path="/reel/:id" element={<ProtectedRoute><ReelWatch /></ProtectedRoute>} />
        <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
        <Route path="/post/:id" element={<ProtectedRoute><ReadPost /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/creator/apply" element={<ProtectedRoute><ApplyCreator /></ProtectedRoute>} />
        <Route path="/creator/dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} /> */}
      </Routes>
    </BrowserRouter>
  )
}