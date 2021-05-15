const express = require('express')
const sqlite3 = require('sqlite3')
const _ = require('lodash')

const HTTP_PORT = 5000
const SCHEMA = `CREATE TABLE IF NOT EXISTS sessions(
id INTEGER PRIMARY KEY,
duration string,
time string,
name string,
host string,
hostlink string,
description string)`

const app = express()

app.use(express.static('public'))
app.use(express.json())

let db = null

new Promise((resolve, reject) => {
  db = new sqlite3.Database('./unrtc.db', (err) => {
    if (err) {
      console.error(err.message)
      process.exit(1)
    }

    db.run(SCHEMA)

    resolve()
  })
}).then(() => {
  app.get('/sessions', (req, res) => {
    db.all(`SELECT * from sessions`, [], (err, rows) => {
      if (err) {
        res.sendStatus(400)
        console.error(`Failed to fetch sessions ${err.message}`)
        return
      }

      res.json(rows)
    })
  })

  app.post('/session', (req, res) => {
    let vals = []
    for (let field of ['duration', 'time', 'name', 'host', 'hostlink', 'description']) {
      if (isEmptyString(req.body[field])) {
        res.sendStatus(400)
        console.error(`Failed create session missing value ${field}`)
        return
      }
      vals.push(req.body[field])
    }

    db.run(`INSERT INTO sessions(duration, time, name, host, hostlink, description) VALUES(?, ?, ?, ?, ?, ?)`, vals, err => {
      if (err) {
        res.sendStatus(400)
        console.error(`Failed insert session ${err.message}`)
        return
      }

      res.sendStatus(200)
    })
  })

  app.put('/session', (req, res) => {
    let vals = []
    for (let field of ['duration', 'time', 'name', 'host', 'hostlink', 'description', 'id']) {
      console.log('field', field)
      // if (isEmptyString(req.body[field])) {
      //   res.sendStatus(400)
      //   console.error(`Failed UPDATE session missing value ${field}`)
      //   return
      // }
      vals.push(req.body[field])
    }

    console.log('vals', vals);

    db.run(`UPDATE sessions
      SET
        duration = ?,
        time = ?,
        name = ?,
        host = ?,
        hostlink = ?,
        description = ?
      WHERE id = ?`, vals, err => {
      if (err) {
        res.sendStatus(400)
        console.error(`Failed UPDATE session ${err.message}`)
        return
      }

      res.sendStatus(200)
    })
  })

  console.log(`Starting on port ${HTTP_PORT}`)
  app.listen(5000)
}).catch(err => {
  console.error(`Failed to start server ${err}`)
})

function isEmptyString (str) {
  return !_.isString(str) || str === ''
}
