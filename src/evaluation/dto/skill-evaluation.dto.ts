import { IsString } from "class-validator";

export class SkillEvaluationDTO {
    @IsString()
    name: string
}
