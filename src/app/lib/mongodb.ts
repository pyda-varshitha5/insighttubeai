import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| MongoDB URI
|--------------------------------------------------------------------------
|
| Supports either:
|
| MONGODB_URI
| MONGO_URI
|
| The final fallback of "" makes the variable a definite
| string from TypeScript's point of view.
|--------------------------------------------------------------------------
*/

const mongoUri: string =
  process.env.MONGODB_URI ??
  process.env.MONGO_URI ??
  "";

/*
|--------------------------------------------------------------------------
| Validate MongoDB URI
|--------------------------------------------------------------------------
*/

if (mongoUri.trim().length === 0) {
  throw new Error(
    "MongoDB connection string is missing. Please add MONGODB_URI or MONGO_URI to .env.local."
  );
}

/*
|--------------------------------------------------------------------------
| Mongoose cache
|--------------------------------------------------------------------------
|
| Next.js development mode can reload files multiple times.
| We store the connection globally so that we don't create
| multiple MongoDB connections.
|--------------------------------------------------------------------------
*/

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

/*
|--------------------------------------------------------------------------
| Get existing cache or create a new cache
|--------------------------------------------------------------------------
*/

const cached: MongooseCache =
  global.mongooseCache ?? {
    conn: null,
    promise: null,
  };

/*
|--------------------------------------------------------------------------
| Store cache globally
|--------------------------------------------------------------------------
*/

global.mongooseCache = cached;

/*
|--------------------------------------------------------------------------
| Connect to MongoDB
|--------------------------------------------------------------------------
*/

export async function connectDB(): Promise<typeof mongoose> {
  /*
   * If MongoDB is already connected,
   * reuse the existing connection.
   */
  if (cached.conn) {
    return cached.conn;
  }

  /*
   * If a connection is currently being established,
   * reuse that promise.
   */
  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri);
  }

  try {
    /*
     * Wait for MongoDB connection.
     */
    cached.conn = await cached.promise;

    return cached.conn;
  } catch (error) {
    /*
     * Reset the promise if connection fails.
     */
    cached.promise = null;

    console.error(
      "MongoDB connection error:",
      error
    );

    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Default export
|--------------------------------------------------------------------------
|
| Supports:
|
| import connectDB from "@/app/lib/mongodb";
|
|--------------------------------------------------------------------------
*/

export default connectDB;