import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { Variety } from "./Variety";

@Entity()
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image_url: string;

  @ManyToOne((type) => Variety, (variety) => variety.images, {
    nullable: false,
    eager: false,
  })
  variety: Variety;

  @Column({ nullable: true })
  varietyId: number;
}
