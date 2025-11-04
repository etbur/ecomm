import { useState, useEffect } from 'react';
import './styles.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Home from './components/Home';
import Earn from './components/Earn';
import Trade from './components/Trade';
import Investment from './components/Investment';
import Mine from './components/Mine';
import Game from './components/Game';
import Login from './components/Login';
import Signup from './components/Signup';
import Chatbot from './components/Chatbot';
import AdminLayout from './components/admin/AdminLayout';
import AdminHome from './components/admin/AdminHome';
import AdminUsers from './components/admin/AdminUsers';
import AdminTasks from './components/admin/AdminTasks';
import AdminTransactions from './components/admin/AdminTransactions';
import AdminVentures from './components/admin/AdminVentures';
import AdminSettings from './components/admin/AdminSettings';

// Main App Content Component (inside AuthProvider)
function AppContent() {
  const { isLoggedIn, user, login, logout } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [selectedProject, setSelectedProject] = useState(null);

  const handleLogin = (userData, token) => {
    const userInfo = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      referralCode: userData.referralCode
    };
    
    // Use the token from parameter or fallback to localStorage
    const authToken = token || userData.token || localStorage.getItem('token');
    login(userInfo, authToken);
    setActivePage('home');
    
    // Keep legacy storage for backward compatibility
    localStorage.setItem('cryptoHubUser', JSON.stringify(userInfo));
    localStorage.setItem('userId', userInfo.id);
  };

  const handleSignup = (userData, token) => {
    const userInfo = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      referralCode: userData.referralCode
    };
    
    // Use the token from parameter or fallback to localStorage
    const authToken = token || userData.token || localStorage.getItem('token');
    login(userInfo, authToken);
    setActivePage('home');
    
    // Keep legacy storage for backward compatibility
    localStorage.setItem('cryptoHubUser', JSON.stringify(userInfo));
    localStorage.setItem('userId', userInfo.id);
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setActivePage('earn');
  };

  const handleLogout = () => {
    logout();
    setActivePage('home');
    
    // Clear legacy storage
    localStorage.removeItem('cryptoHubUser');
    localStorage.removeItem('userId');
  };

  const renderPage = () => {
    if (!isLoggedIn) {
      if (authMode === 'login') {
        return (
          <Login
            onLogin={handleLogin}
            onSwitchToSignup={() => setAuthMode('signup')}
          />
        );
      } else {
        return (
          <Signup
            onSignup={handleSignup}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        );
      }
    }

    // Admin routes
    if (activePage.startsWith('admin-')) {
      const adminPage = activePage.replace('admin-', '');
      let adminContent;

      switch (adminPage) {
        case 'home':
          adminContent = <AdminHome />;
          break;
        case 'users':
          adminContent = <AdminUsers />;
          break;
        case 'tasks':
          adminContent = <AdminTasks />;
          break;
        case 'transactions':
          adminContent = <AdminTransactions />;
          break;
        case 'ventures':
          adminContent = <AdminVentures />;
          break;
        case 'settings':
          adminContent = <AdminSettings />;
          break;
        default:
          adminContent = <AdminHome />;
      }

      return (
        <AdminLayout activePage={activePage} setActivePage={setActivePage}>
          {adminContent}
        </AdminLayout>
      );
    }

    // Regular user routes
    switch (activePage) {
      case 'home':
        return <Home setActivePage={setActivePage} onProjectSelect={handleProjectSelect} />;
      case 'products':
        return <Game />;
      case 'earn':
        return <Earn selectedProject={selectedProject} />;
      case 'wallet':
        return <Trade />;
      case 'investment':
        return <Investment />;
      case 'mine':
        return <Mine />;
      case 'profile':
        return <Mine />;
      default:
        return <Home setActivePage={setActivePage} onProjectSelect={handleProjectSelect} />;
    }
  };

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} isLoggedIn={isLoggedIn} />
      <main>
        {renderPage()}
      </main>
      {isLoggedIn && (
        <>
          <Footer activePage={activePage} setActivePage={setActivePage} />
          <BottomNav activePage={activePage} setActivePage={setActivePage} />
        </>
      )}
      <Chatbot />
    </div>
  );
}

// Main App Component (wraps with AuthProvider)
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
