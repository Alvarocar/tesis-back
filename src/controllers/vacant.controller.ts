import { Body, Controller, Get, HttpCode, Param, Post, Put, Req, UseBefore } from 'routing-controllers';
import authRecruiterMiddleware from '@/middlewares/authRecluter.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { RequestWithRecruiter } from '@/interfaces/auth.interface';
import { VacantDto, VacantFactory } from '@/dtos/vacant.dto';
import { VacantService } from '@/services/vacant.service';

@Controller('/v1/vacant')
export class VacantController {
  private vacantService: VacantService;

  constructor() {
    this.vacantService = new VacantService();
  }

  @Post('/')
  @UseBefore(authRecruiterMiddleware)
  @UseBefore(validationMiddleware(VacantDto, 'body'))
  @HttpCode(201)
  createVacant(@Body() vacant: VacantDto, @Req() req: RequestWithRecruiter) {
    return this.vacantService.createVacant(vacant, req.user);
  }

  @Get('/:id')
  @UseBefore(authRecruiterMiddleware)
  @HttpCode(200)
  async getDetail(@Param('id') id: number) {
    return VacantFactory.toDto(await this.vacantService.getDetail(id));
  }

  @Put('/:id')
  @UseBefore(authRecruiterMiddleware)
  @UseBefore(validationMiddleware(VacantDto, 'body'))
  @HttpCode(204)
  async updateVacant(@Param('id') id: number, @Body() vacant: VacantDto) {
    await this.vacantService.updateVacant(id, vacant);
    return { message: 'actualizado' };
  }
}
