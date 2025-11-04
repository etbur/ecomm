import { useState } from 'react'
import AdminLayout from './components/AdminLayout'
import AdminHome from './components/AdminHome'
import AdminUsers from './components/AdminUsers'
import AdminTasks from './components/AdminTasks'
import AdminTransactions from './components/AdminTransactions'
import AdminVoucher from './components/AdminVoucher'
import AdminWithdraw from './components/AdminWithdraw'
import AdminDeposit from './components/AdminDeposit'
import AdminSettings from './components/AdminSettings'
import Login from './components/Login'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('admin-home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
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
      case 'admin-transactions':
        return <AdminTransactions />
      case 'admin-voucher':
        return <AdminVoucher />
      case 'admin-withdrawals':
        return <AdminWithdraw />
      case 'admin-deposits':
        return <AdminDeposit />
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
