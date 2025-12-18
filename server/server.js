/**
 * SendellBank Mock API Server
 *
 * This server provides a mock REST API for the SendellBank application
 * using json-server with custom middlewares for authentication and business logic.
 */

const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ noCors: false });

// Configuration
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sendell-bank-secret-key-2024';
const TOKEN_EXPIRY = '24h';

// Apply default middlewares (logger, static, cors, no-cache)
server.use(middlewares);

// Parse JSON bodies
server.use(jsonServer.bodyParser);

// Add delay to simulate network latency
server.use((req, res, next) => {
  const delay = Math.random() * 300 + 100; // 100-400ms
  setTimeout(next, delay);
});

// CORS headers
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId, type: 'access' }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Helper to verify token
const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Auth middleware for protected routes
const authMiddleware = (req, res, next) => {
  const publicPaths = ['/auth/login', '/auth/verify-otp', '/auth/refresh'];

  if (publicPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token inválido o expirado'
      }
    });
  }

  req.userId = decoded.userId;
  next();
};

// ==================== AUTH ENDPOINTS ====================

// Login - Step 1: Validate credentials
server.post('/auth/login', (req, res) => {
  const { documentNumber, password } = req.body;
  const db = router.db;

  // Find user by document number
  const user = db.get('users').find({ documentNumber }).value();

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Documento o contraseña incorrectos'
      }
    });
  }

  // In a real app, we'd verify the password hash
  // For mock purposes, accept any password with length >= 8
  if (!password || password.length < 8) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Documento o contraseña incorrectos'
      }
    });
  }

  // Generate OTP (for mock, always "123456")
  const otpCode = '123456';
  console.log(`[AUTH] OTP for ${documentNumber}: ${otpCode}`);

  res.json({
    success: true,
    data: {
      requiresOtp: user.preferences.twoFactorEnabled,
      maskedPhone: user.phone.replace(/\d(?=\d{2})/g, '*'),
      userId: user.id
    }
  });
});

// Login - Step 2: Verify OTP
server.post('/auth/verify-otp', (req, res) => {
  const { userId, otpCode } = req.body;
  const db = router.db;

  // For mock, accept "123456" as valid OTP
  if (otpCode !== '123456') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_OTP',
        message: 'Código OTP incorrecto'
      }
    });
  }

  const user = db.get('users').find({ id: userId }).value();
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      }
    });
  }

  // Generate tokens
  const tokens = generateTokens(user.id);

  // Update last login
  db.get('users')
    .find({ id: userId })
    .assign({ lastLogin: new Date().toISOString() })
    .write();

  // Create session
  const session = {
    id: `session_${Date.now()}`,
    userId: user.id,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  db.get('sessions').push(session).write();

  // Remove sensitive data
  const { documentNumber: _, ...safeUser } = user;

  res.json({
    success: true,
    data: {
      user: safeUser,
      session: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: session.expiresAt
      }
    }
  });
});

// Refresh token
server.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const tokens = generateTokens(decoded.userId);

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Token de actualización inválido'
      }
    });
  }
});

// Logout
server.post('/auth/logout', authMiddleware, (req, res) => {
  const db = router.db;

  // Remove session
  db.get('sessions')
    .remove({ userId: req.userId })
    .write();

  res.json({
    success: true,
    data: { message: 'Sesión cerrada correctamente' }
  });
});

// ==================== USER ENDPOINTS ====================

// Get current user
server.get('/users/me', authMiddleware, (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.userId }).value();

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      }
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// Update user preferences
server.patch('/users/me/preferences', authMiddleware, (req, res) => {
  const db = router.db;
  const { preferences } = req.body;

  db.get('users')
    .find({ id: req.userId })
    .assign({ preferences: { ...db.get('users').find({ id: req.userId }).value().preferences, ...preferences } })
    .write();

  const user = db.get('users').find({ id: req.userId }).value();

  res.json({
    success: true,
    data: user
  });
});

// ==================== ACCOUNTS ENDPOINTS ====================

// Get user accounts
server.get('/accounts', authMiddleware, (req, res) => {
  const db = router.db;
  const accounts = db.get('accounts').filter({ userId: req.userId }).value();

  res.json({
    success: true,
    data: accounts
  });
});

// Get single account
server.get('/accounts/:id', authMiddleware, (req, res) => {
  const db = router.db;
  const account = db.get('accounts')
    .find({ id: req.params.id, userId: req.userId })
    .value();

  if (!account) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ACCOUNT_NOT_FOUND',
        message: 'Cuenta no encontrada'
      }
    });
  }

  res.json({
    success: true,
    data: account
  });
});

