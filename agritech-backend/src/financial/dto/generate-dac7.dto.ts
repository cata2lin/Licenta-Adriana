/**
 * DAC7 Report DTO
 */
import { IsInt, Min, Max } from 'class-validator';

export class GenerateDAC7Dto {
    @IsInt()
    @Min(2020)
    @Max(2030)
    year: number;
}
