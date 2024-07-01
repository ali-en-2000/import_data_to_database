import * as sqlite3 from 'sqlite3';

// این فایل برای خواندن از دیتا از دیتا بیس 
const databasePath = './database/quran.db';
const database = new sqlite3.Database(databasePath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database.');
        readDataFromDatabase();
    }
});

// تابع برای خواندن داده‌ها از دیتابیس
function readDataFromDatabase() {
    const sql = 'SELECT * FROM quran LIMIT 100'; // کوئری برای خواندن 100 ردیف اول
    database.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
        } else {
            rows.forEach((row) => {
                console.log(row);
            });
        }
    });
}
