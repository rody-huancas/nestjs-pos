import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports    : [TypeOrmModule.forFeature([Product, Category])],
  providers  : [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
