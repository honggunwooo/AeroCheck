const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');

// 데이터베이스 연결 (aviation_accidents.db 파일이 없으면 자동 생성됨)
const db = new sqlite3.Database('aviation_accidents.db');

// CSV 파일 경로
const csvFilePath = 'data/aviation-accident.csv';

// 테이블이 없으면 생성하기
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
  )
`;

// 테이블 생성 쿼리 실행
db.run(createTableSQL, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
    return;
  }
  console.log('Table created or already exists.');
});

// CSV 파일 읽기 및 데이터 삽입
fs.createReadStream(csvFilePath)
  .pipe(csv()) // csv-parser로 파싱
  .on('data', (row) => {
    const insertSQL = `
      INSERT INTO aviation_accidents (date, type, registration, operator, fatalities, location, country, cat, year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // 데이터 삽입
    db.run(insertSQL, [
      row.date,
      row.type,
      row.registration,
      row.operator,
      row.fatalities,
      row.location,
      row.country,
      row.cat,
      row.year
    ], (err) => {
      if (err) {
        console.error('Error inserting data:', err.message);
      }
    });
  })
  .on('end', () => {
    console.log('CSV file processed and data inserted into the database.');
    db.close();  // 데이터베이스 연결 종료
  })
  .on('error', (err) => {
    console.error('Error reading CSV file:', err.message);
  });
