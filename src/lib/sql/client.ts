

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

class PostgresClient {
    private static pool: Pool | null = null;

    private constructor() {
        PostgresClient.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }

    public static getPool(): Pool {
        if (!PostgresClient.pool){
            PostgresClient.pool = new Pool({
                connectionString: process.env.DATABASE_URL
            });
        }
        return PostgresClient.pool;
    }
}

const createDrizzleClient = () => {
    let drizzleClient: ReturnType<typeof drizzle> | null = null;

    const getClient = (isLocal: boolean = false) => {
        if(!drizzleClient){
            const pool = isLocal ? PostgresClient.getPool() : PostgresClient.getPool();
            drizzleClient = drizzle(pool);
        }
        return drizzleClient;
    }

    return {
        getClient
    }
}

export const pgClient = createDrizzleClient();