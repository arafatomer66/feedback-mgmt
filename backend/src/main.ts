import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*', credentials: true });
  app.setGlobalPrefix('api');

  if (process.env.AUTO_SEED === 'true') {
    const seeder = app.get(SeedService);
    await seeder.seed();
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(`FeedbackHub API running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
