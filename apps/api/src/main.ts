import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { validateEnv } from "./config/env.validation";

async function bootstrap() {
  const env = validateEnv(process.env);
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: env.WEB_APP_URL });

  await app.listen(env.PORT);
}
void bootstrap();
