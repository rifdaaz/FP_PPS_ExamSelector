const express = require('express')
// const db = require('./config/connection')
const bodyParser = require('body-parser')
const app = express()
const multer = require('multer');
const xlsx = require('xlsx');
const port = 3000

const mysql = require('mysql')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ExamDB',
    multipleStatements: true
})

module.exports = db


// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");

//kodinganku
//bab topik
app.post('/topik', (req, res) => {
    const { nama_topik } = req.body
    const sql = `INSERT INTO topik (id_topik, nama_topik) VALUES (NULL, '${nama_topik}')`
    db.query(sql, (error, result) => {
        res.redirect('/soal')
    })
})
app.get('/topik/delete/:id', (req, res) => {
    const id = req.params.id
    const sql = `DELETE FROM topik WHERE id_topik = ${id}`
    db.query(sql, (error, result) => {
        res.redirect('/soal')
    })
})
//soal

app.get('/soal', (req, res) => {
    const sql1 = `SELECT id_topik, nama_topik FROM topik`;
    const sql2 = `SELECT bank_soal.id_banksoal, topik.nama_topik, bank_soal.tingkat_kesulitan FROM bank_soal INNER JOIN topik ON bank_soal.id_topik=topik.id_topik`;
    
    db.query(sql1, (error1, result1) => {
        if (error1) {
            // Handle error if SQL1 query fails
            console.log(error1);
            return res.status(500).send('Internal Server Error');
        }

        db.query(sql2, (error2, result2) => {
            if (error2) {
                // Handle error if SQL2 query fails
                console.log(error2);
                return res.status(500).send('Internal Server Error');
            }

            res.render('soal', { topik: result1, bank_soal: result2 });
            //res.send({topik:result1, bank_soal:result2})
        });
    });
});



// app.get('/soal/tambah', (req, res) => {
//     const sql = `SELECT id_topik, nama_topik FROM topik`
//     db.query(sql, (error, result) => {
//         //res.render('tambahsoal', { topik:result })
//         res.send({ topik:result })
//     })
// })
app.post('/soal/simpan', (req, res) => {
    const { id_topik, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_benar, tingkat_kesulitan } = req.body;
    const sql = `INSERT INTO bank_soal (id_banksoal, id_topik, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_benar, tingkat_kesulitan) VALUES (NULL, '${id_topik}', '${pertanyaan}', '${pilihan_a}', '${pilihan_b}', '${pilihan_c}', '${pilihan_d}', ${pilihan_benar}, ${tingkat_kesulitan})`;

    db.query(sql, (error, result) => {
        if (error) {
            res.status(500).send({ error: "Gagal menambahkan soal" });
        } else {
            res.redirect('/soal');
        }
    });
});


app.get('/soal/hapus/:id', (req, res) => {
    const id = req.params.id
    const sql = `DELETE FROM bank_soal WHERE id_paketsoal = ${id}`
    db.query(sql, (error, result) => {
        res.redirect('/soal')
    })
})

app.get('/soal/tambah', (req, res) => {
    const sql = `SELECT id_topik, nama_topik FROM topik`
    db.query(sql, (error, result) => {
        if (error) {
            res.status(500).send({ error: "Gagal memuat daftar bab topik" });
        } else {
            res.render('tambahsoal', { topik: result });
        }
    });
});

app.get('/soal/upload', (req, res) => {
    res.render('uploadsoal'); // Rendering EJS template
  });

app.get('/soal/:id', (req, res) => {
    const id = req.params.id
    const sql1 = `SELECT id_topik, nama_topik FROM topik`
    const sql2 = `SELECT bank_soal.id_banksoal, bank_soal.pertanyaan, bank_soal.pilihan_a, bank_soal.pilihan_b, bank_soal.pilihan_c, bank_soal.pilihan_d, bank_soal.pilihan_benar, bank_soal.id_topik, topik.nama_topik, bank_soal.tingkat_kesulitan FROM bank_soal INNER JOIN topik ON bank_soal.id_topik=topik.id_topik WHERE bank_soal.id_banksoal=${id}`
    db.query(sql1, (error, result1) => {
        db.query(sql2, (error, result2) => {
            res.render('editsoal', {topik:result1, bank_soal:result2[0]})
        })
    })
})

