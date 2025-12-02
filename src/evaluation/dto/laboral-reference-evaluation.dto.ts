import { IsNotEmpty, IsString } from "class-validator";

export class LaboralReferenceEvaluationDto {
    
    @IsString()
    @IsNotEmpty()
    company: string;

    @IsString()
    @IsNotEmpty()
    contactName: string;

    @IsString()
    @IsNotEmpty()
    rol: string;

    @IsString()
    @IsNotEmpty()
    phone: string;
}