import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType } from 'type-graphql';
import argon2 from 'argon2';
import { MyContext } from 'src/types';
import { User } from '../entities/User';

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

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
    @Mutation(() => UserResponse)
    async register(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: 'length must be greater than 2'
                }]
            }
        }

        if (options.password.length <= 5) {
            return {
                errors: [{
                    field: 'password',
                    message: 'length must be greater than 5'
                }]
            }
        }
        
        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {
            username: options.username, 
            password: hashedPassword
        });
        await em.persistAndFlush(user);
        return {
            user
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, {
            username: options.username
        })
        if (!user) {
            return {
                errors: [{
                    field: 'username',
                    message: 'username doesn\'t exist',
                },],
            }
        }
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: 'password is not valid',
                },],               
            }
        }

        return {
            user
        };
    }
};