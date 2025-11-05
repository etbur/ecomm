// server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Product from './models/Product.js';
import Rating from './models/Rating.js';
import Task from './models/Task.js';
import DailyTaskSession from './models/DailyTaskSession.js';
import Transaction from './models/Transaction.js';
import Withdrawal from './models/Withdrawal.js';
import Deposit from './models/Deposit.js';
import Voucher from './models/Voucher.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------
// MongoDB Connection
// -----------------------
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mydatabase';

const connectMongo = async () => {
  try {
    // Modern Mongoose (v6+) infers defaults; options are rarely needed.
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // don't exit immediately in production, but in dev it's fine
    process.exit(1);
  }
};

connectMongo();

// Connection event handlers for better debugging/reconnect visibility
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error event:', err);
});
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting reconnect...');
});
mongoose.connection.on('reconnected', () => {
  console.log('🔁 MongoDB reconnected.');
});

// Graceful shutdown
const gracefulExit = () => {
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  });
};
process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);

// -----------------------
// Auth middleware
// -----------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access token required' });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: 'JWT_SECRET not configured' });

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// -----------------------
// Routes
// -----------------------

// Validate referral code endpoint
app.post('/api/auth/validate-referral', async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        valid: false,
        message: 'Referral code is required'
      });
    }

    // Check if referral code exists and is valid
    const referrer = await User.findOne({ referralCode });

    if (!referrer) {
      return res.json({
        valid: false,
        message: 'Invalid referral code'
      });
    }

    res.json({
      valid: true,
      message: 'Valid referral code',
      referrer: {
        id: referrer._id,
        username: referrer.username
      }
    });
  } catch (error) {
    console.error('Validate referral error:', error);
    res.status(500).json({
      valid: false,
      message: 'Server error'
    });
  }
});

