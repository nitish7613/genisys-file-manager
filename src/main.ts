import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('File Manager Api Documentation')
    .setDescription('File Manager is a service to do crud operation on images')
    .setVersion('1.0')
    .addTag('Genisys')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('documentation', app, document);
  await app.listen(process.env.PORT);
  console.log("Server is running on " + process.env.PORT)
}
bootstrap();
