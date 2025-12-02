import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { EvaluationCreateDto } from './dto/evaluation-create.dto';
import { EvaluationService } from './evaluation.service';
import { Evaluation } from 'src/shared/entities/evaluation';
import { mapResumeEvaluationToEntity, mapVacancyEvaluationToEntity } from './mapper/evaluation_to_entity';

@Controller('evaluation')
export class EvaluationController {

    constructor(private evaluationService: EvaluationService) {}

    @Post('/')
    evaluate(
        @Body(new ValidationPipe({ transform: true })) evaluation: EvaluationCreateDto
    ) {
        this.evaluationService.evaluate(
            new Evaluation(
                mapResumeEvaluationToEntity(evaluation.resume),
                mapVacancyEvaluationToEntity(evaluation.vacancy),
            )
        )
        return "Evaluation endpoint";
    }
}
