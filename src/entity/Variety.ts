import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  BaseEntity,
} from "typeorm";
import { Product } from "./Product";
import { Image } from "./Images";

@Entity()
export class Variety extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  size: string;

  @Column()
  quantity: number;

  @Column()
  color: string;

  @OneToMany((type) => Image, (image) => image.variety, {
    eager: true,
    nullable: false,
  })
  images: Image[];

  @Column()
  price: number;

  @ManyToOne((type) => Product, (product) => product.product_varieties, {
    nullable: false,
    eager: false,
    onDelete: "CASCADE",
  })
  product: Product;

  @Column({ nullable: true })
  productId: number;
}
