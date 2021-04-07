const cool = require('cool-ascii-faces');
const express = require('express');
const format = require('sqlutils/pg/format');
const path = require('path');
const randomId = require('random-id');
const PORT = process.env.PORT || 5000;
bodyParser = require("body-parser");

var Filter = require('bad-words'),
    filter = new Filter();

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
// const pool = new Pool({
//   connectionString: 'postgres://hkklmoystzlzjm:f7631e043cea53489c47c64939e88b1bb5d53e8a2bdf2fe7c12f38d7a8b7a66d@ec2-54-235-158-17.compute-1.amazonaws.com:5432/d2dtvkv0fo8duf',
//   ssl: {
//     rejectUnauthorized: false
//   }
// });
const classcolours = ['red','accelerated','orange','yellow','green','blue']
const coloursubjects = ['english','math','gifted','science']
const textfields = ['fullname','elective1','elective2','elective3']
express()
  .use(express.urlencoded({extended: true}))
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/', async (req, res) => {

    user = req.body
    user.id = randomId(5)


    for (i=0;i<coloursubjects.length;i++){
      if (!colourcheck(user[coloursubjects[i]])){
        user[coloursubjects[i]] = ':)' 
      }
    }
    for (i=0;i<textfields.length;i++){
      try {
        user[textfields[i]] = filter.clean(user[textfields[i]])
      } catch (error) {
        user[textfields[i]] = 'empty'
      }
      
    }
    // console.log('~~~~~~')
    // console.log('User')
    // console.log(user)
    // console.log('SQL statement')
    // console.log(usertoSQL(user))
    // console.log('~~~~~~')
    
    try {
      const client = await pool.connect();
      pool.query(
        usertoSQL(user),
        (err, res) => {
          console.log(err, res);
        }
      );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
    res.cookie('id', user.id)
    res.cookie('fullname',user.fullname)
    res.cookie('english',user.english)
    res.cookie('elective1',user.elective1)
    res.cookie('math',user.math)
    res.cookie('gifted',user.gifted)
    res.cookie('science',user.science)
    res.cookie('elective2',user.elective2)
    res.cookie('elective3',user.elective3)
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM usertable');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }


  })
  .get('/cool', (req, res) => res.send(cool()))
  .get('/times', (req, res) => res.send(showTimes()))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM usertable');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


showTimes = () => {
  let result = '';
  const times = process.env.TIMES || 5;
  for (i = 0; i < times; i++) {
    result += i + ' ';
  }
  return result;
}


function colourcheck(e){
  return classcolours.includes(e) 
}

function usertoSQL(user){
  return format('INSERT INTO usertable ?', user); //returns: INSERT INTO customers (name, balance) VALUES (E'John Doe', 0)
}