const express = require("express");
const bodyParser = require("body-parser");
const cors = requiere("cors");
const app = express();
const port = process.env.port || 3000;

const {Client} = require("pg");

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req,res)=>{
    res.send("Hola mundo");
});

app.listen(port, ()=>{
    console.log(`Ejemplo app listening en http://localhost:${port}'`)
})

const user = "postgres";
const password = "Alpacacosmica123";
const host = localhost;
const database = "control_escolar_v1"
const connectionString = `postgresql:://${user}:${password}@${host}:5432/${database}}`;

const connectionData = {
    connectionString:connectionString,
    ssl:{rejectUnauthorized:false}
};

const client = new Client(connectionData);
client.connect();

