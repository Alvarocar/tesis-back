import { Body, Controller, Get, HttpCode, Param, Post, Put, QueryParam, Req, UseBefore } from 'routing-controllers';
import authRecruiterMiddleware from '@/middlewares/authRecluter.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { ApplicationService } from '@/services/application.service';
import { RequestWithRecruiter } from '@/interfaces/auth.interface';
import { VacantDto, VacantFactory } from '@/dtos/vacant.dto';
import { VacantService } from '@/services/vacant.service';

@Controller('/v1/vacant')
export class VacantController {
  private vacantService: VacantService;
  private applicationService: ApplicationService;

  constructor() {
    this.vacantService = new VacantService();
    this.applicationService = new ApplicationService();
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

  @Get('/')
  @UseBefore(authRecruiterMiddleware)
  @HttpCode(200)
  async getVacantsByRecruiter(
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 10,
    @QueryParam('q') query: string,
    @Req() req: RequestWithRecruiter,
  ) {
    return this.vacantService.getVacantsByRecruiter(req.user, page, pageSize, query);
  }

  @Get('/procceses/:vacantId')
  @UseBefore(authRecruiterMiddleware)
  async getApplicationsByVacant(
    @Param('vacantId') vacantId: number,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 10,
    @QueryParam('q') query: string = '',
    @Req() req: RequestWithRecruiter,
  ) {
    return this.applicationService.getApplicationsByVacant(vacantId, page, pageSize, query);
  }
}
