import { Injectable } from '@nestjs/common';
import { Evaluation } from 'src/shared/entities/evaluation';

@Injectable()
export class EvaluationService {
    evaluate(evaluation: Evaluation): string {
        // Placeholder logic for evaluation
        return "Evaluation processed";
    }
}
