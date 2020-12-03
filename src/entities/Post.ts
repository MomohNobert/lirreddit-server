import { Field, Int } from "type-graphql";
import { ObjectType } from "type-graphql/dist/decorators/ObjectType";
import { BaseEntity, Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    creatorId: number;

    @ManyToOne(() => User, user => user.posts)
    creator: User;
    
    
    @Field(() => String)
    @CreateDateColumn()
    createdAt = Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = Date;
}