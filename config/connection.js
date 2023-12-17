const mysql = require('mysql')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Examdb2',
    multipleStatements: true
})

module.exports = db