const mysql = require('mysql')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ExamDB',
    multipleStatements: true
})

module.exports = db