const pg = require('pg');

const pool = new pg.Pool({
    user: "postgres",
    host: "127.0.0.1",
    //host: "postgresql.fashion.svc",
    database: "postgres",
    password: "postgres",
    port: 5432,
});

exports.pool = pool;