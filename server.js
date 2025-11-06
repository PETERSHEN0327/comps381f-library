require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const User = require('./models/User');
const Book = require('./models/Book');
const Loan = require('./models/Loan');

const app = express();
const PORT = process.env.PORT || 8099;

// ---------- DB ----------
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('✅ Mongo connected successfully!'))
  .catch(err => console.error('❌ Mongo connection error:', err.message));

// ---------- Middlewares ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8h
}));

// ---------- Helpers ----------
function ensureAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}
function ensureAdmin(req, res, next) {
  if (req.session?.user?.role === 'admin') return next();
  return res.status(403).send('Permission denied.');
}
// 归还权限：借阅人或管理员
async function ensureLoanOwnerOrAdmin(req, res, next) {
  const loan = await Loan.findById(req.params.id).lean();
  if (!loan) return res.status(404).send('Loan not found');
  const me = req.session?.user;
  if (me?.role === 'admin' || me?.username === loan.borrower) return next();
  return res.status(403).send('Permission denied.');
}

// ---------- Seed default admin ----------
async function seedAdmin() {
  const count = await User.countDocuments();
  if (count === 0) {
    await User.createUser({ username: 'admin', password: 'admin123', role: 'admin' });
    console.log('🌱 Seeded admin: admin / admin123');
  }
}
seedAdmin();

// ---------- Root ----------
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/books');
  return res.redirect('/login');
});

// ---------- Auth ----------
app.get('/login', (req, res) => {
  const { msg } = req.query;
  res.render('login', { error: null, msg: msg || null });
});
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).render('login', { error: 'Invalid username or password', msg: null });
  }
  req.session.user = { id: user._id, username: user.username, role: user.role };
  res.redirect('/books');
});
app.post('/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));
app.get('/register', (req, res) => res.render('register', { error: null }));
app.post('/register', async (req, res) => {
  try {
    const { username, password, confirm } = req.body;
    if (!username || !password)
      return res.status(400).render('register', { error: 'Username and password are required' });
    if (password.length < 6)
      return res.status(400).render('register', { error: 'Password must be at least 6 characters' });
    if (password !== confirm)
      return res.status(400).render('register', { error: 'Passwords do not match' });
    const exists = await User.findOne({ username });
    if (exists)
      return res.status(400).render('register', { error: 'Username already exists' });
    await User.createUser({ username, password, role: 'user' });
    res.redirect('/login?msg=Account created. Please sign in.');
  } catch (e) {
    console.error(e);
    res.status(500).render('register', { error: 'Internal error, please try again.' });
  }
});

// ---------- Books（含搜索 + 分页） ----------
app.get('/books', ensureAuth, async (req, res) => {
  const { q = '', status = 'all', page = '1' } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const perPage = 10;

  const filter = {};
  if (q && q.trim()) {
    const kw = q.trim();
    filter.$or = [
      { title:  { $regex: kw, $options: 'i' } },
      { author: { $regex: kw, $options: 'i' } }
    ];
  }
  if (status && status !== 'all') filter.status = status;

  const [total, books] = await Promise.all([
    Book.countDocuments(filter),
    Book.find(filter).sort({ createdAt: -1 })
      .skip((pageNum - 1) * perPage).limit(perPage)
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const qsParts = [];
  if (q && q.trim()) qsParts.push(`q=${encodeURIComponent(q.trim())}`);
  if (status && status !== 'all') qsParts.push(`status=${encodeURIComponent(status)}`);
  const qs = qsParts.join('&');

  res.render('books/list', {
    user: req.session.user, books, q, status,
    page: pageNum, totalPages, total, perPage, qs
  });
});

// 仅管理员可创建书籍
app.get('/books/create', ensureAuth, ensureAdmin, (req, res) => {
  res.render('books/create', { user: req.session.user });
});
app.post('/books', ensureAuth, ensureAdmin, async (req, res) => {
  const { title, author, isbn } = req.body;
  await Book.create({ title, author, isbn });
  res.redirect('/books');
});

// ⚠️ 编辑页在详情页之前
app.get('/books/:id/edit', ensureAuth, ensureAdmin, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).send('Book not found');
  res.render('books/edit', { user: req.session.user, book });
});
app.put('/books/:id', ensureAuth, ensureAdmin, async (req, res) => {
  const { title, author, isbn, status } = req.body;
  await Book.findByIdAndUpdate(req.params.id, { title, author, isbn, status }, { runValidators: true });
  res.redirect(`/books/${req.params.id}`);
});
app.post('/books/:id/delete', ensureAuth, ensureAdmin, async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.redirect('/books');
});