// Get account transactions
server.get('/accounts/:id/transactions', authMiddleware, (req, res) => {
  const db = router.db;
  const { page = 1, limit = 20, type, category, dateFrom, dateTo } = req.query;

  let transactions = db.get('transactions')
    .filter({ accountId: req.params.id })
    .value();

  // Apply filters
  if (type) {
    transactions = transactions.filter(t => t.type === type);
  }
  if (category) {
    transactions = transactions.filter(t => t.category === category);
  }
  if (dateFrom) {
    transactions = transactions.filter(t => new Date(t.date) >= new Date(dateFrom));
  }
  if (dateTo) {
    transactions = transactions.filter(t => new Date(t.date) <= new Date(dateTo));
  }

  // Sort by date (newest first)
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedTransactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: transactions.length,
      totalPages: Math.ceil(transactions.length / limit)
    }
  });
});

// ==================== CARDS ENDPOINTS ====================

// Get user cards
server.get('/cards', authMiddleware, (req, res) => {
  const db = router.db;
  const cards = db.get('cards').filter({ userId: req.userId }).value();

  res.json({
    success: true,
    data: cards
  });
});

// Get single card
server.get('/cards/:id', authMiddleware, (req, res) => {
  const db = router.db;
  const card = db.get('cards')
    .find({ id: req.params.id, userId: req.userId })
    .value();

  if (!card) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CARD_NOT_FOUND',
        message: 'Tarjeta no encontrada'
      }
    });
  }

  res.json({
    success: true,
    data: card
  });
});

// Update card settings
server.patch('/cards/:id/settings', authMiddleware, (req, res) => {
  const db = router.db;
  const { settings } = req.body;

  const card = db.get('cards').find({ id: req.params.id, userId: req.userId }).value();
  if (!card) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CARD_NOT_FOUND',
        message: 'Tarjeta no encontrada'
      }
    });
  }

  db.get('cards')
    .find({ id: req.params.id })
    .assign({ settings: { ...card.settings, ...settings } })
    .write();

  const updatedCard = db.get('cards').find({ id: req.params.id }).value();

  res.json({
    success: true,
    data: updatedCard
  });
});

// Block/Unblock card
server.post('/cards/:id/block', authMiddleware, (req, res) => {
  const db = router.db;
  const { reason } = req.body;

  const card = db.get('cards').find({ id: req.params.id, userId: req.userId }).value();
  if (!card) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CARD_NOT_FOUND',
        message: 'Tarjeta no encontrada'
      }
    });
  }

  db.get('cards')
    .find({ id: req.params.id })
    .assign({ status: 'blocked', blockedReason: reason })
    .write();

  res.json({
    success: true,
    data: { message: 'Tarjeta bloqueada correctamente' }
  });
});

server.post('/cards/:id/unblock', authMiddleware, (req, res) => {
  const db = router.db;

  const card = db.get('cards').find({ id: req.params.id, userId: req.userId }).value();
  if (!card) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CARD_NOT_FOUND',
        message: 'Tarjeta no encontrada'
      }
    });
  }

  db.get('cards')
    .find({ id: req.params.id })
    .assign({ status: 'active', blockedReason: null })
    .write();

  res.json({
    success: true,
    data: { message: 'Tarjeta desbloqueada correctamente' }
  });
});

// ==================== TRANSFERS ENDPOINTS ====================

// Get beneficiaries
server.get('/beneficiaries', authMiddleware, (req, res) => {
  const db = router.db;
  const beneficiaries = db.get('beneficiaries').filter({ userId: req.userId }).value();

  res.json({
    success: true,
    data: beneficiaries
  });
});

// Create beneficiary
server.post('/beneficiaries', authMiddleware, (req, res) => {
  const db = router.db;
  const { alias, name, iban, bank } = req.body;

  const newBeneficiary = {
    id: `ben_${Date.now()}`,
    userId: req.userId,
    alias,
    name,
    iban,
    bank: bank || 'Desconocido',
    isFavorite: false,
    createdAt: new Date().toISOString()
  };

  db.get('beneficiaries').push(newBeneficiary).write();

  res.status(201).json({
    success: true,
    data: newBeneficiary
  });
});

