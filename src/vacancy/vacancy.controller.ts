import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ParseIntPipe } from 'src/shared/pipes/parse-int-id.pipe';
import { Roles } from 'src/shared/constants/metadata.constant';
import { Role } from 'src/shared/enums/role.enum';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { CreateVacancyUseCase } from './use-cases/create-vacancy.use-case';
import { FindVacancyUseCase } from './use-cases/find-vacancy.use-case';
import { UpdateVacancyUseCase } from './use-cases/update-vacancy.use-case';
import { ArchiveVacancyUseCase } from './use-cases/archive-vacancy.use-case';
import { SearchVacanciesUseCase } from './use-cases/search-vacancies.use-case';
import { FindCompletedAndArchivedUseCase } from './use-cases/find-completed-and-archived.use-case';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { VacancyFilterDto } from './dto/vacancy-filter.dto';

/**
 * Controller delgado: SOLO delegación HTTP a use-cases.
 * Sin `@HttpCode` por método en algunas rutas porque el default es 200/201; lo
 * mantengo explícito en donde se requiere status distinto del default para
 * no romper al cliente.
 */
@Controller('v1/vacancy')
export class VacancyController {
  constructor(
    private readonly createUc: CreateVacancyUseCase,
    private readonly findUc: FindVacancyUseCase,
    private readonly updateUc: UpdateVacancyUseCase,
    private readonly archiveUc: ArchiveVacancyUseCase,
    private readonly searchUc: SearchVacanciesUseCase,
    private readonly completedUc: FindCompletedAndArchivedUseCase,
  ) {}

  @Post()
  @Roles(Role.Admin, Role.Employee)
  @HttpCode(201)
  create(@Body() body: CreateVacancyDto, @CurrentUser() user: TokenDto) {
    return this.createUc.execute(body, user);
  }

  @Get('/:id')
  @Roles(Role.Admin, Role.Employee)
  @HttpCode(200)
  getOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: TokenDto) {
    return this.findUc.execute(id, user);
  }

  @Put('/:id')
  @Roles(Role.Admin, Role.Employee)
  @HttpCode(200)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateVacancyDto,
    @CurrentUser() user: TokenDto,
  ) {
    return this.updateUc.execute(id, body, user);
  }

  @Patch('/:id/archive')
  @Roles(Role.Admin, Role.Employee)
  @HttpCode(204)
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: TokenDto,
  ) {
    await this.archiveUc.execute(id, user);
  }

  @Get('/')
  @Roles(Role.Employee, Role.Admin)
  @HttpCode(200)
  list(@Query() filter: VacancyFilterDto, @CurrentUser() user: TokenDto) {
    return this.searchUc.execute(filter, user);
  }

  @Get('/completed-and-archived')
  @Roles(Role.Employee, Role.Admin)
  @HttpCode(200)
  listCompletedAndArchived(
    @Query('page', ParseIntPipe) page = 1,
    @Query('pageSize', ParseIntPipe) pageSize = 10,
    @CurrentUser() user: TokenDto,
  ) {
    return this.completedUc.execute({ page, pageSize }, user);
  }
}
