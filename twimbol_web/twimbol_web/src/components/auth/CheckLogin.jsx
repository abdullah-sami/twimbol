import { Navigate } from 'react-router-dom'

export default function CheckLogin({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? <Navigate to="/home" replace/> : children;
}