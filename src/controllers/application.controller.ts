import { ApplicationDto } from '@/dtos/application.dto';
import { Body, Controller, Post } from 'routing-controllers';

@Controller('/application')
export class ApplicantController {
  @Post()
  applyToVacant(@Body() application: ApplicationDto) {}
}
