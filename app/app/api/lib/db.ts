// msnodesqlv8 uses ? positional parameters, not named @p1 parameters.
// This helper wraps queries to use the correct syntax.
import sql from 'msnodesqlv8';

const connectionString = "Driver={ODBC Driver 18 for SQL Server};Server=.;Database=white_day;Trusted_Connection=yes;Encrypt=yes;TrustServerCertificate=yes;";

export function query<T = any>(q: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    sql.query(connectionString, q, params, (err: any, rows: any) => {
      if (err) {
        return reject(err);
      }
      resolve(rows as T[]);
    });
  });
}
