const sqlite3 = require('sqlite3').verbose();

// 데이터베이스 연결 (없으면 새로 생성됨)
const db = new sqlite3.Database('aviation_accidents.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// 테이블 생성 쿼리
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS aviation_accidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    type TEXT,
    registration TEXT,
    operator TEXT,
    fatalities TEXT,
    location TEXT,
    country TEXT,
    cat TEXT,
    year TEXT
  );
`;

// 테이블 생성
db.run(createTableSQL, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('Table created or already exists.');
  }
});

// 연결 종료
db.close();

