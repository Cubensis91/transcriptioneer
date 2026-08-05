"use client";

import { ApiClientError } from "@transcriptioneer/api-client";
import { Alert, Button, Card, CardContent, CardFooter, CardHeader, FormField, Input } from "@transcriptioneer/ui";
import { loginSchema } from "@transcriptioneer/validation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BrandLockup } from "@/components/brand-mark";
import { ScribeMark } from "@/components/scribe-mark";
import { authService, googleSignInUrl } from "@/lib/services/auth-service";
import { zodFieldErrors } from "@/lib/zod-field-errors";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await authService.login(result.data);
      router.push("/");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "No pudimos iniciar sesión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <ScribeMark className="mb-2 size-14" animate />
        <BrandLockup />
        <p className="mt-1 text-sm text-text-muted">Bienvenido de vuelta. Retomemos donde lo dejamos.</p>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {formError && (
          <Alert variant="error" role="alert">
            {formError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="Correo electrónico" htmlFor="email" error={fieldErrors.email} required>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          </FormField>

          <FormField label="Contraseña" htmlFor="password" error={fieldErrors.password} required>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormField>

          <Button type="submit" size="lg" loading={submitting} className="mt-1">
            Iniciar sesión
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-text-subtle">
          <span className="h-px flex-1 bg-border" />
          o
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="secondary" size="lg" asChild>
          <a href={googleSignInUrl()}>Continuar con Google</a>
        </Button>
      </CardContent>

      <CardFooter className="justify-center text-sm text-text-muted">
        ¿Todavía no tienes cuenta?&nbsp;
        <Link href="/register" className="font-medium text-accent hover:underline">
          Crea una
        </Link>
      </CardFooter>
    </Card>
  );
}
