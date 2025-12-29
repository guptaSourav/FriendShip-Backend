import { Test, TestingModule } from '@nestjs/testing';
import { SwipesController } from './swipes.controller';
import { SwipesService } from './swipes.service';

describe('SwipesController', () => {
  let controller: SwipesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwipesController],
      providers: [SwipesService],
    }).compile();

    controller = module.get<SwipesController>(SwipesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
