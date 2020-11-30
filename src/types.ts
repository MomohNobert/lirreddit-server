import { Connection } from "@mikro-orm/core/connections/Connection";
import { IDatabaseDriver } from "@mikro-orm/core/drivers/IDatabaseDriver";
import { EntityManager } from "@mikro-orm/core/EntityManager";
import { Request, Response } from "express";
import { Redis } from "ioredis";
import { Session, SessionData } from 'express-session'

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
    req: Request & { session: Session & Partial<SessionData> & { userId?: number } }
    res: Response;
    redis: Redis;
}
