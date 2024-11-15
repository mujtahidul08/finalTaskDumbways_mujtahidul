const express = require('express');
const app = express();
const port = 3000;
const hbs = require('hbs');
app.set('view engine', 'hbs');



//Session
const session = require("express-session");
app.use(session({
    name: "my-session",
    secret: "mujtahidul",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
  }));

//flash alert
const flash = require("express-flash");
//bcrypt
const bcrypt = require("bcrypt");

// sequelize init
const config = require("./config/config.json")
const { Sequelize, QueryTypes } = require("sequelize")
const sequelize = new Sequelize('task_collection_web', 'postgres', 'mahyunda081001', {
    host: 'localhost',
    dialect: 'postgres',
    dialectOptions: {
        ssl: false // menonaktifkan SSL
    }
});
module.exports = sequelize;
// Middleware untuk parsing body dari request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// HELPER
hbs.registerHelper('eq', (a, b) => a === b);

// Static files
app.use("/css", express.static("css"));
app.use("/javascript", express.static("javascript"));

// Middleware  authentication
hbs.registerHelper('isAuthenticated', (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/login');
});


// GET Routes
app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.get('/', async (req, res) => {
    let user = req.session.user;
    if (!user || !user.id) {
        return res.render('index');
    } else {
        const userId = user.id;

        const collections = await sequelize.query(
            `SELECT collections.id, collections.name, users.username,
                    COUNT(tasks.id) AS "totalTasks",
                    SUM(CASE WHEN tasks.is_done = 'true' THEN 1 ELSE 0 END) AS "completedTasks"
             FROM collections
             JOIN users ON collections.user_id = users.id
             LEFT JOIN tasks ON collections.id = tasks.collections_id
             WHERE collections.user_id = ?
             GROUP BY collections.id, collections.name, users.username`,
            { replacements: [userId], type: QueryTypes.SELECT }
        );

        console.log(collections); 
        return res.render('index', { collections, user });
    }
});

app.get('/collectionDetail/:id', async (req, res) => {
    const id = req.params.id; 
    const user = req.session.user;
    const { is_done } = req.body;
    // Query untuk mendapatkan detail koleksi dan username pengguna
    const collectionDetail = await sequelize.query(`
        SELECT collections.*, users.username 
        FROM collections 
        JOIN users ON collections.user_id = users.id 
        WHERE collections.id = ?`, 
        { replacements: [id], type: QueryTypes.SELECT }
    );

    // Query untuk mendapatkan tugas yang berhubungan dengan koleksi
    const tasks = await sequelize.query(`
        SELECT * FROM tasks WHERE collections_id = ?`, 
        { replacements: [id], type: QueryTypes.SELECT }
    );

    console.log(tasks)
    res.render('collectionDetail', { collectionDetail: collectionDetail[0],tasks, user});
    
});

app.get('/collectionAdd', async(req, res) => {
    const query = 'SELECT  * FROM collections';
    let collections = await sequelize.query(query, { type: QueryTypes.SELECT });
    const user = req.session.user;
    console.log(collections)
    res.render('collectionAdd', { collections,user});
});

app.get('/collectionDetail/:id/taskAdd', async(req, res) => {
    const id = req.params.id;
    const user = req.session.user;
    
    // Ambil detail koleksi berdasarkan ID
    const query = `
        SELECT collections.*, users.username 
        FROM collections 
        JOIN users ON collections.user_id = users.id 
        WHERE collections.id = '${id}'`
    const collectionDetail = await sequelize.query(query,{type: QueryTypes.SELECT }
    );
    res.render('taskAdd', { collectionDetail: collectionDetail[0], user });
});






// POST routes
app.post('/register', async (req, res) => { 
    const { name, email, password } = req.body;
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
  
    const query = `INSERT INTO users(username, email, password) VALUES('${name}', '${email}', '${hashedPassword}')`;
    const user = await sequelize.query(query, { type: QueryTypes.INSERT });
    res.redirect('/login');
  });
  
  app.post('/login', async (req, res) => { 
    const { email, password } = req.body;
  
    const query = `SELECT * FROM users WHERE email='${email}'`;
    const user = await sequelize.query(query, { type: QueryTypes.SELECT });
  
    if (!user.length) {
      req.flash("error", "Email / password salah!");
      return res.redirect("/login");
    }
  
    const isVerifiedPassword = await bcrypt.compare(password, user[0].password);
  
    if (!isVerifiedPassword) {
      req.flash("error", "Email / password salah!");
      return res.redirect("/login");
    }
  
    req.session.user = user[0];
    res.redirect("/");
  });

app.post('/logout', (req, res) => {
req.session.destroy((err) => {
    if (err) {
    console.error("Logout gagal!");
    return res.redirect("/"); 
    }
    console.log("Logout berhasil!");
    res.redirect("/"); 
});
});

app.post('/collectionAdd',async(req, res) => {
    const {name} = req.body;
    let user = req.session.user;
    const userId = user.id
    const query = `INSERT INTO collections(name,user_id) VALUES('${name}','${userId}')`; 
    await sequelize.query(query, { type: QueryTypes.INSERT });
    res.redirect("/");
});

app.post('/collectionDelete/:id', async (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM collections WHERE id=${id}`;
    await sequelize.query(query, { type: QueryTypes.DELETE });
  
    res.redirect("/");
})

app.post('/collectionDetail/:id/taskAdd', async(req, res) => {
    const {id} = req.params;
    const userId = req.session.user.id
    const {name} = req.body;
    const query = `INSERT INTO tasks (name, is_done, collections_id) VALUES ('${name}', false, '${id}' )`;
    await sequelize.query(query, { type: QueryTypes.INSERT });
    res.redirect(`/collectionDetail/${id}`);
});

app.post('/collectionDetail/:id', async (req, res) => {
    const collectionId = req.params.id;
    const { is_done } = req.body; // Data dari form (hanya berisi tugas yang dicentang)

    // Ambil semua tugas berdasarkan `collection_id`
    const tasks = await sequelize.query(
        `SELECT * FROM tasks WHERE collections_id = ?`, 
        { replacements: [collectionId], type: QueryTypes.SELECT }
    );

    // Update setiap tugas dengan logika nilai default untuk yang tidak terkirim
    for (let task of tasks) {
        // Tetapkan `true` jika checkbox dicentang (dikirim), atau `false` jika tidak
        const doneStatus = (is_done && is_done[task.id] === 'true') ? 'true' : 'false';

        // Update nilai `is_done` di database sebagai string
        await sequelize.query(
            `UPDATE tasks SET is_done = ? WHERE id = ? AND collections_id = ?`,
            { replacements: [doneStatus, task.id, collectionId], type: QueryTypes.UPDATE }
        );
    }

    res.redirect(`/collectionDetail/${collectionId}`);
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server sedang berjalan di port ${port}`);
});