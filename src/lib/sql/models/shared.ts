import { pgEnum } from "drizzle-orm/pg-core";

export enum GenericStatus {
    PENDING = 'PENDING',
    SUCCEEDED = 'SUCCEEDED',
    FAILED = 'FAILED'
}

export const genericStatusEnum = pgEnum('generic_status', GenericStatus)