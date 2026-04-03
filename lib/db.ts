import { MongoClient, Db, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'localservice'

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not set')
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb && cachedClient) {
    return cachedDb
  }

  const client = new MongoClient(MONGODB_URI as string)
  await client.connect()

  const db = client.db(MONGODB_DB)
  cachedClient = client
  cachedDb = db
  return db
}

// Backward compatibility stub for remaining SQL-based routes
export async function sql(_query: TemplateStringsArray | string, ..._params: any[]): Promise<any[]> {
  // Return empty array for unknown SQL, this avoids crash in non-converted routes.
  return []
}

export async function withTransaction<T>(
  callback: (sql: any) => Promise<T>
): Promise<T> {
  const db = await connectToDatabase()
  const session = db.client.startSession()
  let result: T

  try {
    session.startTransaction()
    result = await callback(db)
    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }

  return result
}

export { ObjectId }