// 详情页
app.get('/books/:id', ensureAuth, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).send('Book not found');
  res.render('books/details', { user: req.session.user, book });
});

// ---------- Loans ----------
// 所有借阅（分页）
app.get('/loans', ensureAuth, async (req, res) => {
  const { page = '1' } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const perPage = 10;

  const [total, loans] = await Promise.all([
    Loan.countDocuments({}),
    Loan.find({}).populate('book').sort({ loanedAt: -1 })
      .skip((pageNum - 1) * perPage).limit(perPage)
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  res.render('loans/list', {
    user: req.session.user,
    loans, page: pageNum, totalPages, total, perPage
  });
});

// 管理员：进入“创建借阅”页面（方便为他人借）
app.get('/loans/create', ensureAuth, ensureAdmin, async (req, res) => {
  const books = await Book.find({ status: 'available' }).sort({ title: 1 });
  res.render('loans/create', { user: req.session.user, books });
});

// 创建借阅（用户也可以，借书人自动设置为自己；管理员可以指定 borrower）
app.post('/loans', ensureAuth, async (req, res) => {
  const { bookId, borrower, dueDate } = req.body;
  const me = req.session.user;

  const book = await Book.findById(bookId);
  if (!book) return res.status(404).send('Book not found');
  if (book.status !== 'available') return res.status(400).send('Book is not available');

  const finalBorrower = (me.role === 'admin') ? (borrower || '').trim() : me.username;
  if (!finalBorrower) return res.status(400).send('Borrower is required');

  const finalDue = dueDate ? new Date(dueDate) : new Date(Date.now() + 14*24*60*60*1000);

  await Loan.create({ book: bookId, borrower: finalBorrower, dueDate: finalDue });
  await Book.findByIdAndUpdate(bookId, { status: 'loaned' });

  return res.redirect(me.role === 'admin' ? '/loans' : '/my/loans');
});

// 归还（借阅人或管理员均可）
app.post('/loans/:id/return', ensureAuth, ensureLoanOwnerOrAdmin, async (req, res) => {
  const loan = await Loan.findByIdAndUpdate(
    req.params.id,
    { returnedAt: new Date() },
    { new: true }
  );
  if (loan) await Book.findByIdAndUpdate(loan.book, { status: 'available' });

  // 归还后跳回来源更友好
  const me = req.session.user;
  if (me.role === 'admin') return res.redirect('/loans');
  return res.redirect('/my/loans');
});

// 我的借阅（分页）
app.get('/my/loans', ensureAuth, async (req, res) => {
  const { page = '1' } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const perPage = 10;
  const me = req.session.user.username;

  const [total, loans] = await Promise.all([
    Loan.countDocuments({ borrower: me }),
    Loan.find({ borrower: me }).populate('book').sort({ loanedAt: -1 })
      .skip((pageNum - 1) * perPage).limit(perPage)
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  res.render('loans/my', {
    user: req.session.user,
    loans, page: pageNum, totalPages, total, perPage
  });
});

// ---------- RESTful APIs (for demo) ----------
app.get('/api/books', async (req, res) => {
  const docs = await Book.find().lean();
  res.json(docs);
});
app.post('/api/books', async (req, res) => {
  try {
    const doc = await Book.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
app.put('/api/books/:id', async (req, res) => {
  try {
    const doc = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
app.delete('/api/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---------- 404 ----------
app.use((req, res) => res.status(404).send('Not Found'));

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
