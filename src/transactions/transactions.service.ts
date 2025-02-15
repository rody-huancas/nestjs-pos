import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents) private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    await this.productRepository.manager.transaction(async (transactionEntityManager) => {
      const transaction = new Transaction();
      transaction.total = createTransactionDto.contents.reduce((total,item) => total + item.price * item.quantity, 0);
  
      for (const contents of createTransactionDto.contents) {
        const product = await transactionEntityManager.findOneBy(Product, { id: contents.productId });
        
        const errors: string[] = [];

        if (!product) {
          errors.push(`El producto con ID ${contents.productId} no existe`);
          throw new NotFoundException(errors)
        }

        if (contents.quantity > product.inventory) {
          errors.push(`No hay suficiente inventario para el producto ${product.name}`);
          throw new BadRequestException(errors)
        }

        product.inventory -= contents.quantity;

        // Crear instancia de TransactionContents
        const transactionContent = new TransactionContents();

        transactionContent.price = contents.price;
        transactionContent.product = product;
        transactionContent.quantity = contents.quantity;
        transactionContent.transaction = transaction;

        await transactionEntityManager.save(transaction);
        await transactionEntityManager.save(transactionContent);
      }
    })
 
    return 'Venta almacenada correctamente';
  }

  findAll(transactionDate?: string) {
    const options: FindManyOptions<Transaction> = {
      relations: {
        contents: true
      }
    }

    if (transactionDate) {
      const date = parseISO(transactionDate);
      if (!isValid(date)) {
        throw new BadRequestException('Fecha no válida');
      }
       
      const start = startOfDay(date);
      const end = endOfDay(date);

      options.where = {
        transactionDate: Between(start, end)
      }
    }

    return this.transactionRepository.find(options);
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id
      },
      relations: {
        contents: true
      }
    });

    if (!transaction) {
      throw new NotFoundException(`La transacción con ID ${id} no existe`);
    }

    return transaction;
  }

  async remove(id: number) {
    const transaction = await this.findOne(id);

    for(const contents of transaction.contents) {
      const product = await this.productRepository.findOneBy({ id: contents.product.id });
      if (!product) {
        throw new NotFoundException(`El producto con ID ${contents.product.id} no existe`);
      }

      product.inventory += contents.quantity;
      await this.productRepository.save(product);

      const transactionContents = await this.transactionContentsRepository.findOneBy({ id: contents.id });
      if (!transactionContents) {
        throw new NotFoundException(`El contenido de la transacción con ID ${contents.id} no existe`);
      }
      await this.transactionContentsRepository.remove(transactionContents);
    }

    await this.transactionRepository.remove(transaction);

    return { message: "Venta eliminada" }
  }
}