// Create a user with random referral code for admin
app.post('/api/auth/create-test-user', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Create user with random referral code
    const user = new User({
      username,
      email,
      password
    });

    // Generate random referral code like REF33DF03
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    user.referralCode = `REF${randomPart}`;

    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username,
        email,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    console.error('Create test user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate referral code endpoint
app.post('/api/auth/generate-referral', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate unique referral code if not exists
    if (!user.referralCode) {
      user.referralCode = `REF${user._id.toString().slice(-6).toUpperCase()}`;
      await user.save();
    }

    res.json({ 
      referralCode: user.referralCode,
      message: 'Referral code generated successfully'
    });
  } catch (error) {
    console.error('Generate referral error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup endpoint with referral validation
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    // Validate referral code if provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
      referredBy = referrer._id;
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Create user with referral data
    const userData = { username, email, password };
    if (referredBy) userData.referredBy = referredBy;

    const user = new User(userData);
    
    // Generate referral code for new user
    user.referralCode = `REF${user._id.toString().slice(-6).toUpperCase()}`;
    
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { 
        id: user._id, 
        username, 
        email,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('User data being returned:', {
      id: user._id,
      username: user.username,
      email: user.email,
      referralCode: user.referralCode,
      withdrawalMethod: user.withdrawalMethod,
      withdrawalAddress: user.withdrawalAddress
    });

    res.json({ user });
  } catch (error) {
    console.error('Me route error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes for user management
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('referredBy', 'username email')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's referrals
app.get('/api/user/referrals', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const referredUsers = await User.find({ referredBy: user._id })
      .select('username email createdAt referralCode balance')
      .sort({ createdAt: -1 });

    res.json({
      referrals: referredUsers,
      totalReferrals: referredUsers.length,
      userReferralCode: user.referralCode
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// New endpoint for comprehensive referral statistics (used by Footer)
app.get('/api/referral/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get all referred users with their transaction details
    const referredUsers = await User.find({ referredBy: user._id })
      .select('username email createdAt balance commissionEarned referralCode')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate total commissions from transactions
    const referralTransactions = await Transaction.find({
      $or: [
        { fromUserId: user._id, type: { $in: ['referral', 'commission'] } },
        { toUserId: user._id, type: { $in: ['referral', 'commission'] } }
      ]
    });

    const totalCommissions = referralTransactions.reduce((sum, txn) => {
      return sum + (txn.commissionAmount || 0);
    }, 0);

    // Calculate commission per referred user
    const referredUsersWithCommissions = referredUsers.map(refUser => {
      const userTransactions = referralTransactions.filter(txn =>
        txn.fromUserId.toString() === refUser._id.toString() ||
        txn.toUserId.toString() === refUser._id.toString()
      );

      const userCommission = userTransactions.reduce((sum, txn) => {
        return sum + (txn.commissionAmount || 0);
      }, 0);

      return {
        ...refUser,
        commission: userCommission
      };
    });

    res.json({
      referralCode: user.referralCode,
      referredUsers: referredUsersWithCommissions,
      totalCommissions: totalCommissions,
      totalReferredUsers: referredUsers.length,
      commissionPerUser: referredUsersWithCommissions.map(u => u.commission),
      userBalance: user.balance,
      userCommissionEarned: user.commissionEarned
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Copy referral link endpoint
app.post('/api/referral/copy-link', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/signup?ref=${user.referralCode}`;
    
    res.json({
      message: 'Referral link generated successfully',
      referralLink,
      referralCode: user.referralCode
    });
  } catch (error) {
    console.error('Copy referral link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add commission to referrer when someone makes a purchase/rating
app.post('/api/referral/add-commission', authenticateToken, async (req, res) => {
  try {
    const { referredUserId, commissionAmount } = req.body;
    const referrerId = req.user.userId;

    const referredUser = await User.findById(referredUserId);
    const referrer = await User.findById(referrerId);

    if (!referredUser || !referrer) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user was actually referred by this referrer
    if (referredUser.referredBy?.toString() !== referrerId) {
      return res.status(400).json({ message: 'Invalid referral relationship' });
    }

    const commission = parseFloat(commissionAmount) || 0;
    if (commission <= 0) {
      return res.status(400).json({ message: 'Invalid commission amount' });
    }

    // Add commission to referrer
    referrer.commissionEarned += commission;
    referrer.balance += commission;

    // Create transaction record
    const transaction = new Transaction({
      fromUserId: referredUserId,
      toUserId: referrerId,
      type: 'referral_commission',
      amount: commission,
      commissionAmount: commission,
      description: `Referral commission from ${referredUser.username}'s purchase`
    });

    await referrer.save();
    await transaction.save();

    res.json({
      message: 'Commission added successfully',
      commissionAmount: commission,
      newReferrerBalance: referrer.balance,
      totalCommissionEarned: referrer.commissionEarned
    });
  } catch (error) {
    console.error('Add commission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Task model (in-memory for now, you can create a proper model later)
let tasks = [
  {
    _id: '1',
    title: 'Complete Profile Setup',
    description: 'Fill out all profile information',
    type: 'profile',
    status: 'active',
    assignedUsers: 45,
    completionRate: 78,
    reward: 0.50,
    createdAt: new Date('2024-01-15'),
    assignedTo: null // null means available to all users
  },
  {
    _id: '2',
    title: 'Daily Login Streak',
    description: 'Log in for 7 consecutive days',
    type: 'streak',
    status: 'active',
    assignedUsers: 123,
    completionRate: 65,
    reward: 1.00,
    createdAt: new Date('2024-01-10'),
    assignedTo: null
  },
  {
    _id: '3',
    title: 'Share App with Friends',
    description: 'Invite 3 friends to join the platform',
    type: 'referral',
    status: 'active',
    assignedUsers: 67,
    completionRate: 42,
    reward: 0.75,
    createdAt: new Date('2024-01-12'),
    assignedTo: null
  },
  {
    _id: '4',
    title: 'Complete First Trade',
    description: 'Execute your first cryptocurrency trade',
    type: 'trading',
    status: 'active',
    assignedUsers: 89,
    completionRate: 55,
    reward: 0.80,
    createdAt: new Date('2024-01-08'),
    assignedTo: null
  },
  {
    _id: '5',
    title: 'Set Up Two-Factor Authentication',
    description: 'Enable 2FA for enhanced security',
    type: 'security',
    status: 'active',
    assignedUsers: 156,
    completionRate: 71,
    reward: 0.60,
    createdAt: new Date('2024-01-14'),
    assignedTo: null
  },
  {
    _id: '6',
    title: 'Deposit First Crypto',
    description: 'Make your first cryptocurrency deposit',
    type: 'deposit',
    status: 'active',
    assignedUsers: 78,
    completionRate: 48,
    reward: 0.90,
    createdAt: new Date('2024-01-11'),
    assignedTo: null
  },
  {
    _id: '7',
    title: 'Join Community Forum',
    description: 'Participate in community discussions',
    type: 'community',
    status: 'active',
    assignedUsers: 34,
    completionRate: 25,
    reward: 0.40,
    createdAt: new Date('2024-01-13'),
    assignedTo: null
  },
  {
    _id: '8',
    title: 'Create Investment Portfolio',
    description: 'Set up your first investment portfolio',
    type: 'investment',
    status: 'active',
    assignedUsers: 92,
    completionRate: 63,
    reward: 0.85,
    createdAt: new Date('2024-01-09'),
    assignedTo: null
  },
  {
    _id: '9',
    title: 'Complete KYC Verification',
    description: 'Verify your identity for full access',
    type: 'verification',
    status: 'active',
    assignedUsers: 145,
    completionRate: 82,
    reward: 0.70,
    createdAt: new Date('2024-01-07'),
    assignedTo: null
  },
  {
    _id: '10',
    title: 'Rate and Review App',
    description: 'Leave a review on app store',
    type: 'review',
    status: 'active',
    assignedUsers: 56,
    completionRate: 38,
    reward: 0.55,
    createdAt: new Date('2024-01-16'),
    assignedTo: null
  }
];

// Admin routes for task management
app.get('/api/admin/tasks', authenticateToken, async (req, res) => {
  try {
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes for user tasks
app.get('/api/admin/user-tasks', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, taskType, status } = req.query;

    let query = {};
    if (userId) query.userId = userId;
    if (taskType) query.taskType = taskType;
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('userId', 'username email')
      .populate('productId', 'name price image category')
      .populate('sessionId', 'status rewardEarned luckyOrderTriggered')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalTasks = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalTasks,
        pages: Math.ceil(totalTasks / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admin user tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User-specific task routes
app.get('/api/user/tasks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Return tasks that are either assigned to this user or available to all users (assignedTo: null)
    const userTasks = tasks.filter(task =>
      task.assignedTo === null || task.assignedTo === userId
    );
    res.json({ tasks: userTasks });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/user/tasks/:taskId/complete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const taskId = req.params.taskId;

    const task = tasks.find(t => t._id === taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task is assigned to this user or available to all
    if (task.assignedTo !== null && task.assignedTo !== userId) {
      return res.status(403).json({ message: 'Task not assigned to this user' });
    }

    // Update task completion stats
    task.assignedUsers += 1;
    task.completionRate = Math.min(100, task.completionRate + 1); // Simple increment for demo

    res.json({
      message: 'Task completed successfully',
      reward: task.reward,
      task: task
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, reward, status, assignedTo } = req.body;
    if (!title || !description || !reward) {
      return res.status(400).json({ message: 'Title, description, and reward are required' });
    }

    const newTask = {
      _id: Date.now().toString(),
      title,
      description,
      type: type || 'profile',
      status: status || 'draft',
      assignedUsers: 0,
      completionRate: 0,
      reward: parseFloat(reward),
      assignedTo: assignedTo || null, // null means available to all users
      createdAt: new Date()
    };

    tasks.unshift(newTask);
    res.status(201).json({ task: newTask });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const taskIndex = tasks.findIndex(task => task._id === req.params.id);
    if (taskIndex === -1) return res.status(404).json({ message: 'Task not found' });

    tasks.splice(taskIndex, 1);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Venture model (in-memory for now, you can create a proper model later)
let ventures = [
  {
    _id: '1',
    title: 'E-Commerce Platform',
    category: 'web',
    status: 'active',
    investment: 15000,
    roi: '45%',
    users: 1250,
    description: 'Modern e-commerce solution with advanced analytics',
    technologies: ['React', 'Node.js', 'MongoDB'],
    launchDate: '2024-01-15',
    createdAt: new Date('2024-01-01')
  },
  {
    _id: '2',
    title: 'Fitness Mobile App',
    category: 'mobile',
    status: 'development',
    investment: 25000,
    roi: '0%',
    users: 0,
    description: 'Comprehensive fitness tracking and social features',
    technologies: ['React Native', 'Firebase', 'ML Kit'],
    launchDate: null,
    createdAt: new Date('2024-01-15')
  }
];

// Admin routes for venture management
app.get('/api/admin/ventures', authenticateToken, async (req, res) => {
  try {
    res.json({ ventures });
  } catch (error) {
    console.error('Get ventures error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/ventures', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, investment, status, technologies, launchDate } = req.body;
    if (!title || !description || !investment) {
      return res.status(400).json({ message: 'Title, description, and investment are required' });
    }

    const newVenture = {
      _id: Date.now().toString(),
      title,
      description,
      category: category || 'web',
      status: status || 'planning',
      investment: parseFloat(investment),
      roi: '0%',
      users: 0,
      technologies: technologies || [],
      launchDate: launchDate || null,
      createdAt: new Date()
    };

    ventures.unshift(newVenture);
    res.status(201).json({ venture: newVenture });
  } catch (error) {
    console.error('Create venture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Investment model (in-memory for now, you can create a proper model later)
let investments = [];

// Investment routes
app.post('/api/investments', authenticateToken, async (req, res) => {
  try {
    const { userId, plan, token, amount, date, status } = req.body;
    if (!userId || !plan || !token || !amount || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newInvestment = {
      _id: Date.now().toString(),
      userId,
      plan,
      token,
      amount: parseFloat(amount),
      date,
      status: status || 'pending',
      createdAt: new Date()
    };

    investments.push(newInvestment);
    res.status(201).json({ investment: newInvestment });
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes for investment management
app.get('/api/admin/investments', authenticateToken, async (req, res) => {
  try {
    res.json({ investments });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/investments/:id/approve', authenticateToken, async (req, res) => {
  try {
    const investment = investments.find(inv => inv._id === req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    investment.status = 'approved';
    res.json({ message: 'Investment approved successfully', investment });
  } catch (error) {
    console.error('Approve investment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/investments/:id/reject', authenticateToken, async (req, res) => {
  try {
    const investment = investments.find(inv => inv._id === req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    investment.status = 'rejected';
    res.json({ message: 'Investment rejected', investment });
  } catch (error) {
    console.error('Reject investment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User route to get approved investments balance
app.get('/api/user/investments/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userInvestments = investments.filter(inv =>
      inv.userId === userId && inv.status === 'approved'
    );

    const totalBalance = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    res.json({ balance: totalBalance, investments: userInvestments });
  } catch (error) {
    console.error('Get investment balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/ventures/:id', authenticateToken, async (req, res) => {
  try {
    const ventureIndex = ventures.findIndex(venture => venture._id === req.params.id);
    if (ventureIndex === -1) return res.status(404).json({ message: 'Venture not found' });

    ventures.splice(ventureIndex, 1);
    res.json({ message: 'Venture deleted successfully' });
  } catch (error) {
    console.error('Delete venture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route to reset products (for development)
app.post('/api/admin/reset-products', async (req, res) => {
  try {
    await Product.deleteMany({});
    await initializeProducts();
    const count = await Product.countDocuments();
    res.json({ message: 'Products reset successfully', count });
  } catch (error) {
    console.error('Reset products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------
// Product Routes
// -----------------------

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (admin only)
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, price, image, category, reward } = req.body;
    
    if (!name || !price || !image || !category) {
      return res.status(400).json({ message: 'Name, price, image, and category are required' });
    }

    const product = new Product({
      name,
      price: parseFloat(price),
      image,
      category,
      reward: reward ? parseFloat(reward) : 36.00
    });

    await product.save();
    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize default products if none exist
const initializeProducts = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const defaultProducts = [
        {
          name: "No Ball Pen 50PCS",
          price: 15.99,
          image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&h=300&fit=crop",
          category: "Stationery",
          reward: 36.00
        },
        {
          name: "Gucci Mini Skirt",
          price: 499.00,
          image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop",
          category: "Fashion",
          reward: 36.00
        },
        {
          name: "Swim Suit",
          price: 35.50,
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
          category: "Sports",
          reward: 36.00
        },
        {
          name: "Balenciaga T-shirt",
          price: 250.00,
          image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
          category: "Fashion",
          reward: 36.00
        },
        {
          name: "All-Star Speakers",
          price: 75.00,
          image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
          category: "Electronics",
          reward: 36.00
        },
        {
          name: "Champions Hoodie",
          price: 60.00,
          image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop",
          category: "Fashion",
          reward: 36.00
        },
        {
          name: "Calvin Klein Shirt",
          price: 120.00,
          image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop",
          category: "Fashion",
          reward: 36.00
        },
        {
          name: "Gym Bag for Women",
          price: 27.19,
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
          category: "Sports",
          reward: 36.00
        },
        {
          name: "Wireless Bluetooth Headphones",
          price: 89.99,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
          category: "Electronics",
          reward: 36.00
        },
        {
          name: "Nike Running Shoes",
          price: 150.00,
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
          category: "Sports",
          reward: 36.00
        },
        {
          name: "Laptop Stand Adjustable",
          price: 45.00,
          image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
          category: "Electronics",
          reward: 36.00
        },
        {
          name: "Yoga Mat Premium",
          price: 35.00,
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
          category: "Sports",
          reward: 36.00
        },
        {
          name: "Coffee Maker Programmable",
          price: 199.99,
          image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
          category: "Home",
          reward: 36.00
        },
        {
          name: "Bluetooth Smartwatch",
          price: 299.00,
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
          category: "Electronics",
          reward: 36.00
        },
        {
          name: "Essential Oil Diffuser",
          price: 25.99,
          image: "https://images.unsplash.com/photo-1602874801000-1d8c4b3930d3?w=300&h=300&fit=crop",
          category: "Home",
          reward: 36.00
        },
        {
          name: "LED Desk Lamp",
          price: 39.99,
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
          category: "Home",
          reward: 36.00
        },
        {
          name: "Fitness Tracker",
          price: 125.00,
          image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop",
          category: "Electronics",
          reward: 36.00
        },
        {
          name: "Hiking Backpack 40L",
          price: 85.00,
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
          category: "Sports",
          reward: 36.00
        },
        {
          name: "Mechanical Keyboard",
          price: 149.99,
          image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop",
          category: "Electronics",
          reward: 36.00
        },
        {
          name: "Wireless Mouse",
          price: 29.99,
          image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&h=300&fit=crop",
          category: "Electronics",
          reward: 36.00
        },
        {
          name: "Cooking Utensil Set",
          price: 22.50,
          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
          category: "Home",
          reward: 36.00
        },
        {
          name: "Protein Powder Container",
          price: 18.99,
          image: "https://images.unsplash.com/photo-1550572017-edd951aa8ca7?w=300&h=300&fit=crop",
          category: "Sports",
          reward: 36.00
        },
        {
          name: "Phone Case Protective",
          price: 19.99,
          image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=300&fit=crop",
          category: "Electronics",
          reward: 36.00
        },
        {
          name: "Water Bottle Insulated",
          price: 24.99,
          image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop",
          category: "Sports",
          reward: 36.00
        },
        {
          name: "Portable Charger Power Bank",
          price: 45.99,
          image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=300&fit=crop",
          category: "Electronics",
          reward: 36.00
        },
        {
          name: "Decorative Throw Pillows",
          price: 32.00,
          image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
          category: "Home",
          reward: 36.00
        }
      ];

      await Product.insertMany(defaultProducts);
      console.log(`✅ ${defaultProducts.length} default products initialized`);
    }
  } catch (error) {
    console.error('Initialize products error:', error);
  }
};

// -----------------------
// Rating Routes
// -----------------------

// Submit rating
app.post('/api/ratings', authenticateToken, async (req, res) => {
  try {
    const { productId, rating } = req.body;
    const userId = req.user.userId;

    if (!productId || !rating) {
      return res.status(400).json({ message: 'Product ID and rating are required' });
    }

    if (rating !== 5) {
      return res.status(400).json({ message: 'Only 5-star ratings are allowed' });
    }

    // Check if user already rated this product today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingRating = await Rating.findOne({
      userId,
      productId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this product today' });
    }

    // Enforce sequential rating - user must rate products in order
    const allProducts = await Product.find({ isActive: true }).sort({ createdAt: 1 });
    const currentProductIndex = allProducts.findIndex(p => p._id.toString() === productId);

    if (currentProductIndex > 0) {
      // Check if all previous products have been rated today
      for (let i = 0; i < currentProductIndex; i++) {
        const prevProduct = allProducts[i];
        const prevRating = await Rating.findOne({
          userId,
          productId: prevProduct._id,
          createdAt: { $gte: today, $lt: tomorrow }
        });

        if (!prevRating) {
          return res.status(400).json({
            message: `You must rate "${prevProduct.name}" before rating this product. Please complete products in order.`
          });
        }
      }
    }

    // Get product and user details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has enough balance
    if (user.balance < product.price) {
      return res.status(400).json({
        message: 'Insufficient balance',
        requiredAmount: product.price - user.balance,
        currentBalance: user.balance
      });
    }

    // Calculate profit (reward - product price)
    const profit = product.reward - product.price;

    // Update user balance
    user.balance = user.balance - product.price + product.reward;
    await user.save();

    // Create rating record
    const ratingRecord = new Rating({
      userId,
      productId,
      rating,
      reward: product.reward,
      productPrice: product.price,
      profit,
      status: 'completed'
    });

    await ratingRecord.save();

    // Create task record for tracking task money
    const taskRecord = new Task({
      userId,
      productId,
      taskType: 'rating',
      reward: product.reward,
      productPrice: product.price,
      profit,
      status: 'completed',
      description: `Rating task completed for ${product.name}`
    });

    await taskRecord.save();

    res.json({
      message: 'Rating submitted successfully',
      rating: ratingRecord,
      newBalance: user.balance,
      profit: profit
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check sequential rating before showing modal
app.post('/api/ratings/check-sequential', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    // Check if user already rated this product today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingRating = await Rating.findOne({
      userId,
      productId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (existingRating) {
      return res.json({
        canRate: false,
        message: 'You have already rated this product today. Please complete products in order.'
      });
    }

    // Enforce sequential rating - user must rate products in order
    const allProducts = await Product.find({ isActive: true }).sort({ createdAt: 1 });
    const currentProductIndex = allProducts.findIndex(p => p._id.toString() === productId);

    if (currentProductIndex > 0) {
      // Check if all previous products have been rated today
      for (let i = 0; i < currentProductIndex; i++) {
        const prevProduct = allProducts[i];
        const prevRating = await Rating.findOne({
          userId,
          productId: prevProduct._id,
          createdAt: { $gte: today, $lt: tomorrow }
        });

        if (!prevRating) {
          return res.json({
            canRate: false,
            message: `You must rate "${prevProduct.name}" before rating this product. Please complete products in order.`
          });
        }
      }
    }

    res.json({ canRate: true });
  } catch (error) {
    console.error('Check sequential rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user ratings
app.get('/api/ratings/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const ratings = await Rating.find({ userId })
      .populate('productId', 'name price image category')
      .sort({ createdAt: -1 });

    res.json({ ratings });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user tasks
app.get('/api/tasks/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const tasks = await Task.find({ userId })
      .populate('productId', 'name price image category')
      .populate('sessionId', 'status rewardEarned luckyOrderTriggered')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------
// Balance Routes
// -----------------------

// Get user balance
app.get('/api/user/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('balance username email referralCode withdrawalMethod withdrawalAddress');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      balance: user.balance,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        withdrawalMethod: user.withdrawalMethod,
        withdrawalAddress: user.withdrawalAddress
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request deposit (creates pending deposit)
app.post('/api/user/deposit', authenticateToken, async (req, res) => {
  try {
    const { amount, method, address, notes } = req.body;
    const userId = req.user.userId;

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    if (!method || !address) {
      return res.status(400).json({ message: 'Deposit method and address are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const depositAmount = parseFloat(amount);

    // Create deposit record (pending status)
    const deposit = new Deposit({
      userId,
      amount: depositAmount,
      method,
      address,
      notes: notes || '',
      status: 'pending'
    });

    await deposit.save();

    res.json({
      message: 'Deposit request submitted successfully',
      deposit: {
        id: deposit._id,
        amount: depositAmount,
        method,
        address,
        status: 'pending',
        createdAt: deposit.createdAt
      }
    });
  } catch (error) {
    console.error('Deposit request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's deposit history
app.get('/api/user/deposits', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const deposits = await Deposit.find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username email');

    res.json({ deposits });
  } catch (error) {
    console.error('Get deposits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ====================
// PARENT-CHILD DAILY TASK REWARD SYSTEM
// ====================

// Helper function to find user by ID or referral code
const findUserByIdOrReferralCode = async (identifier) => {
  // First try to find by ObjectId
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    const user = await User.findById(identifier);
    if (user) return user;
  }

  // If not found or not a valid ObjectId, try to find by referral code
  const user = await User.findOne({ referralCode: identifier });
  return user;
};

// Create Parent-Child relationship
app.post('/api/users/create-parent-child', authenticateToken, async (req, res) => {
  try {
    const { parentUserId, childUserId } = req.body;
    const currentUserId = req.user.userId;

    // Find parent and child users by ID or referral code
    const parentUser = await findUserByIdOrReferralCode(parentUserId);
    const childUser = await findUserByIdOrReferralCode(childUserId);

    if (!parentUser || !childUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if child already has a parent
    if (childUser.parentUser) {
      return res.status(400).json({ message: 'Child already has a parent relationship' });
    }

    // Create relationship
    childUser.parentUser = parentUserId;
    childUser.userType = 'child';
    parentUser.userType = 'parent';
    parentUser.childUsers.push(childUserId);

    // Add deposit balance to child user when relationship is created
    if (parentUser.balance > 0) {
      childUser.balance += parentUser.balance;

      // Create transaction record for the balance transfer
      const transaction = new Transaction({
        fromUserId: parentUserId,
        toUserId: childUserId,
        type: 'parent_child_balance_transfer',
        amount: parentUser.balance,
        description: 'Balance transferred from parent when creating relationship',
        status: 'completed'
      });

      await transaction.save();
    }

    await childUser.save();
    await parentUser.save();

    res.json({
      message: 'Parent-child relationship created successfully',
      parent: {
        id: parentUser._id,
        username: parentUser.username,
        childCount: parentUser.childCount
      },
      child: {
        id: childUser._id,
        username: childUser.username,
        parentUser: parentUserId
      }
    });
  } catch (error) {
    console.error('Create parent-child error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start Daily Task Session
app.post('/api/daily-session/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { parentUserId } = req.body; // Optional, for child sessions

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can start a new session
    if (!user.canStartDailySession()) {
      return res.status(400).json({
        message: 'Daily session already active or not yet reset',
        canStart: false
      });
    }

    // Create new session
    const session = new DailyTaskSession({
      userId,
      parentUserId: parentUserId || null,
      sessionDate: new Date(),
      isFirstSession: user.dailySessionsCompleted === 0
    });

    await session.save();
    await user.activateDailySession();

    res.json({
      message: 'Daily session started successfully',
      session: {
        id: session._id,
        tasksCompleted: session.tasksCompleted,
        totalTasks: session.totalTasks,
        isFirstSession: session.isFirstSession
      },
      user: {
        id: user._id,
        username: user.username,
        dailySessionActive: user.dailySessionActive,
        totalEarningsToday: user.totalEarningsToday
      }
    });
  } catch (error) {
    console.error('Start daily session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete Task in Session
app.post('/api/daily-session/complete-task', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.dailySessionActive) {
      return res.status(400).json({ message: 'No active daily session' });
    }

    // Get active session for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let session = await DailyTaskSession.findOne({
      userId,
      sessionDate: { $gte: today, $lt: tomorrow },
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    if (session.tasksCompleted >= session.totalTasks) {
      return res.status(400).json({ message: 'Session already completed' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already rated this product today (either Rating or Task record)
    const existingRating = await Rating.findOne({
      userId,
      productId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const existingTask = await Task.findOne({
      userId,
      productId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (existingRating || existingTask) {
      return res.status(400).json({ message: 'Product already rated today' });
    }

    // Enforce sequential rating - user must rate products in order
    const allProducts = await Product.find({ isActive: true }).sort({ createdAt: 1 });
    const currentProductIndex = allProducts.findIndex(p => p._id.toString() === productId);

    if (currentProductIndex > 0) {
      // Check if all previous products have been rated today (either Rating or Task record)
      for (let i = 0; i < currentProductIndex; i++) {
        const prevProduct = allProducts[i];
        const prevRating = await Rating.findOne({
          userId,
          productId: prevProduct._id,
          createdAt: { $gte: today, $lt: tomorrow }
        });

        const prevTask = await Task.findOne({
          userId,
          productId: prevProduct._id,
          createdAt: { $gte: today, $lt: tomorrow }
        });

        if (!prevRating && !prevTask) {
          return res.status(400).json({
            message: `You must rate "${prevProduct.name}" before rating this product. Please complete products in order.`
          });
        }
      }
    }

    // Calculate profit
    const profit = product.reward - product.price;

    // Increment task completion count
    session.tasksCompleted += 1;

    // Check for lucky order - only after completing 3 products
    // Count how many tasks the user has completed today in this session
    const todayTasks = await Task.find({
      userId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const tasksCompletedToday = todayTasks.length;

    // Lucky order only available after completing 3 products (so on the 4th, 5th, etc.)
    if (tasksCompletedToday >= 3 && Math.random() < 0.10) {
      session.luckyOrderTriggered = true;
      session.luckyOrderCommission = profit * 0.0005; // 0.05% commission
    }

    // Check if session completed
    if (session.tasksCompleted >= session.totalTasks) {
      session.status = 'completed';
      session.completedAt = new Date();
      session.rewardEarned = session.tasksCompleted * 36.00; // $36 per task

      // Complete daily session and get updated user data
      const completedSessionData = await user.completeDailySession();

      // Handle reward distribution based on session type
      if (session.parentUserId) {
        // This is a child session - distribute rewards to parent
        const parent = await User.findById(session.parentUserId);
        const childReward = 20.00; // $20 to child

        session.childRewardSent = childReward;

        // Transfer reward to child
        user.balance = completedSessionData.balance + childReward;
        user.totalEarningsToday = completedSessionData.totalEarningsToday + childReward;

        // Create transaction record
        const transaction = new Transaction({
          fromUserId: session.parentUserId,
          toUserId: userId,
          sessionId: session._id,
          type: 'parent_child_reward',
          amount: childReward,
          description: 'Daily task completion reward from parent'
        });

        await transaction.save();
      } else {
        // This is a parent session
        session.rewardDistributed = session.rewardEarned;

        // If this is the first session, send $20 to each child
        if (session.isFirstSession) {
          for (const childId of user.childUsers) {
            const child = await User.findById(childId);
            if (child) {
              child.balance += 20.00;
              child.totalEarningsToday += 20.00;

              const transaction = new Transaction({
                fromUserId: userId,
                toUserId: childId,
                sessionId: session._id,
                type: 'parent_child_reward',
                amount: 20.00,
                description: 'First session reward from parent'
              });

              await transaction.save();
              await child.save();
            }
          }
        }

        // Update user balance for completed parent session
        user.balance = completedSessionData.balance;
        user.totalEarningsToday = completedSessionData.totalEarningsToday;
      }

      // Handle lucky order commission
      if (session.luckyOrderTriggered) {
        const commission = session.luckyOrderCommission;
        user.balance += commission;
        user.totalEarningsToday += commission;
        user.addLuckyOrder();
        user.addCommission(commission);

        const transaction = new Transaction({
          fromUserId: userId,
          toUserId: userId,
          sessionId: session._id,
          type: 'lucky_order_commission',
          amount: commission,
          commissionAmount: commission,
          description: 'Lucky order commission reward'
        });

        await transaction.save();
      }

      // Final save with all updates
      await user.save();
    }

    // Create task record for session task completion
    const taskRecord = new Task({
      userId,
      productId,
      sessionId: session._id,
      taskType: 'session_task',
      reward: product.reward,
      productPrice: product.price,
      profit,
      commission: session.luckyOrderTriggered ? session.luckyOrderCommission : 0,
      status: 'completed',
      isLuckyOrder: session.luckyOrderTriggered,
      description: `Session task completed for ${product.name}${session.luckyOrderTriggered ? ' (Lucky Order)' : ''}`
    });

    await taskRecord.save();

    await session.save();

    res.json({
      message: 'Task completed successfully',
      session: {
        id: session._id,
        tasksCompleted: session.tasksCompleted,
        totalTasks: session.totalTasks,
        status: session.status,
        rewardEarned: session.rewardEarned,
        luckyOrderTriggered: session.luckyOrderTriggered,
        luckyOrderCommission: session.luckyOrderCommission
      },
      user: {
        balance: user.balance,
        totalEarningsToday: user.totalEarningsToday,
        dailySessionActive: user.dailySessionActive,
        luckyOrderCount: user.luckyOrderCount
      },
      profit: profit
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check sequential rating for session mode
app.post('/api/daily-session/check-sequential', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    // Get active session for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let session = await DailyTaskSession.findOne({
      userId,
      sessionDate: { $gte: today, $lt: tomorrow },
      status: 'active'
    });

    if (!session) {
      return res.json({
        canRate: false,
        message: 'No active daily session found. Please start a session first.'
      });
    }

    if (session.tasksCompleted >= session.totalTasks) {
      return res.json({
        canRate: false,
        message: 'Session already completed. Please start a new session.'
      });
    }

    // Check if user already rated this product today (either Rating or Task record)
    const existingRating = await Rating.findOne({
      userId,
      productId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const existingTask = await Task.findOne({
      userId,
      productId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (existingRating || existingTask) {
      return res.json({
        canRate: false,
        message: 'You have already rated this product today. Please complete products in order.'
      });
    }

    // Enforce sequential rating - user must rate products in order
    const allProducts = await Product.find({ isActive: true }).sort({ createdAt: 1 });
    const currentProductIndex = allProducts.findIndex(p => p._id.toString() === productId);

    if (currentProductIndex > 0) {
      // Check if all previous products have been rated today (either Rating or Task record)
      for (let i = 0; i < currentProductIndex; i++) {
        const prevProduct = allProducts[i];
        const prevRating = await Rating.findOne({
          userId,
          productId: prevProduct._id,
          createdAt: { $gte: today, $lt: tomorrow }
        });

        const prevTask = await Task.findOne({
          userId,
          productId: prevProduct._id,
          createdAt: { $gte: today, $lt: tomorrow }
        });

        if (!prevRating && !prevTask) {
          return res.json({
            canRate: false,
            message: `You must rate "${prevProduct.name}" before rating this product. Please complete products in order.`
          });
        }
      }
    }

    res.json({ canRate: true });
  } catch (error) {
    console.error('Check sequential rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User's Daily Sessions
app.get('/api/daily-session/my-sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sessions = await DailyTaskSession.find({
      userId,
      sessionDate: { $gte: startDate }
    })
    .populate('parentUserId', 'username email')
    .sort({ sessionDate: -1 });

    // Get user's active session
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeSession = await DailyTaskSession.findOne({
      userId,
      sessionDate: { $gte: today, $lt: tomorrow },
      status: 'active'
    });

    res.json({
      sessions,
      activeSession,
      summary: {
        totalSessions: sessions.length,
        completedSessions: sessions.filter(s => s.status === 'completed').length,
        totalTasksCompleted: sessions.reduce((sum, s) => sum + s.tasksCompleted, 0),
        totalEarnings: sessions.reduce((sum, s) => sum + s.rewardEarned, 0)
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Parent-Child Relationships
app.get('/api/users/parent-child-relationships', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's relationships
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get parent info
    let parentInfo = null;
    if (user.parentUser) {
      const parent = await User.findById(user.parentUser).select('username email referralCode balance');
      parentInfo = parent;
    }

    // Get children info
    let childrenInfo = [];
    if (user.childUsers && user.childUsers.length > 0) {
      childrenInfo = await User.find({ _id: { $in: user.childUsers } })
        .select('username email referralCode balance dailySessionsCompleted commissionEarned')
        .lean();
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        userType: user.userType,
        dailySessionActive: user.dailySessionActive,
        totalEarningsToday: user.totalEarningsToday,
        luckyOrderCount: user.luckyOrderCount,
        commissionEarned: user.commissionEarned,
        referralCode: user.referralCode
      },
      parent: parentInfo,
      children: childrenInfo,
      relationships: {
        hasParent: !!user.parentUser,
        childCount: user.childUsers ? user.childUsers.length : 0
      }
    });
  } catch (error) {
    console.error('Get relationships error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User's Transactions
app.get('/api/transactions/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, limit = 50 } = req.query;

    let query = {
      $or: [{ fromUserId: userId }, { toUserId: userId }]
    };

    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .populate('fromUserId', 'username email')
      .populate('toUserId', 'username email')
      .populate('sessionId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const totalTransactions = await Transaction.countDocuments(query);
    const totalAmount = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      transactions,
      summary: {
        totalTransactions,
        totalAmount: totalAmount[0]?.total || 0,
        types: [
          'parent_child_reward',
          'child_own_task',
          'lucky_order_commission',
          'deposit',
          'withdrawal'
        ]
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Daily Task Statistics
app.get('/api/daily-session/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get user's sessions
    const sessions = await DailyTaskSession.find({
      $or: [{ userId }, { parentUserId: userId }],
      sessionDate: { $gte: startDate }
    }).sort({ sessionDate: -1 });

    // Calculate statistics
    const stats = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      activeSessions: sessions.filter(s => s.status === 'active').length,
      totalTasksCompleted: sessions.reduce((sum, s) => sum + s.tasksCompleted, 0),
      totalRewardsEarned: sessions.reduce((sum, s) => sum + s.rewardEarned, 0),
      totalCommissionsEarned: sessions.reduce((sum, s) => sum + s.luckyOrderCommission, 0),
      luckyOrdersTriggered: sessions.filter(s => s.luckyOrderTriggered).length,
      parentSessions: sessions.filter(s => !s.parentUserId).length,
      childSessions: sessions.filter(s => s.parentUserId).length,
      averageTasksPerSession: 0,
      successRate: 0
    };

    if (stats.totalSessions > 0) {
      stats.averageTasksPerSession = (stats.totalTasksCompleted / stats.totalSessions).toFixed(2);
      stats.successRate = ((stats.completedSessions / stats.totalSessions) * 100).toFixed(2);
    }

    // Get daily breakdown for charts
    const dailyBreakdown = {};
    sessions.forEach(session => {
      const date = session.sessionDate.toISOString().split('T')[0];
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          date,
          tasksCompleted: 0,
          rewardsEarned: 0,
          sessionsCount: 0
        };
      }
      dailyBreakdown[date].tasksCompleted += session.tasksCompleted;
      dailyBreakdown[date].rewardsEarned += session.rewardEarned;
      dailyBreakdown[date].sessionsCount += 1;
    });

    res.json({
      stats,
      dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => a.date.localeCompare(b.date)),
      recentSessions: sessions.slice(0, 10)
    });
  } catch (error) {
    console.error('Get daily stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mine page endpoints
app.get('/api/user/task-completions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get today's earnings from daily sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = await DailyTaskSession.find({
      userId,
      sessionDate: { $gte: today, $lt: tomorrow },
      status: 'completed'
    });

    const todayEarnings = todaySessions.reduce((sum, session) => sum + (session.rewardEarned || 0), 0);

    // Get total earnings from all completed sessions
    const allSessions = await DailyTaskSession.find({
      userId,
      status: 'completed'
    });

    const totalEarnings = allSessions.reduce((sum, session) => sum + (session.rewardEarned || 0), 0);

    res.json({
      todayEarnings,
      totalTaskEarnings: totalEarnings,
      completedSessions: allSessions.length
    });
  } catch (error) {
    console.error('Get task completions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Earn page comprehensive data endpoint
app.get('/api/user/earn-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get today's earnings from daily sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = await DailyTaskSession.find({
      userId,
      sessionDate: { $gte: today, $lt: tomorrow },
      status: 'completed'
    });

    const todayEarnings = todaySessions.reduce((sum, session) => sum + (session.rewardEarned || 0), 0);

    // Get all completed sessions for task history
    const allSessions = await DailyTaskSession.find({
      userId,
      status: 'completed'
    }).sort({ sessionDate: -1 });

    // Get task history (ratings)
    const ratings = await Rating.find({ userId })
      .populate('productId', 'name price image category')
      .sort({ createdAt: -1 });

    // Transform ratings to task history format
    const taskHistory = ratings.map(rating => ({
      id: rating._id,
      name: rating.productId?.name || 'Product Rating',
      status: rating.status || 'completed',
      reward: `$${(rating.reward || 0).toFixed(2)}`,
      date: new Date(rating.createdAt).toLocaleDateString(),
      time: new Date(rating.createdAt).toLocaleTimeString(),
      productPrice: rating.productPrice || 0,
      profit: rating.profit || 0
    }));

    // Calculate user level based on sessions completed
    const userLevel = user.dailySessionsCompleted >= 50 ? "VIP3" :
                     user.dailySessionsCompleted >= 20 ? "VIP2" :
                     user.dailySessionsCompleted >= 5 ? "VIP1" : "VIP1";

    // Calculate total earnings from task history
    const totalEarnings = taskHistory
      .filter(task => task.status === "completed")
      .reduce((sum, task) => sum + (Number(task.profit) || 0), 0);

    // Get referral data
    const referralTransactions = await Transaction.find({
      $or: [
        { fromUserId: userId, type: { $in: ['referral', 'commission'] } },
        { toUserId: userId, type: { $in: ['referral', 'commission'] } }
      ]
    });

    const totalCommissions = referralTransactions.reduce((sum, txn) => {
      return sum + (txn.commissionAmount || 0);
    }, 0);

    // Get referred users
    const referredUsers = await User.find({ referredBy: userId })
      .select('username email createdAt balance commissionEarned')
      .sort({ createdAt: -1 })
      .lean();

    const referredUsersWithCommissions = referredUsers.map(refUser => {
      const userTransactions = referralTransactions.filter(txn =>
        txn.fromUserId.toString() === refUser._id.toString() ||
        txn.toUserId.toString() === refUser._id.toString()
      );

      const userCommission = userTransactions.reduce((sum, txn) => {
        return sum + (txn.commissionAmount || 0);
      }, 0);

      return {
        ...refUser,
        commission: userCommission
      };
    });

    res.json({
      // User data
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        referralCode: user.referralCode,
        userLevel: userLevel,
        dailySessionsCompleted: user.dailySessionsCompleted,
        commissionEarned: user.commissionEarned,
        luckyOrderCount: user.luckyOrderCount,
        userType: user.userType,
        withdrawalMethod: user.withdrawalMethod,
        createdAt: user.createdAt
      },

      // Task data
      taskData: {
        completedTasks: taskHistory.filter(task => task.status === "completed").length,
        totalTasks: taskHistory.length,
        totalEarnings: totalEarnings,
        todayEarnings: todayEarnings,
        taskHistory: taskHistory
      },

      // Referral data
      referralData: {
        referralCode: user.referralCode,
        totalReferredUsers: referredUsers.length,
        totalCommissions: totalCommissions,
        referredUsers: referredUsersWithCommissions
      }
    });
  } catch (error) {
    console.error('Get earn data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Setup withdrawal credentials
app.post('/api/user/setup-withdrawal', authenticateToken, async (req, res) => {
  try {
    const { method, address, password } = req.body;
    const userId = req.user.userId;

    console.log('Setting up withdrawal for user:', userId);
    console.log('Method:', method, 'Address:', address);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) return res.status(400).json({ message: 'Invalid password' });

    // Update withdrawal info (store in user document for simplicity)
    user.withdrawalMethod = method;
    user.withdrawalAddress = address;

    const savedUser = await user.save();
    console.log('User saved with withdrawal info:', savedUser.withdrawalMethod, savedUser.withdrawalAddress);

    // Verify the data was saved by fetching it again
    const verifyUser = await User.findById(userId);
    console.log('Verification - saved data:', {
      withdrawalMethod: verifyUser.withdrawalMethod,
      withdrawalAddress: verifyUser.withdrawalAddress
    });

    res.json({
      message: 'Withdrawal information saved successfully',
      withdrawalInfo: {
        method,
        address
      }
    });
  } catch (error) {
    console.error('Setup withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get withdrawal history
app.get('/api/user/withdrawals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const withdrawals = await Withdrawal.find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username email');

    res.json({ withdrawals });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes for deposit management
app.get('/api/admin/deposits', authenticateToken, async (req, res) => {
  try {
    const deposits = await Deposit.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'username email');

    res.json({ deposits });
  } catch (error) {
    console.error('Get admin deposits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/deposits/:id/approve', authenticateToken, async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit is not in pending status' });
    }

    deposit.status = 'approved';
    deposit.processedAt = new Date();
    await deposit.save();

    // Add amount to user balance
    const user = await User.findById(deposit.userId);
    if (user) {
      user.balance += deposit.amount;
      await user.save();

      // Create transaction record
      const transaction = new Transaction({
        fromUserId: deposit.userId,
        toUserId: deposit.userId,
        type: 'deposit',
        amount: deposit.amount,
        description: `Deposit via ${deposit.method}`
      });

      await transaction.save();
    }

    res.json({ message: 'Deposit approved successfully', deposit });
  } catch (error) {
    console.error('Approve deposit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/deposits/:id/reject', authenticateToken, async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit is not in pending status' });
    }

    deposit.status = 'rejected';
    deposit.processedAt = new Date();
    await deposit.save();

    res.json({ message: 'Deposit rejected', deposit });
  } catch (error) {
    console.error('Reject deposit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes for withdrawal management
app.get('/api/admin/withdrawals', authenticateToken, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'username email');

    res.json({ withdrawals });
  } catch (error) {
    console.error('Get admin withdrawals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/withdrawals/:id/approve', authenticateToken, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    withdrawal.status = 'approved';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    res.json({ message: 'Withdrawal approved successfully', withdrawal });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/withdrawals/:id/reject', authenticateToken, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    withdrawal.status = 'rejected';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Refund the amount back to user balance
    const user = await User.findById(withdrawal.userId);
    if (user) {
      user.balance += withdrawal.amount;
      await user.save();
    }

    res.json({ message: 'Withdrawal rejected and amount refunded', withdrawal });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request withdrawal
app.post('/api/user/withdrawals', authenticateToken, async (req, res) => {
  try {
    const { amount, password } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) return res.status(400).json({ message: 'Invalid password' });

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount < 10) return res.status(400).json({ message: 'Minimum withdrawal amount is $10' });
    if (withdrawAmount > user.balance) return res.status(400).json({ message: 'Insufficient balance' });

    // Check if withdrawal info is set up
    if (!user.withdrawalMethod || !user.withdrawalAddress) {
      return res.status(400).json({ message: 'Withdrawal information not set up' });
    }

    // Create withdrawal record in Withdrawal collection
    const withdrawal = new Withdrawal({
      userId,
      amount: withdrawAmount,
      fee: 2.00,
      method: user.withdrawalMethod,
      address: user.withdrawalAddress,
      status: 'pending'
    });

    await withdrawal.save();

    // Create transaction record for tracking
    const transaction = new Transaction({
      fromUserId: userId,
      toUserId: userId,
      type: 'withdrawal',
      amount: withdrawAmount,
      description: `Withdrawal via ${user.withdrawalMethod}`,
      status: 'pending'
    });

    await transaction.save();

    // Deduct from balance
    user.balance -= withdrawAmount;
    await user.save();

    res.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal._id,
        amount: withdrawAmount,
        method: user.withdrawalMethod,
        status: 'pending',
        createdAt: withdrawal.createdAt
      }
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------
// Voucher Routes
// -----------------------

// Generate voucher (admin only)
app.post('/api/admin/vouchers', authenticateToken, async (req, res) => {
  try {
    const { userId, amount, type, generatedBy } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ message: 'User ID and amount are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate unique voucher code
    const code = `VOUCHER${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Set expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const voucher = new Voucher({
      userId,
      amount: parseFloat(amount),
      type: type || 'task_activation',
      code,
      generatedBy: generatedBy || 'admin',
      expiresAt
    });

    await voucher.save();

    // Populate user information
    await voucher.populate('userId', 'username email');

    res.status(201).json({
      message: 'Voucher generated successfully',
      voucher: {
        _id: voucher._id,
        code: voucher.code,
        amount: voucher.amount,
        type: voucher.type,
        userId: voucher.userId,
        status: voucher.status,
        expiresAt: voucher.expiresAt,
        createdAt: voucher.createdAt
      }
    });
  } catch (error) {
    console.error('Generate voucher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all vouchers (admin only)
app.get('/api/admin/vouchers', authenticateToken, async (req, res) => {
  try {
    const vouchers = await Voucher.find({})
      .populate({
        path: 'userId',
        select: 'username email',
        model: 'User'
      })
      .sort({ createdAt: -1 });

    res.json({ vouchers });
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete voucher (admin only)
app.delete('/api/admin/vouchers/:id', authenticateToken, async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    res.json({ message: 'Voucher deleted successfully' });
  } catch (error) {
    console.error('Delete voucher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate voucher (user)
app.post('/api/user/vouchers/generate', authenticateToken, async (req, res) => {
  try {
    const { amount, type } = req.body;
    const userId = req.user.userId;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has enough balance to generate voucher
    if (user.balance < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient balance to generate voucher' });
    }

    // Generate unique voucher code
    const code = `VOUCHER${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Set expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const voucher = new Voucher({
      userId,
      amount: parseFloat(amount),
      type: type || 'reward',
      code,
      generatedBy: 'user',
      expiresAt
    });

    await voucher.save();

    // Deduct amount from user balance
    user.balance -= parseFloat(amount);
    await user.save();

    // Create transaction record for voucher generation
    const transaction = new Transaction({
      fromUserId: userId,
      toUserId: userId,
      type: 'voucher_generation',
      amount: parseFloat(amount),
      description: `Voucher generation: ${voucher.code}`,
      voucherId: voucher._id
    });

    await transaction.save();

    res.status(201).json({
      message: 'Voucher generated successfully',
      voucher: {
        _id: voucher._id,
        code: voucher.code,
        amount: voucher.amount,
        type: voucher.type,
        expiresAt: voucher.expiresAt,
        createdAt: voucher.createdAt
      },
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Generate voucher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Redeem voucher (user) - Modified to give money to voucher owner
app.post('/api/user/vouchers/redeem', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const redeemerId = req.user.userId;

    if (!code) {
      return res.status(400).json({ message: 'Voucher code is required' });
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher) {
      return res.status(404).json({ message: 'Invalid voucher code' });
    }

    if (voucher.status !== 'active') {
      return res.status(400).json({ message: 'Voucher is not active' });
    }

    // Allow anyone to redeem the voucher (remove user ID check for sharing)
    if (voucher.expiresAt < new Date()) {
      voucher.status = 'expired';
      await voucher.save();
      return res.status(400).json({ message: 'Voucher has expired' });
    }

    const redeemer = await User.findById(redeemerId);
    if (!redeemer) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the voucher owner (the user who generated it)
    const voucherOwner = await User.findById(voucher.userId);
    if (!voucherOwner) {
      return res.status(404).json({ message: 'Voucher owner not found' });
    }

    // Update voucher status
    voucher.status = 'used';
    voucher.usedAt = new Date();
    await voucher.save();

    // Add amount to voucher owner's balance (not the redeemer)
    voucherOwner.balance += voucher.amount;
    await voucherOwner.save();

    // Create transaction record - money goes to voucher owner
    const transaction = new Transaction({
      fromUserId: redeemerId, // Who redeemed it
      toUserId: voucher.userId, // Who gets the money (voucher owner)
      type: 'voucher_redemption',
      amount: voucher.amount,
      description: `Voucher redemption: ${voucher.code} - money sent to ${voucherOwner.username}`,
      voucherId: voucher._id
    });

    await transaction.save();

    res.json({
      message: `Voucher redeemed successfully! $${voucher.amount.toFixed(2)} has been added to ${voucherOwner.username}'s account.`,
      voucher: {
        code: voucher.code,
        amount: voucher.amount,
        type: voucher.type,
        owner: voucherOwner.username
      },
      redeemerBalance: redeemer.balance, // Redeemer's balance unchanged
      ownerReceived: voucher.amount
    });
  } catch (error) {
    console.error('Redeem voucher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's vouchers
app.get('/api/user/vouchers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const vouchers = await Voucher.find({ userId })
      .sort({ createdAt: -1 });

    res.json({ vouchers });
  } catch (error) {
    console.error('Get user vouchers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------
// Static Files & Server Start
// -----------------------

// Serve static files from the frontend build
const clientDist = path.join(__dirname, '../my-app/dist');
app.use(express.static(clientDist));

// Handle client-side routing
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(clientDist, 'index.html'));
  } else {
    res.status(404).json({ message: 'API endpoint not found' });
  }
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeProducts();
});
