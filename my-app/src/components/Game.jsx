import React, { useState, useEffect, useRef } from 'react';
import './game.css';
import { gameApi, userApi } from '../services/api';

const Game = () => {
  // Game state
  const [multiplier, setMultiplier] = useState(1);
  const [crashed, setCrashed] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [balance, setBalance] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [cashInAmount, setCashInAmount] = useState(100);
  const [history, setHistory] = useState([]);
  const [personalHistory, setPersonalHistory] = useState([]);
  const [planePosition, setPlanePosition] = useState({ x: 50, y: 0 });
  const [chartBars, setChartBars] = useState([]);

  // Refs
  
  const intervalRef = useRef(null);
  const chartContainerRef = useRef(null);
  const multiplierRef = useRef(1);

  // Online players data
  const [players, setPlayers] = useState([
    { name: 'Loading...', bet: 0 },
    { name: 'Loading...', bet: 0 },
    { name: 'Loading...', bet: 0 },
    { name: 'Loading...', bet: 0 },
    { name: 'Loading...', bet: 0 },
    { name: 'Loading...', bet: 0 }
  ]);

  // Initialize game
  useEffect(() => {
    // Fetch user balance and players data
    const fetchData = async () => {
      try {
        // Fetch user balance
        const balanceResponse = await userApi.getBalance();
        setBalance(balanceResponse.balance);

        // Fetch real players data
        const playersResponse = await gameApi.getPlayers();
        setPlayers(playersResponse.players);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Keep default loading state if API fails
      }
    };

    fetchData();

    // Add initial history
    updateHistory(2.5);
    updateHistory(1.8);
    updateHistory(3.2);
    updateHistory(1.3);
    updateHistory(4.1);

    // Add initial personal history
    addPersonalHistory(2.1, 210, true);
    addPersonalHistory(1.5, 0, false);
    addPersonalHistory(3.7, 370, true);
    addPersonalHistory(1.2, 0, false);
    addPersonalHistory(2.8, 280, true);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update crash history
  const updateHistory = (value) => {
    setHistory(prev => {
      const newHistory = [...prev, value];
      return newHistory.length > 10 ? newHistory.slice(1) : newHistory;
    });
  };

  // Add personal history record
  const addPersonalHistory = (multiplierValue, amount, isWin) => {
    const record = {
      multiplier: multiplierValue,
      amount: amount,
      isWin: isWin,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setPersonalHistory(prev => {
      const newHistory = [record, ...prev];
      return newHistory.length > 20 ? newHistory.slice(0, 20) : newHistory;
    });
  };

  // Start a new round
  const startRound = () => {
    const cashIn = parseInt(cashInAmount);

    if (isNaN(cashIn) || cashIn <= 0 || cashIn > balance) {
      alert("Invalid cash-in amount!");
      return;
    }

    setCurrentBet(cashIn);
    setMultiplier(1);
    multiplierRef.current = 1;
    setCrashed(false);
    setGameActive(true);
    setPlanePosition({ x: 50, y: 0 });
    setChartBars([]);

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start game loop
    intervalRef.current = setInterval(updateGame, 100);
  };

  // Update game state
  const updateGame = () => {
    // Random crash chance increases with multiplier
    const crashChance = Math.min(0.02 + (multiplierRef.current * 0.005), 0.2);

    if (Math.random() < crashChance) {
      // Game crashed
      handleCrash();
    } else {
      // Continue game
      const newMultiplier = multiplierRef.current + 0.1;
      multiplierRef.current = newMultiplier;
      setMultiplier(newMultiplier);

      // Update plane position
      setPlanePosition(prev => {
        const simulationHeight = window.innerHeight - 200; // Approximate height
        const waveHeight = 100;
        const maxPlaneY = simulationHeight - waveHeight - 80; // Plane height

        const newY = Math.min(prev.y + 4, maxPlaneY);
        return { x: prev.x + 2, y: newY };
      });

      // Add chart bar
      setChartBars(prev => {
        const newBar = {
          id: Date.now() + Math.random(),
          height: Math.min(newMultiplier * 10, 100)
        };
        const newBars = [...prev, newBar];

        // Limit bars to prevent performance issues
        return newBars.length > 300 ? newBars.slice(1) : newBars;
      });
    }
  };

  // Handle crash
  const handleCrash = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setCrashed(true);
    setGameActive(false);

    // Update local balance immediately for better UX
    setBalance(prev => prev - currentBet);

    try {
      // Update balance on backend
      await gameApi.updateBalance(currentBet, 'loss', `Crash game loss at ${multiplierRef.current.toFixed(2)}x`);
    } catch (error) {
      console.error('Failed to update balance for loss:', error);
      // Balance already updated locally, so no need to revert
    }

    // Add to history
    updateHistory(multiplierRef.current);
    addPersonalHistory(multiplierRef.current, currentBet, false);

    // Show crash message after a short delay
    setTimeout(() => {
      alert(`Crashed at ${multiplierRef.current.toFixed(2)}x! You lost: $${currentBet}`);
    }, 500);
  };

  // Cash Out
  const cashOut = async () => {
    if (gameActive && !crashed && intervalRef.current) {
      clearInterval(intervalRef.current);
      setGameActive(false);

      const winAmount = currentBet * multiplierRef.current;

      // Update local balance immediately for better UX
      setBalance(prev => prev + winAmount);

      try {
        // Update balance on backend
        await gameApi.updateBalance(winAmount, 'win', `Crash game win at ${multiplierRef.current.toFixed(2)}x`);
      } catch (error) {
        console.error('Failed to update balance for win:', error);
        // Balance already updated locally, so no need to revert
      }

      // Add to history
      updateHistory(multiplierRef.current);
      addPersonalHistory(multiplierRef.current, winAmount - currentBet, true);

      alert(`Cashed out at ${multiplierRef.current.toFixed(2)}x! Won: $${winAmount.toFixed(2)}`);
    }
  };

  // Handle input change
  const handleCashInAmountChange = (e) => {
    setCashInAmount(e.target.value);
  };

  return (
    <div className="container">
      {/* Left Sidebar - Players */}
      <div className="sidebar">
        <h3>Online Players</h3>
        <div className="user-list">
          {players.map((player, index) => (
            <div key={index} className="user">
              <span>{player.name}</span>
              <span className="bet">${player.bet}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Navbar */}
        <div className="navbar">
          <div className="history-container">
            <span className="history-label">Crash History:</span>
            <div className="history">
              {history.map((item, index) => (
                <div key={index} className="history-item">
                  {item.toFixed(2)}x
                </div>
              ))}
            </div>
          </div>
          <div className="balance-container">
            <div className="balance">Balance: ${balance.toFixed(2)}</div>
          </div>
        </div>

        {/* Simulation Area */}
        <div className="simulation">
          <div className={`multiplier-display ${multiplier > 3 ? 'warning' : ''}`}>
            {multiplier.toFixed(2)}x
          </div>
          
          <div 
            className="plane"
            style={{
              bottom: `${planePosition.y}px`,
              left: `${planePosition.x}px`
            }}
          />
          
          <div className="wave" />
          
          <div className="chart" ref={chartContainerRef}>
            {chartBars.map(bar => (
              <div 
                key={bar.id}
                className="bar"
                style={{ height: `${bar.height}%` }}
              />
            ))}
          </div>
          
          {/* Background clouds */}
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
        </div>

        {/* Bottom Panel */}
        <div className="bottom-panel">
          <input 
            type="number" 
            className="cash-in-amount" 
            placeholder="Amount" 
            value={cashInAmount}
            onChange={handleCashInAmountChange}
            min="1"
            disabled={gameActive}
          />
          <button 
            className="cash-in-btn"
            onClick={startRound}
            disabled={gameActive}
          >
            Cash In
          </button>
          <button 
            className="cash-out-btn"
            onClick={cashOut}
            disabled={!gameActive}
          >
            Cash Out
          </button>
        </div>
      </div>

      {/* Right Sidebar - Personal History */}
      <div className="history-sidebar">
        <h3>My History</h3>
        <div className="personal-history">
          {personalHistory.map((record, index) => (
            <div 
              key={index} 
              className={`history-record ${record.isWin ? 'win' : 'loss'}`}
            >
              <div>
                <div className="multiplier">{record.multiplier.toFixed(2)}x</div>
                <div className="timestamp">{record.timestamp}</div>
              </div>
              <div>
                <div className="amount">
                  {record.isWin ? '+' : '-'}${Math.abs(record.amount).toFixed(2)}
                </div>
                <div className="result">
                  {record.isWin ? 'WIN' : 'LOSS'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;