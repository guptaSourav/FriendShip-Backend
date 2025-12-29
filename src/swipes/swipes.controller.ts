import { Controller } from '@nestjs/common';
import { SwipesService } from './swipes.service';

@Controller('swipes')
export class SwipesController {
  constructor(private readonly swipesService: SwipesService) {}
}
