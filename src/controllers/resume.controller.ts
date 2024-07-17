import { ResumeDto } from '@/dtos/resume.dto';
import { ResumeService } from '@/services/resume.service';
import { Body, Controller, HttpCode, Post } from 'routing-controllers';

@Controller('/v1/resume')
export class ResumeController {
  resumeService = new ResumeService();

  @Post('/')
  @HttpCode(201)
  async createResume(@Body() resume: ResumeDto) {
    await this.resumeService.createResume(resume);
    return { message: 'Hello World' };
  }
}
