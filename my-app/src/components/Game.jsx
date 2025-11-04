import React, { useState, useEffect } from 'react';

const Game = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [gameMode, setGameMode] = useState('click'); // 'click', 'memory', 'number', 'rps', 'quiz'
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [level, setLevel] = useState(1);

  // New game states
  const [guessNumber, setGuessNumber] = useState('');
  const [targetNumber, setTargetNumber] = useState(null);
  const [guessCount, setGuessCount] = useState(0);
  const [rpsChoice, setRpsChoice] = useState('');
  const [computerChoice, setComputerChoice] = useState('');
  const [rpsResult, setRpsResult] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [quizScore, setQuizScore] = useState(0);

  // Statistics
  const [gameStats, setGameStats] = useState({
    clickGame: { played: 0, wins: 0, losses: 0, earnings: 0 },
    memoryGame: { played: 0, wins: 0, losses: 0, earnings: 0 },
    numberGame: { played: 0, wins: 0, losses: 0, earnings: 0 },
    rpsGame: { played: 0, wins: 0, losses: 0, earnings: 0 },
    quizGame: { played: 0, wins: 0, losses: 0, earnings: 0 }
  });

  const [gameHistory, setGameHistory] = useState([]);

  // Quiz questions
  const quizQuestions = [
    {
      question: "What is Bitcoin?",
      options: ["A physical coin", "A digital currency", "A video game", "A social network"],
      correct: 1
    },
    {
      question: "What does BTC stand for?",
      options: ["Bitcoin Token", "Bitcoin Cash", "Bitcoin Core", "Bitcoin Trade"],
      correct: 2
    },
    {
      question: "What is cryptocurrency mining?",
      options: ["Growing crops", "Solving math problems", "Trading stocks", "Writing code"],
      correct: 1
    },
    {
      question: "What is a blockchain?",
      options: ["A type of bicycle", "A digital ledger", "A computer virus", "A programming language"],
      correct: 1
    },
    {
      question: "What is the maximum supply of Bitcoin?",
      options: ["10 million", "21 million", "100 million", "Unlimited"],
      correct: 1
    }
  ];

  // Timer for click game
  useEffect(() => {
    let timer;
    if (gameActive && gameMode === 'click' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, gameMode]);

  // Move target randomly for click game
  useEffect(() => {
    if (gameActive && gameMode === 'click') {
      const moveTarget = setInterval(() => {
        setTargetPosition({
          x: Math.random() * 80 + 10, // Keep within bounds
          y: Math.random() * 80 + 10
        });
      }, 1000);
      return () => clearInterval(moveTarget);
    }
  }, [gameActive, gameMode]);

  const startClickGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setGameMode('click');
  };

  const startMemoryGame = () => {
    setScore(0);
    setLevel(1);
    setSequence([]);
    setPlayerSequence([]);
    setGameActive(true);
    setGameMode('memory');
    generateSequence(1);
  };

  const startNumberGame = () => {
    setGuessNumber('');
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuessCount(0);
    setGameActive(true);
    setGameMode('number');
  };

  const startRPSGame = () => {
    setRpsChoice('');
    setComputerChoice('');
    setRpsResult('');
    setGameActive(true);
    setGameMode('rps');
  };

  const startQuizGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setQuizScore(0);
    setGameActive(true);
    setGameMode('quiz');
  };

  const generateSequence = (currentLevel) => {
    const newSequence = [];
    for (let i = 0; i < currentLevel + 2; i++) {
      newSequence.push(Math.floor(Math.random() * 9));
    }
    setSequence(newSequence);
    setPlayerSequence([]);
    showSequence(newSequence);
  };

  const showSequence = (seq) => {
    setShowingSequence(true);
    seq.forEach((num, index) => {
      setTimeout(() => {
        // Highlight the button
        const button = document.getElementById(`memory-btn-${num}`);
        if (button) {
          button.style.backgroundColor = '#ff6d00';
          setTimeout(() => {
            button.style.backgroundColor = '';
          }, 500);
        }
      }, index * 600);
    });
    setTimeout(() => {
      setShowingSequence(false);
    }, seq.length * 600);
  };

  const handleTargetClick = () => {
    if (gameActive && gameMode === 'click') {
      setScore(prev => prev + 10);
      setTargetPosition({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      });
    }
  };

  const handleMemoryClick = (index) => {
    if (showingSequence || !gameActive || gameMode !== 'memory') return;

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    // Check if current click matches sequence
    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      // Wrong sequence
      setGameActive(false);
      return;
    }

    // Check if sequence is complete
    if (newPlayerSequence.length === sequence.length) {
      setScore(prev => prev + level * 100);
      setLevel(prev => prev + 1);
      setTimeout(() => {
        generateSequence(level + 1);
      }, 1000);
    }
  };

  const handleNumberGuess = () => {
    const guess = parseInt(guessNumber);
    if (guess === targetNumber) {
      const earnings = (10 - guessCount) * 0.001; // More guesses = less reward
      updateGameStats('numberGame', true, earnings);
      setGameActive(false);
    } else {
      setGuessCount(prev => prev + 1);
      if (guessCount >= 9) {
        updateGameStats('numberGame', false, 0);
        setGameActive(false);
      }
    }
    setGuessNumber('');
  };

  const handleRPSChoice = (choice) => {
    const choices = ['rock', 'paper', 'scissors'];
    const computer = choices[Math.floor(Math.random() * 3)];
    setRpsChoice(choice);
    setComputerChoice(computer);

    let result = '';
    let win = false;

    if (choice === computer) {
      result = "It's a tie!";
    } else if (
      (choice === 'rock' && computer === 'scissors') ||
      (choice === 'paper' && computer === 'rock') ||
      (choice === 'scissors' && computer === 'paper')
    ) {
      result = 'You win!';
      win = true;
    } else {
      result = 'You lose!';
    }

    setRpsResult(result);
    updateGameStats('rpsGame', win, win ? 0.001 : 0);
    setTimeout(() => setGameActive(false), 2000);
  };

  const handleQuizAnswer = () => {
    const correct = selectedAnswer == quizQuestions[currentQuestion].correct;
    if (correct) {
      setQuizScore(prev => prev + 1);
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer('');
    } else {
      // Quiz finished
      const win = quizScore >= 3; // Win if 3+ correct answers
      const earnings = win ? quizScore * 0.002 : 0;
      updateGameStats('quizGame', win, earnings);
      setGameActive(false);
    }
  };

  const updateGameStats = (gameType, win, earnings) => {
    setGameStats(prev => ({
      ...prev,
      [gameType]: {
        played: prev[gameType].played + 1,
        wins: prev[gameType].wins + (win ? 1 : 0),
        losses: prev[gameType].losses + (win ? 0 : 1),
        earnings: prev[gameType].earnings + earnings
      }
    }));

    setGameHistory(prev => [...prev, {
      game: gameType,
      result: win ? 'Win' : 'Loss',
      earnings: earnings,
      timestamp: new Date().toLocaleString()
    }]);
  };

  const resetGame = () => {
    setGameActive(false);
    setScore(0);
    setTimeLeft(30);
    setLevel(1);
    setSequence([]);
    setPlayerSequence([]);
    setShowingSequence(false);
    setGuessNumber('');
    setTargetNumber(null);
    setGuessCount(0);
    setRpsChoice('');
    setComputerChoice('');
    setRpsResult('');
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setQuizScore(0);
  };

  return (
    <section id="game" className="page">
      <div className="container">
        <h2 className="page-title">Crypto Games</h2>
        <p className="page-subtitle">Play games and earn crypto rewards</p>

        {!gameActive ? (
          <div className="game-menu">
            <div className="game-options">
              <div className="game-card">
                <h3>Click Challenge</h3>
                <p>Click the moving target as many times as possible in 30 seconds!</p>
                <div className="game-reward">Reward: 0.001 BTC per 100 points</div>
                <button className="btn" onClick={startClickGame}>Start Click Game</button>
              </div>

              <div className="game-card">
                <h3>Memory Master</h3>
                <p>Remember and repeat the sequence of highlighted buttons!</p>
                <div className="game-reward">Reward: 0.002 BTC per level</div>
                <button className="btn" onClick={startMemoryGame}>Start Memory Game</button>
              </div>

              <div className="game-card">
                <h3>Number Guessing</h3>
                <p>Guess the number between 1-100 in 10 tries or less!</p>
                <div className="game-reward">Reward: 0.001 BTC (fewer guesses = more reward)</div>
                <button className="btn" onClick={startNumberGame}>Start Number Game</button>
              </div>

              <div className="game-card">
                <h3>Rock Paper Scissors</h3>
                <p>Beat the computer in this classic game!</p>
                <div className="game-reward">Reward: 0.001 BTC per win</div>
                <button className="btn" onClick={startRPSGame}>Start RPS Game</button>
              </div>

              <div className="game-card">
                <h3>Crypto Quiz</h3>
                <p>Test your cryptocurrency knowledge!</p>
                <div className="game-reward">Reward: 0.002 BTC per correct answer</div>
                <button className="btn" onClick={startQuizGame}>Start Quiz Game</button>
              </div>
            </div>

            <div className="game-stats">
              <h3>Game Statistics</h3>
              {Object.entries(gameStats).map(([game, stats]) => (
                <div key={game} className="game-stat-section">
                  <h4>{game.replace('Game', ' Game')}</h4>
                  <div className="stat-item">
                    <span>Played:</span>
                    <span className="stat-value">{stats.played}</span>
                  </div>
                  <div className="stat-item">
                    <span>Wins:</span>
                    <span className="stat-value">{stats.wins}</span>
                  </div>
                  <div className="stat-item">
                    <span>Losses:</span>
                    <span className="stat-value">{stats.losses}</span>
                  </div>
                  <div className="stat-item">
                    <span>Earnings:</span>
                    <span className="stat-value">{stats.earnings.toFixed(4)} BTC</span>
                  </div>
                </div>
              ))}

              <div className="total-stats">
                <h4>Overall Stats</h4>
                <div className="stat-item">
                  <span>Total Games:</span>
                  <span className="stat-value">{Object.values(gameStats).reduce((sum, game) => sum + game.played, 0)}</span>
                </div>
                <div className="stat-item">
                  <span>Total Earnings:</span>
                  <span className="stat-value">{Object.values(gameStats).reduce((sum, game) => sum + game.earnings, 0).toFixed(4)} BTC</span>
                </div>
              </div>

              <div className="game-history">
                <h4>Recent Games</h4>
                <div className="history-list">
                  {gameHistory.slice(-5).reverse().map((entry, index) => (
                    <div key={index} className="history-item">
                      <span>{entry.game.replace('Game', '')}</span>
                      <span className={`result ${entry.result.toLowerCase()}`}>{entry.result}</span>
                      <span>{entry.earnings.toFixed(4)} BTC</span>
                      <span className="timestamp">{entry.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="game-active">
            {gameMode === 'click' ? (
              <div className="click-game">
                <div className="game-header">
                  <div className="game-score">Score: {score}</div>
                  <div className="game-timer">Time: {timeLeft}s</div>
                </div>
                <div className="game-area" onClick={handleTargetClick}>
                  <div
                    className="target"
                    style={{
                      left: `${targetPosition.x}%`,
                      top: `${targetPosition.y}%`
                    }}
                  >
                    🎯
                  </div>
                </div>
                <button className="btn" onClick={resetGame}>End Game</button>
              </div>
            ) : (
              <div className="memory-game">
                <div className="game-header">
                  <div className="game-score">Score: {score}</div>
                  <div className="game-level">Level: {level}</div>
                </div>
                <div className="memory-grid">
                  {Array.from({ length: 9 }, (_, index) => (
                    <button
                      key={index}
                      id={`memory-btn-${index}`}
                      className="memory-btn"
                      onClick={() => handleMemoryClick(index)}
                      disabled={showingSequence}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                {showingSequence && <div className="sequence-text">Watch the sequence...</div>}
                <button className="btn" onClick={resetGame}>End Game</button>
              </div>
            )}

            {gameMode === 'number' && (
              <div className="number-game">
                <div className="game-header">
                  <h3>Guess the Number (1-100)</h3>
                  <div className="game-guesses">Guesses: {guessCount}/10</div>
                </div>
                <div className="number-input">
                  <input
                    type="number"
                    value={guessNumber}
                    onChange={(e) => setGuessNumber(e.target.value)}
                    placeholder="Enter your guess"
                    min="1"
                    max="100"
                    className="form-control"
                  />
                  <button className="btn" onClick={handleNumberGuess} disabled={!guessNumber}>
                    Guess
                  </button>
                </div>
                {guessCount > 0 && (
                  <div className="hint">
                    {parseInt(guessNumber) < targetNumber ? 'Too low!' : parseInt(guessNumber) > targetNumber ? 'Too high!' : ''}
                  </div>
                )}
                <button className="btn" onClick={resetGame}>End Game</button>
              </div>
            )}

            {gameMode === 'rps' && (
              <div className="rps-game">
                <div className="game-header">
                  <h3>Rock Paper Scissors</h3>
                </div>
                <div className="rps-choices">
                  <button className="rps-btn" onClick={() => handleRPSChoice('rock')}>🪨 Rock</button>
                  <button className="rps-btn" onClick={() => handleRPSChoice('paper')}>📄 Paper</button>
                  <button className="rps-btn" onClick={() => handleRPSChoice('scissors')}>✂️ Scissors</button>
                </div>
                {rpsChoice && (
                  <div className="rps-result">
                    <div className="choice-display">
                      <span>You: {rpsChoice} vs Computer: {computerChoice}</span>
                    </div>
                    <div className="result-text">{rpsResult}</div>
                  </div>
                )}
                <button className="btn" onClick={resetGame}>Play Again</button>
              </div>
            )}

            {gameMode === 'quiz' && (
              <div className="quiz-game">
                <div className="game-header">
                  <h3>Crypto Quiz</h3>
                  <div className="quiz-progress">Question {currentQuestion + 1}/{quizQuestions.length}</div>
                  <div className="quiz-score">Score: {quizScore}</div>
                </div>
                <div className="quiz-question">
                  <h4>{quizQuestions[currentQuestion].question}</h4>
                  <div className="quiz-options">
                    {quizQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        className={`quiz-option ${selectedAnswer == index ? 'selected' : ''}`}
                        onClick={() => setSelectedAnswer(index)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <button className="btn" onClick={handleQuizAnswer} disabled={selectedAnswer === ''}>
                    {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </button>
                </div>
                <button className="btn" onClick={resetGame}>End Quiz</button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Game;