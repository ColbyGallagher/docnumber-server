const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "postgres",
    password: "password",
    database: "docnumbering",
  },
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send(database.users);
});

app.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json("incorrect form submission");
  }
  db.select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(400).json("unable to get user"));
      } else {
        res.status(400).json("wrong credentials1");
      }
    })
    .catch((err) => res.status(400).json("wrong credentials2"));
});

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json("incorrect form submission");
  }
  const hash = bcrypt.hashSync(password);
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("unable to register111"));
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("Not found");
      }
    })
    .catch((err) => res.status(400).json("error getting user"));
});

app.post("/docnumbers", (req, res) => {
  const {
    projectnumber,
    originator,
    volume,
    level,
    doctype,
    discipline,
    docnumber,
    docnumberstring,
    createdby,
    timecreated,
    id,
    description,
  } = req.body;
  if (
    !projectnumber ||
    !originator ||
    !volume ||
    !level ||
    !doctype ||
    !discipline ||
    !docnumber ||
    !createdby
  ) {
    return res.status(400).json("incorrect form submission");
  }
  db.transaction((trx) => {
    trx
      .insert({
        projectnumber: projectnumber,
        originator: originator,
        volume: volume,
        level: level,
        doctype: doctype,
        discipline: discipline,
        docnumber: docnumber,
        docnumberstring: docnumberstring,
        createdby: createdby,
        timecreated: new Date(),
        description: description,
      })
      .into("docnumbers")
      .returning("projectnumber")
      // .then(loginEmail => {
      //   return trx('users')
      //     .returning('*')
      //     .increment('entries', 1)
      //     .returning('entries')
      //     .then(entries => {
      //       res.json(entries[0]);
      //   })
      //   .catch(err => res.status(400).json('unable to get entries'))
      .then((user) => {
        res.json(user[0]);
      })
      // })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("unable to save to database"));
});

app.get("/docnumbers", (req, res) => {
  //const { originator } = req.params;
  db.select("*")
    .from("docnumbers") //.where({originator})
    .then((list) => {
      if (list.length) {
        console.log(list);
        res.json(list);
      } else {
        res.status(400).json("Not found");
      }
    })
    .catch((err) => res.status(400).json("error getting list of doc numbers"));
});

// app.put('/image', (req, res) => {
//   const { id } = req.body;
//   db('users').where('id', '=', id)
//   .increment('entries', 1)
//   .returning('entries')
//   .then(entries => {
//     res.json(entries[0]);
//   })
//   .catch(err => res.status(400).json('unable to get entries'))
// })

app.listen(3000, () => {
  console.log("app is running on port 3000");
});
