import { getRepository } from "typeorm";
import DatauriParser from "datauri/parser";
import { v2 as cloudinary } from "cloudinary";

import * as path from "path";

import { Product } from "../entity/Product";
import { ProductCreateDto } from "../dto/product-create.dto";
import { Variety } from "../entity/Variety";
import { ResponseStructure } from "../helper/response.interface";
import { Status } from "../helper/status.enum";
import { Image } from "../entity/Images";
import { VarietyDto } from "../dto/variety.dto";

export class ProductController {
  private varietyRepository = getRepository(Variety);
  private productRepository = getRepository(Product);

  async save(
    product_to_save: ProductCreateDto,
    images: any
  ): Promise<ResponseStructure> {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const new_product = new Product();
    new_product.product_description = product_to_save.product_description;
    new_product.product_name = product_to_save.product_name;
    await new_product.save();

    try {
      for (const [
        index,
        variety,
      ] of product_to_save.product_varieties.entries()) {
        const new_variety = new Variety();
        Object.assign(new_variety, variety);
        new_variety.product = new_product;
        await new_variety.save();
        for (const image of images) {
          if (+image.fieldname[10] === index) {
            const parser = new DatauriParser();
            parser.format(
              path.extname(image.originalname).toString(),
              image.buffer
            );
            const uniqueFilename = new Date().toISOString();
            const uploaded_image = await cloudinary.uploader.upload(
              parser.content,
              {
                public_id: `vasiti/${image.fieldname}/${uniqueFilename}`,
                tags: `vasiti`,
              }
            );
            if (!uploaded_image) {
              throw new Error("An Error Occured, Try Again");
            }
            const new_image = new Image();
            new_image.image_url = uploaded_image.secure_url;
            new_image.variety = new_variety;
            await new_image.save();
          }
        }
      }

      return {
        message: "Saved Successfully",
        status: Status.SUCCESS,
        data: null,
      };
    } catch (e) {
      console.log(e);
      return {
        message: "An Error Occured",
        status: Status.ERROR,
        data: null,
      };
    }
  }

  async remove(id: number): Promise<ResponseStructure> {
    try {
      let varietyToRemove = await this.varietyRepository.findOne(id);
      if (!varietyToRemove) throw new Error("Entity Not Found");
      await this.varietyRepository.remove(varietyToRemove);
      return {
        message: "Deleted Successfully",
        status: Status.SUCCESS,
        data: null,
      };
    } catch (e) {
      const response: ResponseStructure = {
        message: e.message,
        status: Status.ERROR,
        data: null,
      };
      return response;
    }
  }

  async update(
    id: number,
    images: any,
    varieties: VarietyDto[]
  ): Promise<ResponseStructure> {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    try {
      let product_to_update = await this.productRepository.findOne(id);
      if (!product_to_update) throw new Error("Product Entity Not Found");

      for (const [index, variety] of varieties.entries()) {
        const new_variety = new Variety();
        Object.assign(new_variety, variety);
        new_variety.product = product_to_update;
        await new_variety.save();
        for (const image of images) {
          if (+image.fieldname[10] === index) {
            const parser = new DatauriParser();
            parser.format(
              path.extname(image.originalname).toString(),
              image.buffer
            );
            const uniqueFilename = new Date().toISOString();
            const uploaded_image = await cloudinary.uploader.upload(
              parser.content,
              {
                public_id: `vasiti/${image.fieldname}/${uniqueFilename}`,
                tags: `vasiti`,
              }
            );
            if (!uploaded_image) {
              throw new Error("An Error Occured, Try Again");
            }
            const new_image = new Image();
            new_image.image_url = uploaded_image.secure_url;
            new_image.variety = new_variety;
            await new_image.save();
          }
        }
      }
      return {
        message: "Varieties Added Successfully",
        status: Status.SUCCESS,
        data: null,
      };
    } catch (e) {
      const response: ResponseStructure = {
        message: e.message,
        status: Status.ERROR,
        data: null,
      };
      return response;
    }
  }
}
