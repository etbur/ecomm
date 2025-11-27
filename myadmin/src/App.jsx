import { useState } from 'react'
import AdminLayout from './components/AdminLayout'
import AdminHome from './components/AdminHome'
import AdminUsers from './components/AdminUsers'
import AdminTasks from './components/AdminTasks'
import AdminUserTasks from './components/AdminUserTasks'
import AdminTransactions from './components/AdminTransactions'
import AdminVoucher from './components/AdminVoucher'
import AdminWithdraw from './components/AdminWithdraw'
import AdminDeposit from './components/AdminDeposit'
import AdminCommunication from './components/AdminCustomerService'
import AdminSettings from './components/AdminSettings'
import Login from './components/Login'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('admin-home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  const handleLogin = (userData, token) => {
    setIsAuthenticated(true)
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setActivePage('admin-home')
  }

  const renderPage = () => {
    switch (activePage) {
      case 'admin-home':
        return <AdminHome />
      case 'admin-users':
        return <AdminUsers />
      case 'admin-tasks':
        return <AdminTasks />
      case 'admin-user-tasks':
        return <AdminUserTasks />
      case 'admin-transactions':
        return <AdminTransactions />
      case 'admin-voucher':
        return <AdminVoucher />
      case 'admin-withdrawals':
        return <AdminWithdraw />
      case 'admin-deposits':
        return <AdminDeposit />
      case 'admin-communication':
        return <AdminCommunication />
      case 'admin-settings':
        return <AdminSettings />
      default:
        return <AdminHome />
    }
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <AdminLayout activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout}>
      {renderPage()}
    </AdminLayout>
  )
}

export default App
