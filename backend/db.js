import sql from 'mssql'

let poolPromise = null

export function getSqlPool() {
    const connectionString = process.env.DATABASE_CONNECTION_STRING

    if (!connectionString) {
        const err = new Error('DATABASE_CONNECTION_STRING is not set')
        err.code = 'NO_DB_CONFIG'
        throw err
    }

    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(connectionString)
            .connect()
            .then(pool => {
                console.log('Azure SQL Database connected')
                return pool
            })
            .catch(error => {
                poolPromise = null
                console.error('Azure SQL connection failed:', error)
                throw error
            })
    }

    return poolPromise
}