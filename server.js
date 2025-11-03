const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8099;

// 连接 MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // 10 秒超时防止卡死
})
  .then(() => console.log('✅ Mongo connected successfully!'))
  .catch(err => console.error('❌ Mongo connection error:', err.message));

// 基本路由
app.get('/', (req, res) => {
  res.send('<h1>Hello, Library System is running with MongoDB Atlas!</h1>');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
