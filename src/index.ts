import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import path from 'path';
import { createConnection } from 'typeorm'
import { Post } from "./entities/Post";
import { User } from "./entities/User";


const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        database: 'lirreddit',
        username: 'postgres',
        password: 'postgres',
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [Post, User]
    });

    conn.runMigrations();

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis();

    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true,
    }))
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 *10, // 10 years
                httpOnly: true,
                sameSite: 'lax', // csrf
                secure: __prod__ // cookie only works in https
            },
            saveUninitialized: false,
            secret: 'mynameisslimshady',
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis
        }),
    });

    apolloServer.applyMiddleware({ app, cors: false })

    app.get('/', (_, res) => {
        res.send("Hello!")
    })
    app.listen(4000, () => {
        console.log("Server started on localhost:4000")
    });
}

main().catch(err => {
    console.log(err);
});