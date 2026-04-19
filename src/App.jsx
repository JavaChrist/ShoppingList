import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import DialogProvider from './components/ui/DialogProvider'
import Login from './pages/Login'
import Lists from './pages/Lists'
import ListDetail from './pages/ListDetail'
import Templates from './pages/Templates'

export default function App() {
  const { session, loading } = useAuth()
  const online = useOnlineStatus()

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Chargement…</div>
      </div>
    )
  }

  return (
    <DialogProvider>
      <div className="h-full flex flex-col">
        {!online && (
          <div className="bg-amber-100 text-amber-900 text-sm text-center py-1.5">
            Mode hors-ligne · les modifications seront synchronisées au retour
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <Routes>
            {!session ? (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Lists />} />
                <Route path="/lists/:listId" element={<ListDetail />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </DialogProvider>
  )
}
