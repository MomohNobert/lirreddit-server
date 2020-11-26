import { Resolver, Mutation, Field, Arg, Ctx, ObjectType, Query } from 'type-graphql';
import argon2 from 'argon2';
import { MyContext } from 'src/types';
import { User } from '../entities/User';
import { COOKIE_NAME } from '../constants';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}


@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {em} : MyContext
    ) {
        const user = await em.findOne(User, {email});
        return true;
    }

    @Query(() => User, { nullable: true})
    async me(@Ctx() { req, em }: MyContext) {
        if (!req.session.userId) {
            return null
        }

        const user = await em.findOne(User, {id: req.session.userId });
        return user;
    }


    @Mutation(() => UserResponse)
    async register(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse> {

        const errors = validateRegister(options);
        if (errors) {
            return {errors}
        }
        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {
            username: options.username, 
            password: hashedPassword,
            email: options.email
        });
        try {
            await em.persistAndFlush(user);
        } catch(err) {
            if(err.code === '23505' || err.detail.includes("already exists")) {
                return {
                    errors: [{
                        field: "username",
                        message: "username already taken"
                    }]
                }
            }
        }

        req.session!.userId = user.id;
        
        return {
            user
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, 
            usernameOrEmail.includes('@') ? 
            { email: usernameOrEmail}
            :
            { username: usernameOrEmail}
        )
        if (!user) {
            return {
                errors: [{
                    field: 'username',
                    message: 'username doesn\'t exist',
                },],
            }
        }
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: 'password is not valid',
                },],               
            }
        }

        req.session!.userId = user.id;

        return {
            user
        };
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res }: MyContext
    ) {
        return new Promise((resolve) =>  req.session.destroy((err: any) => {
            if (err) {
                console.log(err)
                resolve(false)
                return
            }

            res.clearCookie(COOKIE_NAME)
            resolve(true)
        }))
    }
};