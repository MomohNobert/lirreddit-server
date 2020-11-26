import { Entity } from "@mikro-orm/core/decorators/Entity";
import { PrimaryKey } from "@mikro-orm/core/decorators/PrimaryKey";
import { Property } from "@mikro-orm/core/decorators/Property";
import { Field, Int } from "type-graphql";
import { ObjectType } from "type-graphql/dist/decorators/ObjectType";

@ObjectType()
@Entity()
export class User {
    @Field(() => Int)
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({ type: 'date'})
    createdAt = new Date();

    @Field(() => String)
    @Property({type: 'date', onUpdate: () => new Date() })
    updatedAt = new Date();

    @Field()
    @Property({ type: 'text', unique: true })
    username!: string;

    @Field()
    @Property({ type: 'text', unique: true })
    email!: string;

    @Property({ type: 'text' })
    password!: string;
}