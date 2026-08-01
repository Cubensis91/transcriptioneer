# Whisper local — instalación y operación (VPS de producción)

Servidor: `93.127.211.218` (Hostinger KVM 1) · `app.transcriptioneer.online`
Instalado: 2026-08-01

## Resumen del hardware (Fase 1)

| Recurso | Valor | Nota |
|---|---|---|
| CPU | **1 vCPU** (host: AMD EPYC 9354P) | El cuello de botella real del servidor |
| RAM | 3.8 GiB | ~1GB ya usado por Postgres/Redis/MinIO/API |
| Disco | 48 GB (38 GB libres tras la instalación) | Sobra espacio |
| Swap | 2 GB (`/swapfile`, `swappiness=10`) | No existía antes de esta instalación |
| GPU | Ninguna | Esperado en este plan de VPS |

## Modelo elegido: `base`

- Medido en este servidor: **~2.7x tiempo real** en CPU de 1 core (clip de prueba de 3.8s tardó 10.35s).
- RSS pico al cargar el modelo: **708 MB** — con solo 3.8GB totales, esto fija el límite de concurrencia en **1 transcripción a la vez**, nunca más.
- `tiny` es la alternativa si la latencia importa más que la precisión; `small` en adelante no es realista en este hardware sin más RAM/CPU.

## Estructura de directorios

```
/opt/transcriptioneer/whisper/
├── venv/                  # entorno virtual de Python, aislado del sistema
├── models/
│   └── base.pt             # modelo Whisper (139MB), NO en ~/.cache
├── logs/                   # reservado para cuando el worker real empiece a loguear
└── transcribe.py           # entrypoint reusable (ver abajo)
```

Deliberadamente **no** se instaló nada a nivel de sistema fuera de dependencias genéricas
(`python3-pip`, `python3-venv`, `git`, `ffmpeg`, `build-essential`, `curl`, `espeak-ng`
solo para pruebas). PyTorch y Whisper viven exclusivamente dentro del venv.

## `transcribe.py` — contrato de la interfaz

```bash
/opt/transcriptioneer/whisper/venv/bin/python3 \
  /opt/transcriptioneer/whisper/transcribe.py \
  <ruta_al_audio> --model base
```

- **stdout**: un único JSON — `{"text": "...", "language": "en", "segments": [...]}`
- **stderr**: todo el ruido de progreso de Whisper (barras de descarga, logs internos)
- **exit code**: `0` en éxito; `1` con `{"error": "..."}` en stdout si falla

Este contrato es intencional: es la implementación `LocalWhisperProvider` de una interfaz
de transcripción — el futuro worker de NestJS (BullMQ) lo invoca como subproceso y lee el
JSON. El día que se sume OpenAI/Gemini/Deepgram, es una clase nueva que cumple el mismo
contrato de salida; el worker no cambia.

## Comandos de mantenimiento

**Probar manualmente:**
```bash
/opt/transcriptioneer/whisper/venv/bin/python3 \
  /opt/transcriptioneer/whisper/transcribe.py /ruta/a/audio.mp3 --model base
```

**Actualizar Whisper a la última versión del repo oficial:**
```bash
cd /opt/transcriptioneer/whisper
./venv/bin/pip install --upgrade git+https://github.com/openai/whisper.git
```

**Actualizar PyTorch (CPU-only):**
```bash
cd /opt/transcriptioneer/whisper
./venv/bin/pip install --upgrade torch --index-url https://download.pytorch.org/whl/cpu
```

**Descargar/cambiar de modelo** (ej. a `tiny`):
```bash
/opt/transcriptioneer/whisper/venv/bin/python3 -c "
import whisper
whisper.load_model('tiny', download_root='/opt/transcriptioneer/whisper/models')
"
```

**Ver espacio usado:**
```bash
du -sh /opt/transcriptioneer/whisper/*
```

**Ver memoria/swap en vivo mientras corre una transcripción:**
```bash
watch -n1 free -h
```

## Desinstalación completa

```bash
rm -rf /opt/transcriptioneer/whisper
# el swapfile es independiente de Whisper — no lo borres a menos que también
# quieras revertir esa protección:
#   swapoff /swapfile && rm /swapfile && sed -i '/swapfile/d' /etc/fstab
```

## Guía de problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `ModuleNotFoundError: whisper` | Se está usando el Python del sistema, no el del venv | Usar siempre `/opt/transcriptioneer/whisper/venv/bin/python3` |
| Proceso muy lento / servidor no responde | Dos transcripciones corriendo a la vez en 1 vCPU | Limitar la cola del worker a concurrencia = 1 |
| `OSError` / proceso matado sin aviso | Pico de RAM sin swap | Confirmar `swapon --show` — debe mostrar `/swapfile` activo |
| Modelo se re-descarga cada vez | No se pasó `download_root` | Siempre usar `download_root='/opt/transcriptioneer/whisper/models'` |
| Audio no se decodifica | Falta `ffmpeg` o formato raro | `ffmpeg -i archivo` para diagnosticar; ffmpeg soporta prácticamente todo, incluidos formatos comprimidos de apps de grabación (AMR, Opus, M4A de bajo bitrate) |
| Transcripción tarda mucho en un archivo "chico" | El tamaño en MB no predice el tiempo — la **duración** sí | Estimar tiempo como `duración_audio × 2.7` para el modelo `base` en este servidor |

## Próximo paso pendiente (fuera del alcance de esta instalación)

Integrar `transcribe.py` al backend real: un worker de BullMQ en `packages/ai` (o
`apps/api`) que lo invoque como subproceso con `nice -n 10` / `ionice -c2 -n7`, limite
concurrencia a 1, y escriba resultados en Postgres. Ver discusión de arquitectura en la
conversación del 2026-08-01 para el diseño del endpoint mínimo de prueba antes de eso.
