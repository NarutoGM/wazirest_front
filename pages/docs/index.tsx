'use client';
import Sidebard from '../components/docs/index';

export default function Docs() {
  return (
    <Sidebard>
      <div className="p-8 max-w-4xl mx-auto text-white">
        <h1 className="text-4xl font-bold mb-4">Introduccion a la Wazilrest API</h1>

        <p className="mb-6 text-zinc-300">
          Bienvenido a la guía oficial de integración de nuestras APIs. Aquí podrás explorar cómo conectarte fácilmente a la <strong>Wazilrest</strong>, una alternativa rápida, económica y sencilla a la solución oficial de WhatsApp Cloud API.
        </p>

        <p className="mb-6 text-zinc-300">
          Nuestra API está diseñada para adaptarse tanto a usuarios individuales como a negocios de cualquier tamaño. Gracias al sistema de escalado automático, puedes gestionar una gran cantidad de solicitudes sin complicaciones.
        </p>

        <p className="mb-8 text-zinc-300">
          A continuación te mostramos una comparativa clave entre WazilRest y WhatsApp Cloud API:
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">Comparativa</h2>
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full bg-zinc-800 border border-zinc-700 rounded overflow-hidden">
              <thead>
                <tr className="bg-zinc-900 text-left">
                  <th className="p-3 border border-zinc-700">Aspecto</th>
                  <th className="p-3 border border-zinc-700">Wazilrest API</th>
                  <th className="p-3 border border-zinc-700">WhatsApp Cloud API</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-zinc-700">Modelo de costos</td>
                  <td className="p-3">✅ Tarifa plana</td>
                  <td className="p-3">❌ Costo por mensaje</td>
                </tr>
                <tr>
                  <td className="p-3 border border-zinc-700">Tiempo de configuración</td>
                  <td className="p-3">✅ Listo en menos de 1 minuto</td>
                  <td className="p-3">❌ Verificación empresarial (3-10 días)</td>
                </tr>
                <tr>
                  <td className="p-3 border border-zinc-700">Uso de la app</td>
                  <td className="p-3">✅ Sigue usando WhatsApp normalmente</td>
                  <td className="p-3">❌ No se puede usar la app de WhatsApp</td>
                </tr>
                <tr>
                  <td className="p-3 border border-zinc-700">Facilidad de uso</td>
                  <td className="p-3">✅ Interfaz intuitiva y amigable</td>
                  <td className="p-3">❌ Requiere conocimientos técnicos</td>
                </tr>
                <tr>
                  <td className="p-3 border border-zinc-700">Flexibilidad</td>
                  <td className="p-3">✅ Ideal para pequeñas y medianas empresas</td>
                  <td className="p-3">❌ Enfocada en corporaciones con alta demanda</td>
                </tr>
                <tr>
                  <td className="p-3 border border-zinc-700">Restricciones técnicas</td>
                  <td className="p-3">✅ Compatible con cuentas personales o empresariales</td>
                  <td className="p-3">❌ Altos requisitos técnicos y aprobaciones</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>



        <div className="mt-8 flex justify-center">
          <button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200 shadow"
            onClick={() => {
              // Aquí puedes redirigir o abrir un modal para conectar WhatsApp
              window.location.href = "/docs/whatsapp-connect";
            }}
          >
            Próximos pasos: Conecta tu WhatsApp
          </button>
        </div>



      </div>
    </Sidebard>
  );
}
