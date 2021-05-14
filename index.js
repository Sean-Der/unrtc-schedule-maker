const express = require('express')
const sqlite3 = require('sqlite3')
const _ = require('lodash')

const HTTP_PORT = 5000
const SCHEMA = `CREATE TABLE IF NOT EXISTS sessions(
id INTEGER PRIMARY KEY,
deleted bool,
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
    db.all('SELECT * from sessions WHERE deleted = false', [], (err, rows) => {
      if (err) {
        res.status(400)
        res.end(`Failed to fetch sessions ${err.message}`)
        return
      }

      res.json(rows)
    })
  })

  app.post('/session', (req, res) => {
    const vals = []
    for (const field of ['duration', 'time', 'name', 'host', 'hostlink', 'description']) {
      if (isEmptyString(req.body[field])) {
        res.status(400)
        res.end(`Failed create session missing value ${field}`)
        return
      }
      vals.push(req.body[field])
    }

    db.run('INSERT INTO sessions(deleted, duration, time, name, host, hostlink, description) VALUES(false, ?, ?, ?, ?, ?, ?)', vals, err => {
      if (err) {
        res.status(400)
        res.end(`Failed insert session ${err.message}`)
        return
      }

      res.sendStatus(200)
    })
  })

  app.put('/session', (req, res) => {
    const vals = []
    for (const field of ['duration', 'time', 'name', 'host', 'hostlink', 'description', 'deleted', 'id']) {
      if (field === 'id') {
        if (!_.isNumber(req.body[field])) {
          res.status(400)
          res.end(`Failed UPDATE session missing value ${field}`)
          return
        }
      } else if (field === 'deleted') {
        if (req.body[field] === 'false') {
          req.body[field] = false
        } else if (req.body[field] === 'true') {
          req.body[field] = true
        } else {
          res.status(400)
          res.end(`Invalid value for deleted ${req.body[field]}`)
          return
        }
      } else if (isEmptyString(req.body[field])) {
        res.status(400)
        res.end(`Failed UPDATE session missing value ${field}`)
        return
      }

      vals.push(req.body[field])
    }

    db.run(`UPDATE sessions
      SET
        duration = ?,
        time = ?,
        name = ?,
        host = ?,
        hostlink = ?,
        description = ?,
        deleted = ?
      WHERE id = ?`, vals, err => {
      if (err) {
        res.status(400)
        res.end(`Failed UPDATE session missing value ${err.message}`)
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
