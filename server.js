const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // SQLite 연결

const app = express();
const port = 3000;

// SQLite 데이터베이스 경로
const DB_PATH = path.join(__dirname, 'aviation_accidents.db');

// SQLite 데이터베이스 연결
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// 데이터를 가져오는 API (데이터베이스에서 가져오기)
app.get('/accidents', (req, res) => {
  db.all('SELECT * FROM accidents LIMIT 10', [], (err, rows) => {
    if (err) {
      console.error('Error fetching data from database:', err.message);  // 에러 메시지 출력
      res.status(500).send('Error fetching data from database');
    } else {
      console.log('Fetched rows:', rows);  // 쿼리 결과 로그
      res.json(rows);
    }
  });
});

// CSV 데이터를 데이터베이스로 가져오는 API
app.get('/import', (req, res) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS accidents (
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
  
  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
      res.status(500).send('Error creating table');
    } else {
      console.log('Accidents table created or already exists');
    }
  });

  const CSV_FILE_PATH = path.join(__dirname, 'data', 'aviation-accident.csv');
  
  if (fs.existsSync(CSV_FILE_PATH)) {
    console.log('File found at:', CSV_FILE_PATH);

    const results = [];
    const csv = require('csv-parser');
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (data) => results.push(data)) // 데이터를 results 배열에 추가
      .on('end', () => {
        console.log('CSV file successfully processed');
        
        // 데이터베이스에 데이터를 삽입
        const insertQuery = `
          INSERT INTO accidents (date, type, registration, operator, fatalities, location, country, cat, year)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.serialize(() => {
          const stmt = db.prepare(insertQuery);
          results.forEach((accident) => {
            stmt.run(accident.date, accident.type, accident.registration, accident.operator, accident.fatalities, accident.location, accident.country, accident.cat, accident.year);
          });
          stmt.finalize();
        });

        res.send('CSV data successfully imported into database');
      })
      .on('error', (err) => {
        console.error('Error reading CSV file:', err);
        res.status(500).send('Error processing CSV file');
      });
  } else {
    console.log('File not found at:', CSV_FILE_PATH);
    res.status(404).send('File not found');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
