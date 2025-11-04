import React, { useState, useEffect, useRef } from 'react';

const Game = () => {
  // Marketing Game State
  const [gameActive, setGameActive] = useState(false);
  const [budget, setBudget] = useState(10000);
  const [reputation, setReputation] = useState(50);
  const [clients, setClients] = useState([]);
  const [time, setTime] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [marketTrend, setMarketTrend] = useState('bullish');
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [officeLevel, setOfficeLevel] = useState(1);
  const [gameStats, setGameStats] = useState({
    totalCampaigns: 0,
    successfulCampaigns: 0,
    totalRevenue: 0,
    clientsServed: 0
  });

  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Game Data
  const availableCryptos = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC', volatility: 0.1, color: '#f7931a' },
    { id: 2, name: 'Ethereum', symbol: 'ETH', volatility: 0.15, color: '#627eea' },
    { id: 3, name: 'Litecoin', symbol: 'LTC', volatility: 0.2, color: '#bfbbbb' },
    { id: 4, name: 'Cardano', symbol: 'ADA', volatility: 0.25, color: '#0033ad' },
    { id: 5, name: 'Polkadot', symbol: 'DOT', volatility: 0.3, color: '#e6007a' }
  ];

  const campaignTypes = [
    { id: 1, name: 'Social Media Blast', cost: 1000, duration: 7, baseEffectiveness: 0.3, color: '#3498db' },
    { id: 2, name: 'Influencer Partnership', cost: 5000, duration: 14, baseEffectiveness: 0.6, color: '#9b59b6' },
    { id: 3, name: 'PR Campaign', cost: 3000, duration: 10, baseEffectiveness: 0.4, color: '#2ecc71' },
    { id: 4, name: 'Community Building', cost: 2000, duration: 21, baseEffectiveness: 0.5, color: '#f1c40f' },
    { id: 5, name: 'Exchange Listing Push', cost: 10000, duration: 30, baseEffectiveness: 0.8, color: '#e74c3c' }
  ];

  const employeeTypes = [
    { id: 1, name: 'Junior Marketer', salary: 2000, skill: 0.3, hiringCost: 5000, color: '#3498db' },
    { id: 2, name: 'Social Media Manager', salary: 3000, skill: 0.4, hiringCost: 7000, color: '#9b59b6' },
    { id: 3, name: 'Content Creator', salary: 4000, skill: 0.5, hiringCost: 10000, color: '#2ecc71' },
    { id: 4, name: 'Marketing Strategist', salary: 6000, skill: 0.7, hiringCost: 15000, color: '#f1c40f' },
    { id: 5, name: 'Crypto Influencer', salary: 10000, skill: 0.9, hiringCost: 30000, color: '#e74c3c' }
  ];

  // Initialize Game
  useEffect(() => {
    if (gameActive) {
      initializeCryptoPrices();
      startGameLoop();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameActive]);

  // Game Time Simulation
  useEffect(() => {
    let gameTimer;
    if (gameActive) {
      gameTimer = setInterval(() => {
        setTime(prev => prev + 1);
        updateGameState();
      }, 2000); // Each 2 seconds represents 1 day in game time
    }
    return () => clearInterval(gameTimer);
  }, [gameActive, activeCampaigns, employees]);

  // Crypto Price Simulation
  useEffect(() => {
    const priceTimer = setInterval(() => {
      updateCryptoPrices();
    }, 3000);
    return () => clearInterval(priceTimer);
  }, [marketTrend]);

  const initializeCryptoPrices = () => {
    const initialPrices = {};
    availableCryptos.forEach(crypto => {
      initialPrices[crypto.symbol] = 1000 * (1 + Math.random() * 10);
    });
    setCryptoPrices(initialPrices);
  };

  const updateCryptoPrices = () => {
    setCryptoPrices(prev => {
      const newPrices = { ...prev };
      Object.keys(newPrices).forEach(symbol => {
        const crypto = availableCryptos.find(c => c.symbol === symbol);
        const trendMultiplier = marketTrend === 'bullish' ? 1.01 : 0.99;
        const randomChange = 1 + (Math.random() - 0.5) * crypto.volatility;
        newPrices[symbol] *= trendMultiplier * randomChange;
        newPrices[symbol] = Math.max(newPrices[symbol], 10); // Minimum price
      });
      return newPrices;
    });
  };

  const startGameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const render = () => {
      if (!gameActive) return;
      drawGame(ctx);
      animationRef.current = requestAnimationFrame(render);
    };
    render();
  };

  const drawGame = (ctx) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw office building
    drawOffice(ctx, width, height);

    // Draw employees
    drawEmployees(ctx);

    // Draw active campaigns
    drawCampaigns(ctx);

    // Draw market data
    drawMarketData(ctx, width);

    // Draw UI elements
    drawUI(ctx, width, height);
  };

  const drawOffice = (ctx, width, height) => {
    // Office building
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(width * 0.1, height * 0.4, width * 0.3, height * 0.5);

    // Windows
    ctx.fillStyle = '#f1c40f';
    for (let floor = 0; floor < officeLevel; floor++) {
      for (let window = 0; window < 3; window++) {
        ctx.fillRect(
          width * 0.15 + window * 40,
          height * 0.45 + floor * 50,
          25, 30
        );
      }
    }

    // Sign
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(width * 0.1, height * 0.35, width * 0.3, 30);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CRYPTO MARKETING AGENCY', width * 0.25, height * 0.375);
  };

  const drawEmployees = (ctx) => {
    employees.forEach((employee, index) => {
      const x = 400 + (index % 4) * 80;
      const y = 300 + Math.floor(index / 4) * 100;

      // Employee circle
      ctx.fillStyle = employee.isWorking ? '#27ae60' : '#95a5a6';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Employee name
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(employee.name.split(' ')[0], x, y + 35);
    });
  };

  const drawCampaigns = (ctx) => {
    activeCampaigns.forEach((campaign, index) => {
      const x = 100 + (index * 120);
      const y = 150;

      const campaignType = campaignTypes.find(ct => ct.id === campaign.campaignTypeId);
      const crypto = availableCryptos.find(c => c.id === campaign.cryptoId);

      // Campaign visualization
      ctx.fillStyle = campaignType.color;
      for (let i = 0; i < 8; i++) {
        const angle = (Date.now() * 0.001 + i * 0.5) % (Math.PI * 2);
        const particleX = x + Math.cos(angle) * 25;
        const particleY = y + Math.sin(angle) * 25;
        
        ctx.beginPath();
        ctx.arc(particleX, particleY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Progress bar
      ctx.fillStyle = '#34495e';
      ctx.fillRect(x - 30, y + 40, 60, 8);
      ctx.fillStyle = campaignType.color;
      ctx.fillRect(x - 30, y + 40, 60 * campaign.progress, 8);

      // Campaign info
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(campaignType.name, x, y + 65);
      ctx.fillText(`${Math.floor(campaign.progress * 100)}%`, x, y + 80);
    });
  };

  const drawMarketData = (ctx, width) => {
    // Market trend indicator
    ctx.fillStyle = marketTrend === 'bullish' ? '#27ae60' : '#e74c3c';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`MARKET: ${marketTrend.toUpperCase()}`, width - 200, 30);

    // Crypto prices
    let yOffset = 60;
    availableCryptos.forEach(crypto => {
      const price = cryptoPrices[crypto.symbol];
      ctx.fillStyle = crypto.color;
      ctx.fillText(`${crypto.symbol}: $${price ? price.toFixed(2) : '0.00'}`, width - 200, yOffset);
      yOffset += 20;
    });
  };

  const drawUI = (ctx, width, height) => {
    // Stats overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 200, 120);

    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Budget: $${budget.toLocaleString()}`, 20, 30);
    ctx.fillText(`Reputation: ${reputation}/100`, 20, 50);
    ctx.fillText(`Day: ${time}`, 20, 70);
    ctx.fillText(`Office Level: ${officeLevel}`, 20, 90);
    ctx.fillText(`Active Campaigns: ${activeCampaigns.length}`, 20, 110);
  };

  const updateGameState = () => {
    // Update campaign progress
    setActiveCampaigns(prev => 
      prev.map(campaign => {
        const progress = campaign.progress + (1 / campaign.duration);
        if (progress >= 1) {
          completeCampaign(campaign);
          return null;
        }
        return { ...campaign, progress };
      }).filter(Boolean)
    );

    // Pay salaries every 30 days
    if (time % 30 === 0 && time > 0) {
      paySalaries();
    }

    // Random events
    if (Math.random() < 0.1) {
      triggerRandomEvent();
    }

    // Generate new clients
    if (Math.random() < 0.15 && clients.length < 3 + officeLevel) {
      generateNewClient();
    }
  };

  const startGame = () => {
    setGameActive(true);
    setBudget(10000);
    setReputation(50);
    setTime(0);
    setClients([]);
    setEmployees([]);
    setActiveCampaigns([]);
    setGameStats({
      totalCampaigns: 0,
      successfulCampaigns: 0,
      totalRevenue: 0,
      clientsServed: 0
    });
    setOfficeLevel(1);
    setMarketTrend('bullish');
  };

  const hireEmployee = (employeeType) => {
    if (budget >= employeeType.hiringCost) {
      const newEmployee = {
        id: Date.now(),
        name: employeeType.name,
        type: employeeType.id,
        salary: employeeType.salary,
        skill: employeeType.skill,
        isWorking: false,
        color: employeeType.color
      };
      setEmployees(prev => [...prev, newEmployee]);
      setBudget(prev => prev - employeeType.hiringCost);
    }
  };

  const createCampaign = (clientId, campaignTypeId) => {
    const client = clients.find(c => c.id === clientId);
    const campaignType = campaignTypes.find(ct => ct.id === campaignTypeId);

    if (!client || budget < campaignType.cost) return;

    const availableEmployee = employees.find(emp => !emp.isWorking);
    const successChance = calculateSuccessChance(campaignType, client, availableEmployee);

    const newCampaign = {
      id: Date.now(),
      clientId,
      campaignTypeId,
      cryptoId: client.cryptoId,
      progress: 0,
      duration: campaignType.duration,
      budget: campaignType.cost,
      potentialReward: campaignType.cost * (2 + Math.random()),
      successChance,
      assignedEmployee: availableEmployee?.id || null
    };

    setActiveCampaigns(prev => [...prev, newCampaign]);
    setBudget(prev => prev - campaignType.cost);

    if (availableEmployee) {
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === availableEmployee.id 
            ? { ...emp, isWorking: true }
            : emp
        )
      );
    }

    setGameStats(prev => ({
      ...prev,
      totalCampaigns: prev.totalCampaigns + 1
    }));
  };

  const calculateSuccessChance = (campaignType, client, employee) => {
    let chance = campaignType.baseEffectiveness;
    if (employee) chance += employee.skill * 0.3;
    chance *= (client.reputation / 100);
    chance *= marketTrend === 'bullish' ? 1.2 : 0.8;
    return Math.min(chance, 0.95);
  };

  const completeCampaign = (campaign) => {
    const success = Math.random() < campaign.successChance;
    const reward = success ? campaign.potentialReward : 0;

    setBudget(prev => prev + reward);
    setReputation(prev => Math.min(prev + (success ? 5 : -2), 100));

    if (campaign.assignedEmployee) {
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === campaign.assignedEmployee 
            ? { ...emp, isWorking: false }
            : emp
        )
      );
    }

    setGameStats(prev => ({
      ...prev,
      successfulCampaigns: prev.successfulCampaigns + (success ? 1 : 0),
      totalRevenue: prev.totalRevenue + reward
    }));
  };

  const paySalaries = () => {
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    setBudget(prev => prev - totalSalary);
  };

  const generateNewClient = () => {
    const crypto = availableCryptos[Math.floor(Math.random() * availableCryptos.length)];
    const newClient = {
      id: Date.now(),
      name: `Client ${clients.length + 1}`,
      cryptoId: crypto.id,
      budget: Math.floor(Math.random() * 15000) + 5000,
      reputation: Math.floor(Math.random() * 40) + 30
    };
    setClients(prev => [...prev, newClient]);
    setGameStats(prev => ({
      ...prev,
      clientsServed: prev.clientsServed + 1
    }));
  };

  const triggerRandomEvent = () => {
    const events = [
      {
        type: 'market_shift',
        message: 'Market sentiment has shifted!',
        effect: () => setMarketTrend(prev => prev === 'bullish' ? 'bearish' : 'bullish')
      },
      {
        type: 'viral_campaign',
        message: 'One of your campaigns went viral!',
        effect: () => {
          setReputation(prev => Math.min(prev + 10, 100));
          setBudget(prev => prev + 2000);
        }
      },
      {
        type: 'employee_boost',
        message: 'Your employees are working efficiently!',
        effect: () => {
          setEmployees(prev => prev.map(emp => ({ ...emp, skill: emp.skill * 1.1 })));
        }
      }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    event.effect();
    // In a real implementation, you'd show this message to the user
    console.log(`Event: ${event.message}`);
  };

  const upgradeOffice = () => {
    const cost = officeLevel * 20000;
    if (budget >= cost) {
      setOfficeLevel(prev => prev + 1);
      setBudget(prev => prev - cost);
      setReputation(prev => Math.min(prev + 10, 100));
    }
  };

  const fireEmployee = (employeeId) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  return (
    <section id="game" className="page">
      <div className="container">
        <h2 className="page-title">Crypto Marketing Simulator</h2>
        <p className="page-subtitle">Build your crypto marketing empire in real-time!</p>

        {!gameActive ? (
          <div className="game-menu">
            <div className="game-card">
              <h3>Marketing Agency Simulator</h3>
              <p>Start your own crypto marketing agency! Hire staff, run campaigns, and grow your business in real-time.</p>
              <div className="game-features">
                <div>• Real-time 3D visualization</div>
                <div>• Dynamic crypto market</div>
                <div>• Employee management</div>
                <div>• Campaign strategy</div>
                <div>• Client acquisition</div>
              </div>
              <button className="btn btn-primary" onClick={startGame}>
                Start Marketing Game
              </button>
            </div>
          </div>
        ) : (
          <div className="marketing-game">
            <div className="game-header">
              <div className="game-stats">
                <div className="stat-item">
                  <span>Budget:</span>
                  <span className="stat-value">${budget.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span>Reputation:</span>
                  <span className="stat-value">{reputation}/100</span>
                </div>
                <div className="stat-item">
                  <span>Day:</span>
                  <span className="stat-value">{time}</span>
                </div>
                <div className="stat-item">
                  <span>Office Level:</span>
                  <span className="stat-value">{officeLevel}</span>
                </div>
              </div>
              <button className="btn btn-secondary" onClick={() => setGameActive(false)}>
                Exit Game
              </button>
            </div>

            <div className="game-content">
              <div className="simulation-area">
                <canvas 
                  ref={canvasRef}
                  width={800}
                  height={500}
                  className="game-canvas"
                />
              </div>

              <div className="control-panel">
                <div className="control-section">
                  <h4>Office Management</h4>
                  <button 
                    className="btn"
                    onClick={upgradeOffice}
                    disabled={budget < officeLevel * 20000}
                  >
                    Upgrade Office (${officeLevel * 20000})
                  </button>
                </div>

                <div className="control-section">
                  <h4>Hire Employees</h4>
                  <div className="employee-options">
                    {employeeTypes.map(emp => (
                      <button
                        key={emp.id}
                        className="btn employee-btn"
                        onClick={() => hireEmployee(emp)}
                        disabled={budget < emp.hiringCost}
                      >
                        <div>{emp.name}</div>
                        <div>Skill: {(emp.skill * 100).toFixed(0)}%</div>
                        <div>Cost: ${emp.hiringCost}</div>
                        <div>Salary: ${emp.salary}/month</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-section">
                  <h4>Current Employees</h4>
                  <div className="employees-list">
                    {employees.map(emp => (
                      <div key={emp.id} className="employee-item">
                        <span>{emp.name}</span>
                        <span>{emp.isWorking ? 'Working' : 'Available'}</span>
                        <button 
                          className="btn btn-small"
                          onClick={() => fireEmployee(emp.id)}
                        >
                          Fire
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="control-section">
                  <h4>Available Clients</h4>
                  <div className="clients-list">
                    {clients.map(client => {
                      const crypto = availableCryptos.find(c => c.id === client.cryptoId);
                      return (
                        <div key={client.id} className="client-item">
                          <div className="client-info">
                            <strong>{client.name}</strong>
                            <span>Promoting: {crypto?.name}</span>
                            <span>Budget: ${client.budget}</span>
                            <span>Reputation: {client.reputation}</span>
                          </div>
                          <div className="campaign-options">
                            {campaignTypes.map(campaign => (
                              <button
                                key={campaign.id}
                                className="btn btn-small"
                                onClick={() => createCampaign(client.id, campaign.id)}
                                disabled={budget < campaign.cost}
                              >
                                {campaign.name} (${campaign.cost})
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="control-section">
                  <h4>Active Campaigns</h4>
                  <div className="campaigns-list">
                    {activeCampaigns.map(campaign => {
                      const campaignType = campaignTypes.find(ct => ct.id === campaign.campaignTypeId);
                      const crypto = availableCryptos.find(c => c.id === campaign.cryptoId);
                      return (
                        <div key={campaign.id} className="campaign-item">
                          <div className="campaign-header">
                            <strong>{campaignType?.name}</strong>
                            <span>for {crypto?.name}</span>
                          </div>
                          <div className="campaign-progress">
                            <div 
                              className="progress-bar"
                              style={{ width: `${campaign.progress * 100}%` }}
                            />
                          </div>
                          <div className="campaign-stats">
                            <span>Success: {(campaign.successChance * 100).toFixed(1)}%</span>
                            <span>Reward: ${campaign.potentialReward.toFixed(0)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="game-stats-panel">
              <h4>Business Statistics</h4>
              <div className="stats-grid">
                <div className="stat-card">
                  <span>Total Campaigns</span>
                  <strong>{gameStats.totalCampaigns}</strong>
                </div>
                <div className="stat-card">
                  <span>Successful Campaigns</span>
                  <strong>{gameStats.successfulCampaigns}</strong>
                </div>
                <div className="stat-card">
                  <span>Total Revenue</span>
                  <strong>${gameStats.totalRevenue.toFixed(0)}</strong>
                </div>
                <div className="stat-card">
                  <span>Clients Served</span>
                  <strong>{gameStats.clientsServed}</strong>
                </div>
                <div className="stat-card">
                  <span>Success Rate</span>
                  <strong>
                    {gameStats.totalCampaigns > 0 
                      ? ((gameStats.successfulCampaigns / gameStats.totalCampaigns) * 100).toFixed(1)
                      : '0'}%
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .marketing-game {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #2c3e50;
          border-radius: 10px;
          color: white;
        }

        .game-stats {
          display: flex;
          gap: 30px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-weight: bold;
          font-size: 1.2em;
          color: #f1c40f;
        }

        .game-content {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 20px;
        }

        .simulation-area {
          background: #1a1a2e;
          border-radius: 10px;
          overflow: hidden;
        }

        .game-canvas {
          width: 100%;
          height: 500px;
          display: block;
        }

        .control-panel {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-height: 500px;
          overflow-y: auto;
        }

        .control-section {
          background: #34495e;
          padding: 15px;
          border-radius: 8px;
          color: white;
        }

        .control-section h4 {
          margin: 0 0 10px 0;
          color: #f1c40f;
        }

        .employee-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .employee-btn {
          font-size: 0.9em;
          padding: 8px;
          text-align: left;
        }

        .employees-list,
        .clients-list,
        .campaigns-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .employee-item,
        .client-item,
        .campaign-item {
          background: #2c3e50;
          padding: 10px;
          border-radius: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .client-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .campaign-options {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .campaign-progress {
          width: 100%;
          height: 8px;
          background: #7f8c8d;
          border-radius: 4px;
          margin: 5px 0;
        }

        .progress-bar {
          height: 100%;
          background: #27ae60;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .campaign-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.9em;
        }

        .game-stats-panel {
          background: #34495e;
          padding: 15px;
          border-radius: 10px;
          color: white;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 10px;
        }

        .stat-card {
          background: #2c3e50;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }

        .stat-card strong {
          display: block;
          font-size: 1.5em;
          color: #f1c40f;
          margin-top: 5px;
        }

        .btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .btn:hover:not(:disabled) {
          background: #2980b9;
        }

        .btn:disabled {
          background: #7f8c8d;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #e74c3c;
        }

        .btn-primary:hover {
          background: #c0392b;
        }

        .btn-secondary {
          background: #95a5a6;
        }

        .btn-small {
          padding: 5px 10px;
          font-size: 0.8em;
        }
      `}</style>
    </section>
  );
};

export default Game;