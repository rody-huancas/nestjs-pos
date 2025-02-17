import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, isAfter } from 'date-fns';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';

import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon) private readonly couponRepository: Repository<Coupon>
  ) {}

  create(createCouponDto: CreateCouponDto) {
    return this.couponRepository.save(createCouponDto);
  }

  findAll() {
    return this.couponRepository.find();
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOneBy({ id });
    if (!coupon) {
      throw new NotFoundException(`Cupón con el ID: ${id} no fue encontrado.`);
    }
    return coupon;
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findOne(id);

    Object.assign(coupon, updateCouponDto);

    return await this.couponRepository.save(coupon);
  }

  async remove(id: number) {
    const coupon = await this.findOne(id);
    await this.couponRepository.remove(coupon);
    return { message: "Cupón Eliminado" }
  }

  async applyCoupon(name: string) {
    const coupon = await this.couponRepository.findOneBy({ name: name });
    
    if (!coupon) {
      throw new NotFoundException(`Cupón con el nombre: ${name} no fue encontrado.`);
    }

    const currentDate = new Date();
    const expirationDate = endOfDay(coupon.expirationDate);

    if (isAfter(currentDate, expirationDate)) {
      throw new UnprocessableEntityException(`El cupón ha expirado.`);
    }

    return {
      message: "Cupón válido",
      ...coupon
    };
  }
}
