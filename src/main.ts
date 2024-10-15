import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  console.log(port);

  try {
    await app.listen(port);
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error('Error starting server:', error, error.message);
  }
}

bootstrap();
