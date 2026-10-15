import { useNavigate } from 'react-router-dom'
import { PostComposer } from './PostComposer'

export function ComposePage() {
  const navigate = useNavigate()
  return <div className="mx-auto max-w-2xl"><PostComposer autoFocus onCreated={() => navigate('/community')} /></div>
}
