import cookieParser from "cookie-parser";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/http-exception.filter";
import { validateEnv } from "./config/env.validation";

async function bootstrap() {
  const env = validateEnv(process.env);
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: env.WEB_APP_URL, credentials: true });
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(env.PORT);
}
void bootstrap();
