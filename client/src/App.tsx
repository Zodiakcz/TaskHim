import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from '@/lib/user'
import { Layout } from '@/components/Layout'
import { UserPicker } from '@/components/UserPicker'
import { Home } from '@/pages/Home'
import { TaskDetail } from '@/pages/TaskDetail'
import { TaskForm } from '@/pages/TaskForm'
import { History } from '@/pages/History'
import { Shopping } from '@/pages/Shopping'
import { ChangePassword } from '@/pages/ChangePassword'

function AppRoutes() {
  const { userName, loading } = useUser()

  if (loading) return null
  if (!userName) return <UserPicker />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks/new" element={<TaskForm />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/tasks/:id/edit" element={<TaskForm />} />
        <Route path="/history" element={<History />} />
        <Route path="/shopping" element={<Shopping />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  )
}
