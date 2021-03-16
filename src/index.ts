import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";
import multer from "multer";
import { Request, Response } from "express";
import { Product } from "./entity/Product";

import { ProductController } from "./controller/ProductController";
import { ResponseStructure } from "./helper/response.interface";
import { Status } from "./helper/status.enum";
import { ProductCreateDto } from "./dto/product-create.dto";
import { validate } from "class-validator";
import { VarietyDto } from "./dto/variety.dto";

dotenv.config();
const upload = multer({
  limits: {
    fileSize: 7000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)) {
      return cb(new Error("Please upload an image or video"));
    }
    cb(undefined, true);
  },
});

const check_if_empty = (...args: any[]): boolean => {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "" || !args[i] || args[i].length <= 0) return true;
  }
  return false;
};
createConnection()
  .then(async (connection) => {
    const app = express();
    app.use(bodyParser.json());

    const port = process.env.PORT || 3000;

    //Error Handler
    app.use(
      (
        error: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        const response: ResponseStructure = {
          message: error.message,
          status: Status.ERROR,
          data: null,
        };
        res.status(error.status || 500).json(response);
      }
    );

    //Create a Product
    app.post(
      "/product",
      upload.any(),
      async (req: express.Request, res: express.Response) => {
        try {
          if (
            check_if_empty(
              req.body.product_description,
              req.body.product_name,
              req.body.varieties,
              req.files
            )
          )
            throw new Error("Fields Cannot Be Empty");

          //  Validating Incoming Payload
          const product_to_save = new ProductCreateDto();
          product_to_save.product_description = req.body.product_description;
          product_to_save.product_name = req.body.product_name;
          let varieties: [] = req.body.varieties;
          varieties.forEach((variety: any, index, theArray: any[]) => {
            const newVariety = new VarietyDto();
            newVariety.color = variety.color;
            newVariety.price = +variety.price;
            newVariety.quantity = +variety.quantity;
            newVariety.size = variety.size;
            theArray[index] = newVariety;
          });
          product_to_save.product_varieties = varieties;

          const errors = await validate(product_to_save);
          if (errors.length > 0) {
            const response: ResponseStructure = {
              message: "",
              data: null,
              status: Status.ERROR,
            };
            if (errors[0].children.length > 0) {
              response.message = `${
                Object.values(errors[0].children[0].children[0].constraints)[0]
              }`;
              return res.status(400).json(response);
            }
            response.message = `${Object.values(errors[0].constraints)[0]}`;
            return res.status(400).json(response);
          }

          const product_controller = new ProductController();
          const response: ResponseStructure = await product_controller.save(
            product_to_save,
            req.files
          );

          res
            .status(response.status === Status.ERROR ? 400 : 201)
            .json(response);
        } catch (e) {
          const response: ResponseStructure = {
            message: e.message,
            data: null,
            status: Status.ERROR,
          };

          res.status(400).json(response);
        }
      }
    );

    app.delete(
      "/variety/:id",
      async (req: express.Request, res: express.Response) => {
        const product_controller = new ProductController();
        const response: ResponseStructure = await product_controller.remove(
          +req.params.id
        );
        res.status(response.status === Status.ERROR ? 400 : 200).json(response);
      }
    );

    //Invalid Endpoint
    app.get("/*", (req: express.Request, res: express.Response) => {
      const response: ResponseStructure = {
        message: `Endpoint not found.`,
        status: Status.ERROR,
        data: null,
      };
      res.status(404);
      res.json(response);
    });

    app.listen(port, () => {
      console.log("server up and running");
    });
  })
  .catch((error) => console.log(error));
