import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AutoFlow Pro API')
    .setDescription('AutoFlow Pro - 지능형 업무 자동화 플랫폼 API')
    .setVersion('1.0')
    .addTag('workflows')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🚀 AutoFlow Pro Backend is running on: http://localhost:${port}`)
  console.log(`📚 API Documentation: http://localhost:${port}/api`)
}

bootstrap()
