"use client";

import { ApiClientError } from "@transcriptioneer/api-client";
import { Alert, Button, Card, CardContent, CardFooter, CardHeader, FormField, Input } from "@transcriptioneer/ui";
import { registerSchema } from "@transcriptioneer/validation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BrandLockup } from "@/components/brand-mark";
import { ScribeMark } from "@/components/scribe-mark";
import { authService, googleSignInUrl } from "@/lib/services/auth-service";
import { zodFieldErrors } from "@/lib/zod-field-errors";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const result = registerSchema.safeParse({ name, organizationName, email, password });
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await authService.register(result.data);
      router.push("/");
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof ApiClientError ? err.message : "No pudimos crear tu cuenta. Intenta de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <ScribeMark className="mb-2 size-14" animate />
        <BrandLockup />
        <p className="mt-1 text-sm text-text-muted">
          Empecemos a construir tu memoria. Solo necesito un par de datos.
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {formError && (
          <Alert variant="error" role="alert">
            {formError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="Tu nombre" htmlFor="name" error={fieldErrors.name} required>
            <Input
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
            />
          </FormField>

          <FormField
            label="Nombre de tu espacio de trabajo"
            htmlFor="organizationName"
            hint="Puedes cambiarlo después."
            error={fieldErrors.organizationName}
            required
          >
            <Input
              autoComplete="organization"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Mi organización"
            />
          </FormField>

          <FormField label="Correo electrónico" htmlFor="email" error={fieldErrors.email} required>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          </FormField>

          <FormField
            label="Contraseña"
            htmlFor="password"
            hint="Al menos 8 caracteres, con una letra y un número."
            error={fieldErrors.password}
            required
          >
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormField>

          <Button type="submit" size="lg" loading={submitting} className="mt-1">
            Crear cuenta
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
        ¿Ya tienes cuenta?&nbsp;
        <Link href="/login" className="font-medium text-accent hover:underline">
          Inicia sesión
        </Link>
      </CardFooter>
    </Card>
  );
}
