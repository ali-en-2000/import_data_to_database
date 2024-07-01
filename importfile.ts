import * as fs from 'fs';
import * as path from 'path';
import sqlite3 from 'sqlite3';

let ayaTextArray: string[] = [];
let ayaNumberArray: (string | number)[] = [];
let surahNumberArray: (string | number)[] = [];
let translateEnYusufali: string[] = [];
let translateFaFooladvand: string[] = [];
let translateFaMakarem: string[] = [];
let sql: string = '';
let quranDatabaseRowsAmount: number = 0;
let allowToExecute: boolean = false;
const rawTextAddressArray: string[] = [
  './raw/quran_text/quran-simple.txt',
  './raw/quran_translations/en.yusufali.txt',
  './raw/quran_translations/fa.fooladvand.txt',
  './raw/quran_translations/fa.makarem.txt'
];

let isDatabaseFolderCreated: boolean = false;
let isDatabaseFileCreated: boolean = false;

const databasePath = path.join(__dirname, 'database', 'quran.db');

function createDatabaseDirectory() {
  if (!isDatabaseFolderCreated) {
    fs.mkdir(path.join(__dirname, 'database'), { recursive: true }, (err: any) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Database folder created ...');
        isDatabaseFolderCreated = true;
        createDatabaseFile();
      }
    });
  } else {
    createDatabaseFile();
  }
}

function createDatabaseFile() {
  if (!isDatabaseFileCreated) {
    fs.writeFile(databasePath, '', (err: any) => {
      if (err) {
        console.error(err);
      } else {
        console.log('quran.db created ...');
        isDatabaseFileCreated = true;
        connectToDatabase();
      }
    });
  } else {
    connectToDatabase();
  }
}

function connectToDatabase() {
  const database = new sqlite3.Database(databasePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err: any) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to the database.');
      createQuranTable(database);
    }
  });
}

function createQuranTable(database: sqlite3.Database) {
  sql = `CREATE TABLE IF NOT EXISTS quran 
        (id INTEGER NOT NULL PRIMARY KEY, 
        surah_number INTEGER,
        aya_number INTEGER,
        text TEXT)`;
  database.run(sql, (err: any) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      getTableRowsAmount(database);
    }
  });
}

function ayaProcess() {
  if (allowToExecute) {
    for (let i = 0; i < rawTextAddressArray.length; i++) {
      let rawText = fs.readFileSync(rawTextAddressArray[i], 'utf-8');

      rawText.split(/\r?\n/).forEach((line: string) => {
        let columns = line.split('|');
        surahNumberArray.push(columns[0]);
        ayaNumberArray.push(columns[1]);

        switch (rawTextAddressArray[i]) {
          case './raw/quran_text/quran-simple.txt':
            ayaTextArray.push(columns[2]);
            break;
          case './raw/quran_translations/en.yusufali.txt':
            translateEnYusufali.push(columns[2]);
            break;
          case './raw/quran_translations/fa.fooladvand.txt':
            translateFaFooladvand.push(columns[2]);
            break;
          case './raw/quran_translations/fa.makarem.txt':
            translateFaMakarem.push(columns[2]);
            break;
        }
      });
    }
  }
}

function addAyaToDatabase(database: sqlite3.Database) {
  if (allowToExecute) {
    for (let i = 0; i < ayaTextArray.length; i++) {
      sql = `INSERT INTO quran 
            (id, 
            surah_number,
            aya_number,
            text)
            VALUES (?, ?, ?, ?)`;
      database.run(sql, [i, surahNumberArray[i], ayaNumberArray[i], ayaTextArray[i]], (err: any) => {
        if (err) {
          console.error(err.message);
        }
      });
    }
  }
}

function getTableRowsAmount(database: sqlite3.Database) {
  sql = 'SELECT COUNT(*) FROM quran';
  database.all(sql, [], (err: any, result: any) => {
    if (err) {
      console.error(err);
    } else {
      quranDatabaseRowsAmount = result[0]['COUNT(*)'];
      allowToExecute = quranDatabaseRowsAmount < 6230;
      ayaProcess();
      addAyaToDatabase(database);
    }
  });
}

createDatabaseDirectory();
