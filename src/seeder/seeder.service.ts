import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "../products/entities/product.entity";
import { Category } from "../categories/entities/category.entity";

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
  ) { }

  async seed() {
    console.log("Desde seed")
  }
}