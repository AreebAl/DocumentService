import { IsString, IsNotEmpty } from 'class-validator';

export class DocumentResponseDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  url: string;
}
