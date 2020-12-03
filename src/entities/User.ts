import { Field, Int } from "type-graphql";
import { ObjectType } from "type-graphql/dist/decorators/ObjectType";
import { BaseEntity, Column, CreateDateColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({unique: true })
    username!: string;

    @Field()
    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @OneToMany(() => Post, post => post.creator)
    posts: Post[]

    
    @Field(() => String)
    @CreateDateColumn()
    createdAt = Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = Date;
}