app.post('/soal/ubah/:id', (req, res) => {
    const id = req.params.id
    const { pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_benar, id_topik, tingkat_kesulitan} = req.body
    const sql = `UPDATE bank_soal SET pertanyaan='${pertanyaan}', pilihan_a='${pilihan_a}', pilihan_b='${pilihan_b}', pilihan_c='${pilihan_c}', pilihan_d='${pilihan_d}', pilihan_benar='${pilihan_benar}', id_topik='${id_topik}', tingkat_kesulitan='${tingkat_kesulitan}' WHERE id_paketsoal = ${id}`
    db.query(sql, (error, result) => {
        res.redirect('/soal')
    })
})
//paket soal (exam)
app.get('/paketsoal', (req, res) => {
    const sql = `SELECT id_paketsoal, nama, jumlah_soal, kode_paketsoal FROM paketsoal`;
    db.query(sql, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }

        res.render('paketsoal', { paketsoal: result });
    });
});


//konfigurasi
app.post('/paketsoal/simpan', (req, res) => {
    const { nama, jumlah_soal } = req.body
    const sql1 = `INSERT INTO paketsoal (id_paketsoal, nama, jumlah_soal, kode_paketsoal) VALUES (NULL, '${nama}', ${jumlah_soal}, NULL)`
    const sql2 = `SELECT id_paketsoal FROM paketsoal ORDER BY id_paketsoal DESC LIMIT 1`
    db.query(sql1, (error, result1) => {
        if (error) {
            res.status(500).send({ error: "Gagal menambahkan paketsoal" });
        } else {
            res.redirect('/paketsoal');
        }
        });
    });


app.get('/konfigurasi/:id_paketsoal', (req, res) => {
    const id_paketsoal = req.params.id_paketsoal
    const sql1 = `SELECT id_paketsoal, nama, kode_paketsoal FROM paketsoal WHERE id_paketsoal=${id_paketsoal}`
    const sql2 = `SELECT bank_soal.pertanyaan, bank_soal.pilihan_a, bank_soal.pilihan_b, bank_soal.pilihan_c, bank_soal.pilihan_d FROM preview INNER JOIN bank_soal ON preview.id_banksoal = bank_soal.id_banksoal WHERE preview.id_paketsoal = ${id_paketsoal}`
    db.query(sql1, (error, result1) => {
        db.query(sql2, (error, result2) => {
            res.render('detailpaketsoal', {paketsoal:result1[0], bank_soal:result2})
        })
    })
})

app.get('/konfigurasi/:id_paketsoal', (req, res) => {
    const id_paketsoal = req.params.id_paketsoal
    const sql1 = `SELECT id_paketsoal, nama, kode_paketsoal FROM paketsoal WHERE id_paketsoal=${id_paketsoal}`
    const sql2 = `SELECT bank_soal.pertanyaan, bank_soal.pilihan_a, bank_soal.pilihan_b, bank_soal.pilihan_c, bank_soal.pilihan_d FROM preview INNER JOIN bank_soal ON preview.id_banksoal = bank_soal.id_banksoal WHERE preview.id_paketsoal = ${id_paketsoal}`
    db.query(sql1, (error, result1) => {
       db.query(sql2, (error, result2) => {
            res.render('detailpaketsoal', {paketsoal:result1[0], bank_soal:result2})
        })
    })
})

app.get('/konfigurasi', (req, res) => {
    const sql = 'SELECT id_paketsoal, nama FROM paketsoal'
    db.query(sql, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
        res.render('konfigurasi', { paketsoal: result });
    });
});

