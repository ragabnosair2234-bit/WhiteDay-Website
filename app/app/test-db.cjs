const sql = require('mssql/msnodesqlv8');
const connectionString = "Driver={ODBC Driver 18 for SQL Server};Server=.;Database=white_day;Trusted_Connection=yes;Encrypt=yes;TrustServerCertificate=yes;";

async function test() {
  try {
    let pool = await sql.connect(connectionString);
    let result = await pool.request().query('SELECT @@VERSION as version');
    console.log("Connected successfully via mssql!");
    console.dir(result.recordset);
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err);
    process.exit(1);
  }
}

test();
