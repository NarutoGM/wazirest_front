

'use client';
import Image from 'next/image';

export default function Helpme() {

    return (

<div className="bg-zinc-900 px-8 hidden xl:block py-9 rounded-lg shadow-lg max-w-3xl mx-auto mt-10">
  <h2 className="text-xl font-bold px-2 text-white mb-4 flex items-center gap-2">
    ¿Cómo escanear?
  </h2>
  <Image
    src="/logo/helpme.png"
    alt="Logo"
    width={400}
    height={400}
    className="hidden lg:block w-1/2 h-auto mx-auto mt-10"
    style={{ maxWidth: '400px' }}
  />
  <div className="mt-8 max-w-md mx-auto">
    <ol className="space-y-4 text-zinc-200">
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-1">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
          </svg>
        </span>
        <span>
          <span className="font-semibold text-emerald-400">Paso 1:</span> Abre WhatsApp en tu teléfono.
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-1">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
          </svg>
        </span>
        <span>
          <span className="font-semibold text-emerald-400">Paso 2:</span> Ve a <span className="font-semibold">Ajustes {'>'} Dispositivos vinculados</span> y <span className="text-red-400 font-semibold">cierra todas las sesiones activas</span> si las hay.
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-1">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
          </svg>
        </span>
        <span>
          <span className="font-semibold text-emerald-400">Paso 3:</span> Pulsa en <span className="font-semibold">Vincular un dispositivo</span> y escanea el código QR que aparece arriba.
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-1">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1 4v1m-1-6h.01M12 9v2m0 4v.01M4.293 6.707a1 1 0 011.414 0L12 13.586l6.293-6.293a1 1 0 111.414 1.414L12 16.414 4.293 8.121a1 1 0 010-1.414z" />
          </svg>
        </span>
        <span>
          <span className="font-semibold text-yellow-400">Importante:</span> Para garantizar una conexión estable, <span className="font-semibold">no abras otras sesiones de WhatsApp Web antes de escanear aqui, al menos hasta que la conexión se priorize</span>.
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-1">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1 4v1m-1-6h.01M12 9v2m0 4v.01M4.293 6.707a1 1 0 011.414 0L12 13.586l6.293-6.293a1 1 0 111.414 1.414L12 16.414 4.293 8.121a1 1 0 010-1.414z" />
          </svg>
        </span>
        <span>
          <span className="font-semibold text-yellow-400">Recomendación:</span> Después de escanear el código QR, <span className="font-semibold">espera al menos 2 minutos</span> antes de cerrar esta ventana o continuar con otras acciones. Esto ayuda a consolidar la conexión.
        </span>
      </li>
    </ol>
  </div>
</div>

    );
}