app.get('/editkonfigurasi/:id_paketsoal', (req, res) => {
    const id_paketsoal = req.params.id_paketsoal
    const sqlPaketSoal = `SELECT * FROM paketsoal WHERE id_paketsoal = ${id_paketsoal}`
    const sqltopik = `SELECT id_topik, nama_topik FROM topik`
    const sqlTopikUjian = `SELECT konfigurasi.id_exam, topik.nama_topik, konfigurasi.persentase_topik, konfigurasi.persentase_mudah, konfigurasi.persentase_sedang, konfigurasi.persentase_sulit FROM konfigurasi INNER JOIN topik ON konfigurasi.id_topik=topik.id_topik WHERE konfigurasi.id_paketsoal=${id_paketsoal}`
    db.query(sqlPaketSoal, (error, result1) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
        if (result1.length) {
        db.query(sqlTopikUjian, (error, result2) => {
            db.query(sqltopik, (error, result3) => {
            // res.send({konfigurasi:result2})
            //res.render('editkonfigurasi', {paketsoal:result1[0], topik:result2, zzz:result3})
            res.render('editkonfigurasi', {paketsoal:result1[0], konfigurasi:result2, topik:result3})
            })
        })
     }
    })
})

//Nyimpen konfigurasi detail exam (fix jadi paketujian)
app.post('/topikujian/:id_paketsoal', (req, res) => {
    const { id_paketsoal, id_topik, persentase_topik, persentase_mudah, persentase_sedang, persentase_sulit } = req.body;

    if (!id_paketsoal || !id_topik || !persentase_topik || !persentase_mudah || !persentase_sedang || !persentase_sulit) {
        const missingFields = [];
        if (!id_paketsoal) missingFields.push('id_paketsoal');
        if (!id_topik) missingFields.push('id_topik');
        if (!persentase_topik) missingFields.push('persentase_topik');
        if (!persentase_mudah) missingFields.push('persentase_mudah');
        if (!persentase_sedang) missingFields.push('persentase_sedang');
        if (!persentase_sulit) missingFields.push('persentase_sulit');

        return res.status(400).send(`Missing data: ${missingFields.join(', ')}`);
    }

    // Sekarang mari kita lanjutkan dengan proses query

    if (parseFloat(persentase_mudah) + parseFloat(persentase_sedang) + parseFloat(persentase_sulit) === 1.0) {
        const sql1 = `SELECT EXISTS (SELECT id_exam FROM konfigurasi WHERE id_paketsoal = ${id_paketsoal} AND id_topik = ${id_topik}) AS isExists`;
        
        db.query(sql1, (error, result1) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Internal Server Error');
            }

            if (result1.length > 0 && result1[0].isExists === 0) {
                const sql2 = `INSERT INTO konfigurasi (id_exam, id_paketsoal, id_topik, persentase_topik, persentase_mudah, persentase_sedang, persentase_sulit) VALUES (NULL, ${id_paketsoal}, ${id_topik}, ${persentase_topik}, ${persentase_mudah}, ${persentase_sedang}, ${persentase_sulit})`;
                
                db.query(sql2, (error, result2) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).send('Internal Server Error');
                    }
                    res.redirect(`/editkonfigurasi/${id_paketsoal}`); // Masuk ke detail ujian (detail paketsoal = detail paket ujian)
                });
            } else {
                res.status(400).send('Invalid or missing data');
            }
        });
    } else {
        res.status(400).send('Invalid data for percentage');
    }
});


    
app.post('/konfigurasi/ubah/:id', (req, res) => {
    const id = req.params.id
    const { nama, jumlah_soal } = req.body
    const sql = `UPDATE exam SET nama='${nama}', jumlah_soal=${jumlah_soal} WHERE id_paketsoal = ${id}`
    db.query(sql, (error, result) => {
        res.redirect(`/konfigurasi/${id}`)
    })
})
app.post('/topikujian/simpan', (req,res) => {
    const { id_paketsoal, id_topik, persentase_topik, persentase_mudah, persentase_sedang, persentase_sulit } = req.body
    if (parseFloat(persentase_mudah) + parseFloat(persentase_sedang) + parseFloat(persentase_sulit) == 1.0) {
        const sql1 = `SELECT EXISTS (SELECT id_exam FROM konfigurasi WHERE id_paketsoal = ${id_paketsoal} AND id_topik = ${id_topik}) AS isExists`
        db.query(sql1, (error, result1) => {
            if (result1[0].isExists == 0) {
                const sql2 = `INSERT INTO konfigurasi (id_exam, id_paketsoal, id_topik, persentase_topik, persentase_mudah, persentase_sedang, persentase_sulit) VALUES (NULL, ${id_paketsoal}, ${id_topik}, ${persentase_topik}, ${persentase_mudah}, ${persentase_sedang}, ${persentase_sulit})`
                db.query(sql2, (error, result2) => {})
            }
        })
    }
    res.redirect(`/editkonfigurasi/${id_paketsoal}`)
})
app.delete('/topikujian/hapus/:id_exam', (req, res) => {
    const id_exam = req.params.id_exam
    const sql1 = `SELECT id_paketsoal FROM preview WHERE id_exam = ${id_exam}`
    const sql2 = `DELETE FROM preview WHERE id_exam = ${id_exam}`
    db.query(sql1, (error, result1) => {
        db.query(sql2, (error, result2) => {})
         res.redirect('/paketsoal')
     })
})

