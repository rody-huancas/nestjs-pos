import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @IsString({ message: 'Nombre no válido' })
  name: string;

  @IsNotEmpty({ message: 'El precio del producto es obligatoria' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Precio no válido' })
  price: number;

  @IsNotEmpty({ message: 'La cantidad del producto no puede ir vacío' })
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Cantidad no válido' })
  inventory: number;

  @IsNotEmpty({ message: 'La categoría del producto es obligatoria' })
  @IsInt({ message: 'Categoría no válida' })
  categoryId: number;
}
