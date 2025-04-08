const { Pool } = require('pg')
const { parse } = require('pg-connection-string')

// Base de datos cargada en NeonDB
// const connectionString = 'postgresql://neondb_owner:npg_DnHZC8O4ygik@ep-shrill-base-a52a7822-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
// Base de datos local
// eslint-disable-next-line camelcase
const local_connectionString = 'postgres://postgres:Alpacacosmica123@localhost:5432/control_escolar_v1'
const config = parse(local_connectionString)

const pool = new Pool({
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  password: config.password
  /*,
  ssl: {
    rejectUnauthorized: false // Permite conexiones SSL sin validar el certificado
  } */
})

module.exports = { pool }
