import { Controller, Get, Body, Patch } from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { Roles } from 'src/shared/constants/metadata.constant';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { Role } from 'src/shared/enums/role.enum';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyService } from './company.service';

@Controller('v1/company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @Roles(Role.Admin, Role.Employee)
  findOne(@CurrentUser() user: Required<TokenDto>) {
    return this.companyService.findOne(user.companyId);
  }

  @Patch()
  @Roles(Role.Admin)
  update(
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() user: Required<TokenDto>,
  ) {
    return this.companyService.update(user.companyId, updateCompanyDto);
  }
}
