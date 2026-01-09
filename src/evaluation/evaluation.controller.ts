import { Controller } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';

@Controller('evaluation')
export class EvaluationController {
  constructor(private evaluationService: EvaluationService) {}
  /* 
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
    } */
}
