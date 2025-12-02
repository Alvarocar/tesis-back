import { TokenDto } from "../security/dto/token.dto";

export interface RequestWithUser extends Request {
  user: TokenDto
}

export interface RequestWithOptionalUser extends Request {
  user?: TokenDto
}