// Create transfer
server.post('/transfers', authMiddleware, (req, res) => {
  const db = router.db;
  const { fromAccountId, toAccount, amount, currency, concept, scheduledDate } = req.body;

  // Validate source account
  const sourceAccount = db.get('accounts')
    .find({ id: fromAccountId, userId: req.userId })
    .value();

  if (!sourceAccount) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ACCOUNT_NOT_FOUND',
        message: 'Cuenta origen no encontrada'
      }
    });
  }

  // Check balance
  if (sourceAccount.availableBalance < amount) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_FUNDS',
        message: 'Saldo insuficiente para realizar la transferencia'
      }
    });
  }

  // Determine transfer type
  const isInternal = db.get('accounts').find({ number: toAccount.iban.replace(/\s/g, '') }).value();
  const type = isInternal ? 'internal' : 'national';

  // Create transfer record
  const transfer = {
    id: `trf_${Date.now()}`,
    userId: req.userId,
    fromAccountId,
    toAccount,
    amount,
    currency: currency || 'EUR',
    concept,
    type,
    status: scheduledDate ? 'scheduled' : 'completed',
    scheduledDate: scheduledDate || null,
    executedAt: scheduledDate ? null : new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  db.get('transfers').push(transfer).write();

  // If immediate transfer, update balances and create transactions
  if (!scheduledDate) {
    // Debit source account
    db.get('accounts')
      .find({ id: fromAccountId })
      .assign({
        balance: sourceAccount.balance - amount,
        availableBalance: sourceAccount.availableBalance - amount
      })
      .write();

    // Create debit transaction
    const debitTxn = {
      id: `txn_${Date.now()}`,
      accountId: fromAccountId,
      type: 'transfer',
      category: 'transfer',
      amount: -amount,
      currency: currency || 'EUR',
      description: concept || 'Transferencia',
      reference: transfer.id,
      counterparty: {
        name: toAccount.name,
        account: toAccount.iban
      },
      status: 'completed',
      date: new Date().toISOString(),
      valueDate: new Date().toISOString()
    };

    db.get('transactions').push(debitTxn).write();

    // If internal transfer, credit destination account
    if (isInternal) {
      const destAccount = db.get('accounts').find({ number: toAccount.iban.replace(/\s/g, '') }).value();

      db.get('accounts')
        .find({ id: destAccount.id })
        .assign({
          balance: destAccount.balance + amount,
          availableBalance: destAccount.availableBalance + amount
        })
        .write();

      const creditTxn = {
        id: `txn_${Date.now() + 1}`,
        accountId: destAccount.id,
        type: 'transfer',
        category: 'transfer',
        amount: amount,
        currency: currency || 'EUR',
        description: concept || 'Transferencia recibida',
        reference: transfer.id,
        counterparty: {
          name: sourceAccount.alias,
          account: sourceAccount.number
        },
        status: 'completed',
        date: new Date().toISOString(),
        valueDate: new Date().toISOString()
      };

      db.get('transactions').push(creditTxn).write();
    }
  }

  res.status(201).json({
    success: true,
    data: transfer
  });
});

// Get transfer history
server.get('/transfers', authMiddleware, (req, res) => {
  const db = router.db;
  const { page = 1, limit = 20, status } = req.query;

  let transfers = db.get('transfers').filter({ userId: req.userId }).value();

  if (status) {
    transfers = transfers.filter(t => t.status === status);
  }

  // Sort by date
  transfers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransfers = transfers.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedTransfers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: transfers.length,
      totalPages: Math.ceil(transfers.length / limit)
    }
  });
});

// ==================== NOTIFICATIONS ENDPOINTS ====================

// Get notifications
server.get('/notifications', authMiddleware, (req, res) => {
  const db = router.db;
  const notifications = db.get('notifications')
    .filter({ userId: req.userId })
    .sortBy('createdAt')
    .reverse()
    .value();

  res.json({
    success: true,
    data: notifications
  });
});

// Mark notification as read
server.patch('/notifications/:id/read', authMiddleware, (req, res) => {
  const db = router.db;

  db.get('notifications')
    .find({ id: req.params.id, userId: req.userId })
    .assign({ read: true })
    .write();

  res.json({
    success: true,
    data: { message: 'Notificación marcada como leída' }
  });
});

// Mark all notifications as read
server.post('/notifications/read-all', authMiddleware, (req, res) => {
  const db = router.db;

  db.get('notifications')
    .filter({ userId: req.userId })
    .each(n => n.read = true)
    .write();

  res.json({
    success: true,
    data: { message: 'Todas las notificaciones marcadas como leídas' }
  });
});

// Apply auth middleware
server.use(authMiddleware);

// Use default router for any remaining routes
server.use(router);

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏦  SendellBank Mock API Server                         ║
║                                                           ║
║   Running on: http://localhost:${PORT}                      ║
║                                                           ║
║   Test credentials:                                       ║
║   - Document: 12345678A                                   ║
║   - Password: (any 8+ characters)                         ║
║   - OTP Code: 123456                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
