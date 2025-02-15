import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';

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

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