app.get('/konfigurasi/:id_paketsoal', (req, res) => {
    const id_paketsoal = req.params.id_paketsoal
    const sql1 = `SELECT * FROM paketsoal WHERE id_paketsoal = ${id_paketsoal}`
    //const sql2 = `SELECT id_topik, nama_topik FROM topik`
    const sql3 = `SELECT konfigurasi.id_exam, topik.nama_topik, konfigurasi.persentase_topik, konfigurasi.persentase_mudah, konfigurasi.persentase_sedang, konfigurasi.persentase_sulit FROM konfigurasi INNER JOIN topik ON konfigurasi.id_topik=topik.id_topik WHERE konfigurasi.id_paketsoal=${id_paketsoal}`
    db.query(sql1, (error, result1) => {
        if (result1.length) {
        // db.query(sql2, (error, result2) => {
            db.query(sql3, (error, result2) => {
            res.render('editkonfigurasi', {exam:result1[0], topik:result2, konfigurasi:result3})
                //res.send({paketsoal:result1[0], konfigurasi:result2})
            })
        }  
    })
})

// //login
// app.get('/login', (res) => {
//     res.render('login')
// })

//UPLOAD FILE
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/datauploadbanksoal', upload.single('bankSoalFile'), async (req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

        const bankSoalSheet = workbook.Sheets[workbook.SheetNames[0]];
        // const bankJawabanSheet = workbook.Sheets[workbook.SheetNames[1]];

        const bank_soal = xlsx.utils.sheet_to_json(bankSoalSheet);
        // const dataJawaban = xlsx.utils.sheet_to_json(bankJawabanSheet);

        for (const row of bank_soal) {
            const { id_topik, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_benar, tingkat_kesulitan } = row;

            // Check for undefined values and set them to null
            const id_topikValue = id_topik || null;
            const pertanyaanValue = pertanyaan || null;
            const pilihan_aValue = pilihan_a || null;
            const pilihan_bValue = pilihan_b || null;
            const pilihan_cValue = pilihan_c || null;
            const pilihan_dValue = pilihan_d || null;
            const pilihan_benarValue = pilihan_benar || null;
            const tingkatKesulitanValue = tingkat_kesulitan || null;

            const sql = `INSERT INTO bank_soal (id_topik, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_benar, tingkat_kesulitan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [id_topikValue, pertanyaanValue, pilihan_aValue, pilihan_bValue, pilihan_cValue, pilihan_dValue, pilihan_benarValue, tingkatKesulitanValue];

            await db.query(sql, values);
        }

        res.send('Bank soal data successfully uploaded and imported into the database.');

        // db.end(); // No need to end the connection here if you plan to reuse it.
    } catch (error) {
        console.error('Error uploading and importing data:', error);
        res.status(500).send('An error occurred while uploading and importing data.');
    }
});
//upload done

//paket soal
app.post('/datapaketsoal/:id_paketsoal', (req, res) => {
    const id_paketsoal = req.params.id_paketsoal

    // Cek konfigurasi paket soal
    async function checkConfig(id_paketsoal) {
        try {
            const sqlCheckConfig = `SELECT ROUND(SUM(persentase_topik), 2) AS 'total' FROM konfigurasi WHERE id_paketsoal = ?`
            const result = await new Promise((resolve, reject) => {
                db.query(sqlCheckConfig, [ id_paketsoal ], (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                })
            })
            return result[0].total
        } catch (error) {
            return res.status(500).json({ message: 'Ada kesalahan! 1' })
        }
    }
    
    // Hitung soal yang diperlukan
    async function getNumofSoal(id_paketsoal) {
        try {
            const sqlPaketsoal = `SELECT jumlah_soal FROM paketsoal WHERE id_paketsoal = ?`
            const jumlah_soal = await new Promise((resolve, reject) => {
                db.query(sqlPaketsoal, [ id_paketsoal ], (error, result) => {
                    if (error) reject(error)
                    else resolve(result[0].jumlah_soal)
                })
            })
            const sqlTopikujian = `SELECT id_topik, ROUND((persentase_mudah * persentase_topik * ${ jumlah_soal }), 0) AS 'soal_mudah', ROUND((persentase_sedang * persentase_topik * ${ jumlah_soal }), 0) AS 'soal_sedang', ROUND((persentase_sulit * persentase_topik * ${ jumlah_soal }), 0) AS 'soal_sulit' FROM konfigurasi WHERE id_paketsoal = ?`
            const requiredSoal = await new Promise((resolve, reject) => {
                db.query(sqlTopikujian, [ id_paketsoal ], (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                })
            })
            return requiredSoal
        } catch (error) {
            return res.status(500).json({ message: 'Gagal menghitung jumlah soal yang diperlukan! 2'})
        }
    }

    // Periksa ketersediaan soal
    async function checkSoal(requiredSoal) {
        try {
            const statuses = await Promise.all(requiredSoal.map(async (result) => {
                let idtopik = result.id_topik
                let soalRequired = [result.soal_mudah, result.soal_sedang, result.soal_sulit]
                for (let i = 0; i < 3; i++) {
                    let sqlCekSoal = `SELECT COUNT(id_topik) AS 'jumlah' FROM  bank_soal WHERE id_topik = ${ idtopik } AND tingkat_kesulitan = ${ i+1 }`
                    let soaltersedia = await new Promise((resolve, reject) => {
                        db.query(sqlCekSoal, (error, result) => {
                            if (error) reject(error)
                            else resolve(result[0].jumlah)
                        })
                    })
                    if (soaltersedia < soalRequired[i]) { return 'tidak tesedia 3' }
                }
                return 'tersedia'
            }))
            return statuses.includes('tidak tesedia') ? 'tidak tesedia' : 'tersedia'
        } catch (error) {
            return res.status(500).json({ message: 'Gagal memeriksa ketersediaan soal! 4' })
        }
    }

    // Generate soal random
    async function getRandomSoal(requiredSoal) {
        try {
            const draft = await Promise.all(requiredSoal.map(async (result) => {
                let idtopik = result.id_topik
                let soalRequired = [result.soal_mudah, result.soal_sedang, result.soal_sulit]
                let soals = await Promise.all(soalRequired.map(async (required, j) => {
                    let sqlSoalUjian = `SELECT id_banksoal FROM bank_soal WHERE id_topik = ${ idtopik } AND tingkat_kesulitan = ${ j+1 } ORDER BY RAND() LIMIT ${ required }`
                    let random = await new Promise((resolve, reject) => {
                        db.query(sqlSoalUjian, (error, result) => {
                            if (error) reject(error)
                            else resolve(result)
                        })
                    })
                    return random
                }))
                return [].concat(...soals)
                // return [].concat(...bank_soalss)
            }))
            return [].concat(...draft)
        } catch (error) {
            return res.status(500).json({ message: 'Gagal menghasilkan random  5' })
        }
    }

    // Jalankan fungsi
    async function runFunction(id) {
        try {
            const totalPersenTopik = await checkConfig(id)
            if (totalPersenTopik == 1.00) {
                const requiredSoal = await getNumofSoal(id)
                let status = await checkSoal(requiredSoal)
                if (status == 'tersedia') {
                    let draft = await getRandomSoal(requiredSoal)
                    // return res.status(200).json({ draft })
                    
                    // Menyimpan draft paket soal
                    let json = JSON.stringify(draft)
                    const dataArray = JSON.parse(json)
                    const values = dataArray.map(function(item) {
                        return `(NULL, ${ id }, ` + item.id_banksoal + ")"
                    }).join(", ")

                    // const sqlInsert = "INSERT INTO testpaketsoal (id_preview, id_paketsoal, id_banksoal) VALUES " + values
                    // const sqlSearch = `SELECT * FROM testpaketsoal WHERE id_paketsoal = ?`
                    // const sqlDelete = `DELETE FROM testpaketsoal WHERE id_paketsoal = ?`
                    // const sqlkode = `UPDATE paketsoal SET kode_paketsoal = ROUND(RAND()*(999999-100000)+100000, 0) WHERE id_paketsoal = ?`
                    const sqlInsert = "INSERT INTO preview (id_preview, id_paketsoal, id_banksoal) VALUES " + values
                    const sqlSearch = `SELECT * FROM preview WHERE id_paketsoal = ?`
                    const sqlDelete = `DELETE FROM preview WHERE id_paketsoal = ?`
                    const sqlkode = `UPDATE paketsoal SET kode_paketsoal = ROUND(RAND()*(999999-100000)+100000, 0) WHERE id_paketsoal = ?`
                    db.query(sqlSearch, [ id_paketsoal ], (error, result) => {
                        if (error) {
                            return res.status(500).json({ message: 'Ada kesalahan! 6' })
                        }
                        
                        if (result.length) {
                            db.query(sqlDelete, [ id_paketsoal ], (error, result) => {
                                if (error) {
                                    return res.status(500).json({ message: 'Soal ujian tidak berhasil dihapus! 7' })
                                }
                                db.query(sqlInsert, (error, result) => {
                                    if (error) {
                                        return res.status(500).json({ message: 'Paket soal tidak berhasil dibuat! 8' })
                                    } else {
                                        db.query(sqlkode, [ id_paketsoal ], (error, result) => {
                                            if (error) {
                                                return res.status(500).json({ message: 'Ada kesalahan! 9' })
                                            } else {
                                                return res.status(200).json({ message: 'Paket soal berhasil dibuat!10 ' })
                                            }
                                        })
                                    }
                                })
                            })
                        } else {
                            db.query(sqlInsert, (error, result) => {
                                if (error) {
                                    return res.status(500).json({ message: 'Paket soal tidak berhasil dibuat! 11' })
                                } else {
                                    db.query(sqlkode, [ id_paketsoal ], (error, result) => {
                                        if (error) {
                                            return res.status(500).json({ message: 'Ada kesalahan! 12' })
                                        } else {
                                            return res.status(200).json({ message: 'Paket soal berhasil dibuat! 13' })
                                        }
                                    })
                                }
                            })
                        }
                    })
                } else {
                    return res.status(500).json({ message: 'Soal yang tersedia tidak cukup!' })
                }
            } else {
                return res.status(500).json({ message: "Jumlah persentase topik harus tepat sama dengan 1 !" })
            }
        } catch (error) {
            return res.status(500).json({ message: 'Error' })
        }
    }

    runFunction(id_paketsoal)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
