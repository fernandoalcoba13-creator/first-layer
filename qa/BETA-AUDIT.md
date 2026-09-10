# First Layer: cierre de beta por bloques

Actualizado: 2026-09-10.

## Estado actual

- Base preservada: commit `8f59ea1`.
- Bloque 1: implementado anteriormente, validacion real en navegador pendiente.
- Bloque P1: implementado y verificado con pruebas de logica, por pedido expreso
  de continuar. Los cinco P1 originales se confirmaron en el codigo.
- La validacion manual NO se da por aprobada. Fernando confirmo el 10/09
  que aun no probo el juego. No iniciar polish visual.
- Push del bloque P1 confirmado el 10/09: `4e00937` en `origin/main`.
  El workflow existente publica GitHub Pages al recibir main.
  No se verifico el resultado del deploy automatico.
  Sin tag de beta, release ni cambios en Steam o itch.io.
- Continuacion acotada: dos bugs de temporizacion de boquilla reproducidos
  y corregidos; seis pruebas adicionales de minijuegos. Puerta manual pendiente.
- Esto NO certifica que la beta este terminada.

Antes de este bloque se genero `../before-p1-20260909.zip` con index, CSS,
scripts y QA del estado anterior. El commit de base conserva los assets.
Este commit versiona las correcciones, no certifica aprobacion manual.

La herramienta de navegador rechazo `file://` anteriormente. No se eludio
ese bloqueo con otra superficie ni con un servidor. Chrome/Edge, rendering,
audio y consola real siguen pendientes de prueba manual.

## Flujo y guardado

Dia 1 -> Noche 1 -> Dia 2 -> Noche 2 -> Dia 3 -> Noche 3 -> final persistente.
Nunca se inicia Dia 4.

Se conservan Phaser 3, G, scripts clasicos, orden de carga, rutas, atlas,
sprites, clave `first_layer_save` y formato v2. No hay dependencias nuevas.

Guardar sigue siendo un checkpoint de INICIO DEL TURNO, no un guardado
instantaneo. Recargar repite ese turno desde su checkpoint; las acciones
posteriores no se conservan. La unica extension del formato es
`checkpoint.betaResult = {gold, rep, repairs}`, opcional y compatible.
Al terminar se escribe un checkpoint terminal con los valores finales.

El saldo negativo representa deuda y usa el campo `gold` existente.
No se agregaron campos de deuda ni migraciones. El checkpoint siguiente
conserva el saldo; recargar antes vuelve al saldo original del turno,
como el resto de acciones de ese turno.

## P1 confirmados y corregidos

| P1 | Causa comprobada | Correccion |
| --- | --- | --- |
| Tablero nocturno inaccesible | Ancla visual rp(24,70), limite de movimiento y cafetera bloqueaban el acceso de E | Acceso rp(55,117) sobre piso libre. Anclas visuales separadas de accesos para tablero, PC, inventario e impresoras. Selector y accion compartidos por click/E, distancia escalada, bloqueo de repeticion y overlays |
| Cupo de clientes | Al superar maxClients con suficientes aceptaciones, no llegaban pedidos para reponer la reserva obligatoria | Se mantiene el cupo. Una oferta extra a la vez, solo sin clientes esperando y cuando pedidos/aceptaciones existentes no alcanzan para cumplir las cuotas. Si se rechaza, vuelve a existir esa salida |
| Economia sin salida | Gastar fondos en consumibles o llegar a Noche 3 sin $400 podia impedir material o P2 | Compra indispensable a deuda, confirmada, sin entregar dinero. Solo cuando no existe un trabajo cobrable con los medios/fondos disponibles. Grado minimo, repuestos faltantes hasta 2 en Dia 3, P2 en Noche 3 y reparacion de impresora rota. No financia consumibles ni mejoras opcionales |
| Objetivos vs cierre | Dia 3 mostraba repuestos no exigidos; Noche 2 perdia asignacion al cobrar; codigo de UI y escenas duplicaba condiciones | betaObjectives es la fuente comun de tareas y gates. Dia 3 exige 2 repuestos; asignacion se conserva por trabajo cargado o cobrado. Noche exige vaciar la cola, no abandonar pedidos sin asignar. Reputacion etiquetada como meta opcional |
| Final de beta | Guardaba el checkpoint anterior, y volver al menu borraba la partida | Snapshot terminal compatible, apertura directa del final tras recargar, menu sin borrar, continuar vuelve al final, reiniciar requiere confirmacion |

Las compras a deuda cuestan precio normal + 10% de recargo, redondeado
hacia arriba. Cada compra pide confirmacion con total y saldo resultante.
Los cobros normales amortizan la deuda. Al tener material suficiente o una
via de ingresos, deja de ofrecerse esa compra a deuda. No se perdona deuda
al pasar de turno ni se usa para completar automaticamente una mision.

Click mantiene la interaccion directa sobre el dibujo; E usa cercania al
punto de acceso. Ambos llaman la misma accion y solo eligen un objetivo.
No se alteraron hitboxes generales ni posiciones de los sprites.

La cola y los repuestos son condiciones de estado que deben mantenerse al
cierre. Los hitos de aceptar, comprar, cargar/cobrar y reparar no vuelven a
pendiente por haber terminado el trabajo. Abrir un panel puede demorar el
cierre automatico aun con tareas cumplidas; cerrar restaura la evaluacion.

## Correcciones relacionadas

- dayEarn aumenta al cobrar, no al aceptar. Cobro diurno idempotente.
- Al desbloquear P2 cambia la textura de la capa de objetos existente a
  la variante limpia correspondiente; no se regeneran ni reemplazan PNGs.
- Final ES/EN: FIRST LAYER / FIN DE LA BETA, "Tu taller recien empieza",
  dinero final, reputacion y reparaciones registradas. No se usa stats.ord
  como pedidos completados: ese contador representa aceptaciones.
- Sin URL publica configurada, el boton de wishlist permanece oculto.
  No se cambio la URL ni se contacto Steam.
- Lectura/escritura de preferencia musical protegida ante storage denegado.
  No se cambiaron pistas ni mezcla.
- Nulls y formas invalidas en stock, consumibles, mercado, estadisticas,
  pedidos e impresoras se normalizan sin lanzar excepciones.
- Referencias por orderIndex se reconstruyen antes de descartar entradas
  de pedidos invalidas. Asignaciones duplicadas o en impresoras bloqueadas
  vuelven a la cola sin consumir material otra vez.
- Un checkpoint nocturno anterior sin suficientes pedidos para cumplir
  sus misiones reabre el mismo dia, con aviso y conservando pedidos validos,
  fondos, mejoras y stock. No finge completar objetivos.
- Un pedido heredado de un material ya no vendido habilita exclusivamente
  la gama inicial de ese material mientras quede pendiente sin preparar.
- Trabajo retenido por una impresora rota no cuenta como ingresos disponibles
  para negar la recuperacion economica.
- Saves anteriores con proteccion electrica pueden cumplir la tarea
  previniendo el corte; no exige resolver un evento que su mejora impide.
- Si falla guardar el final, se mantiene en memoria y aparece un aviso.
  No se promete persistencia cuando el navegador deniega almacenamiento.

## Bloque 1 conservado

Siguen presentes las correcciones de eventos serializados, espera de paneles,
fallas obligatorias antes del ultimo cobro, callbacks ligados al turno,
resultados de minijuegos con identidad de intento, pausa con overlays,
reparacion durante apagones y bloqueo coherente de UI.

No se hicieron refactors generales. Se dejaron intactas las definiciones
duplicadas funcionales de inventario, el intervalo global de pro-patch
y los sistemas de dibujo/animacion existentes.

## Continuacion: temporizadores de minijuegos

Tras el push P1 se probaron los handlers de teclado del documento con reloj
simulado. Dos regresiones fallaron antes del cambio y pasan con la correccion:

- Iniciar boquilla dos veces reemplazaba el intento sin cancelar su intervalo;
  ambos temporizadores descontaban tiempo del intento nuevo. Ahora rechaza
  un segundo inicio, igual que cama, y cada tick pertenece a su intento.
- El ultimo hold valido al llegar a cero programaba victoria pero despues
  ejecutaba derrota en el mismo tick. La victoria confirmada tiene prioridad,
  igual que cama; el intento terminado no sigue descontando tiempo.

Solo se modifico esta logica en js/g-methods.js y su cache en index.html.
No se tocaron tiempos, dificultad, recompensas, assets, audio ni colisiones.

## Archivos modificados

| Archivo | Alcance |
| --- | --- |
| index.html | Acciones y texto base del final, aviso de save, versiones de cache |
| js/state.js | Misiones compartidas, normalizacion y snapshot terminal |
| js/scenes/DayScene.js | Recuperacion de clientes, gate, cobro y aviso de checkpoint |
| js/scenes/NightScene.js | Interacciones/accesos, gate, recuperacion y final |
| js/g-methods.js | Compras indispensables a deuda, compatibilidad de materiales y temporizador de boquilla |
| js/pro-patch.js | Lista consumiendo betaObjectives |
| js/ui.js | Final, menu sin borrar, confirmacion de reset, teclado del final |
| js/i18n.js | ES/EN de final, credito y meta opcional |
| js/audio.js | Solo proteccion de preferencia ante storage denegado |
| js/draw.js | Solo seleccion/actualizacion de variante de objetos nocturnos |
| qa/beta-regression.cjs | Pruebas existentes y nuevas |
| qa/BETA-AUDIT.md | Este informe y puerta manual |

No se cambiaron assets, styles.css, js/data.js ni js/main.js respecto al
respaldo 8f59ea1. No se reordeno ningun script.

## Pruebas automatizadas

Desde publish-repo:

```powershell
node qa/beta-regression.cjs
git diff --check
```

Ultimo resultado: **53/53 pruebas aprobadas** (23 anteriores + 24 P1 + 6 de minijuegos).
`git diff --check`: exit 0, sin errores de whitespace. Git solo avisa de la
conversion habitual LF -> CRLF del repositorio en Windows.

El host usa Node, DOM/Phaser/sonido simulados y los scripts reales.
Prueba sintaxis, orden de scripts, existencia/case de assets, create de
Day/Night en 1366x768 y 1920x1080 y save/load en cada turno.

Nuevos casos:
- Camino libre desde spawn hasta tablero con footRects reales de codigo,
  acceso a objetos fuera de solidos, E/click, tecla repetida y doble accion.
- Cupo agotado, cliente unico de recuperacion, rechazo, reserva restituida.
- UI y gates identicos en ES/EN para los seis turnos.
- 2 repuestos Dia 3, hito de asignacion Noche 2 y dayEarn/cobro unico.
- Deuda confirmada/cancelada, limites por material, ingresos alternativos,
  P2 al agotar ingresos, repuestos, reparacion y conservacion de deuda.
- Final persistido/recargado, menu, continuar, cancelar/confirmar reinicio.
- Estadisticas y textos finales, guardados malformados/antiguos,
  storage denegado y variante de fondo de P2.
- Pedidos retenidos en impresora rota o bloqueada, material heredado,
  checkpoint nocturno insuficiente y proteccion electrica heredada.
- Cuatro campañas guionadas de logica: seis turnos, dos resoluciones,
  compras normales o gasto reiterado en consumibles. Usan pedidos reales,
  compras, asignaciones, cobros, gates, transiciones y final.

Las campañas invocan callbacks de finalizacion y resolucion de eventos.
NO son partidas completas jugadas en Chrome/Edge ni prueban animaciones,
atlas cargados por Phaser, audio audible, input real, CORS o consola real.
No satisfacen las dos partidas humanas requeridas para el tag.

Seis casos adicionales de minijuegos:
- Inicio doble de boquilla conserva un unico intento y temporizador.
- Ultimo hold en el limite de tiempo resuelve una sola reparacion.
- Boquilla: timeout, reintento y victoria con ALT/espacio temporizados.
- Cama: victoria con flechas temporizadas en noches 2 y 3.
- Cama: fallo por tiempo, golpe temprano, tecla repetida y reintento.
- Termicas: secuencia incorrecta, recuperacion, pulsacion doble, corte normal
  y las dos rondas del corte prolongado, con una sola restauracion de energia.

Estas pruebas despachan eventos al handler real de document dentro del host
simulado. No verifican propagacion/foco del navegador ni teclas reservadas
como ALT. El caso limite de boquilla prepara explicitamente el ultimo hold;
los casos completos de boquilla y cama usan entradas y reloj, no el callback
de victoria como atajo.

## Riesgos y siguiente fase

- Validacion real file:// y de consola pendiente en ambos navegadores.
- Colisiones generales, escritorio, profundidad, layout, animaciones,
  escalas, resize y UI a 768 px siguen sin certificacion visual.
- Deuda puede terminar negativa: penaliza decisiones, pero no bloquea
  los objetivos. Su presentacion y recargo requieren aprobacion de Fernando;
  el balance final queda para la fase posterior.
- El guardado por turno no es autosave continuo. Hay que comunicar/probar
  ese comportamiento para no confundirlo con perdida accidental de progreso.
- Normalizacion cubre los casos probados, no garantiza reparar cualquier
  archivo arbitrariamente corrupto. Datos invalidos no se inventan como
  estadisticas reales. Backups externos siguen recomendados.
- Phaser y fuentes mantienen dependencias remotas previas. Esta revision
  no convierte el juego en una distribucion offline.
- Musica nocturna provisional, textos generales y game feel sin cambios.
- No iniciar polish, QA completo ni publicacion antes de aprobar este bloque.

## Checklist manual exacto

Usar otro perfil de Chrome/Edge para estas pruebas; no borrar el save
principal. Abrir directamente publish-repo/index.html. Hacer cada recorrido
en 1366x768 y 1920x1080. Mantener F12 > Console visible y anotar primer error.

1. Abrir index, continuar y verificar taller diurno, movimiento, PC/tienda
   y clientes. Dialogo/tienda deben pausar y cerrar sin dejar bloqueos.
2. Dia 1: aceptar 3, comprar PLA Basic, cargar P1, cobrar 2 y reservar 1.
   Agotar el reloj con una tarea pendiente: no debe avanzar.
3. Noche 1: cargar reserva, perder/reintentar/ganar boquilla, cobrar.
   Probar doble click al iniciar: no debe acelerar el reloj ni reiniciar.
   No debe cerrar con una falla o pedido pendiente. ALT/espacio deben actuar
   sobre el minijuego sin dejar el foco en el menu del navegador.
4. Dia 2: imprimir todos los pedidos antes de cerrar, agotar las llegadas
   normales y dejar cola vacia. Debe ofrecer un solo cliente extra;
   aceptar/rechazar debe funcionar. Con reserva suficiente vuelve a respetar
   el cupo, sin llegada infinita normal.
5. Noche 2: cargar trabajo, resolver cama y observar que "Asignar" sigue
   cumplido despues del cobro. No debe avanzar hasta terminar todos los pedidos.
6. Durante corte normal, caminar al lado derecho de la cafetera hasta el
   acceso del tablero (izquierda de la puerta). E abre termicas. En otro
   corte probar click sobre el tablero: mismo minijuego. Repetir E/click:
   no reinicia ni abre otro panel. No atravesar cafetera/banco.
7. Dia 3: la lista exige 2 repuestos y 2 pedidos reservados. Para simular
   escasez SOLO en perfil de pruebas: en Console ejecutar
   `G.stk.parts=1;`. La tarea debe quedar pendiente e impedir cierre.
   Comprar el segundo repuesto permite cumplirla.
8. Probar falta de fondos SOLO en ese perfil: `G.gold=0;`, con pedido
   sin material y sin otro trabajo que pueda pagar. Tienda debe ofrecer
   COMPRAR A DEUDA solo para material indispensable. Cancelar no cambia
   nada; confirmar muestra total con recargo y saldo negativo. Con material
   suficiente desaparece la opcion; cafe/mejoras opcionales no se financian.
9. Noche 3: con P2 sin comprar, terminar los trabajos y gastar los fondos.
   Comprar P2 a deuda debe permitir continuar. Probar cancelar primero.
   P2 aparece una sola vez, sin impresora estatica superpuesta.
10. Resolver corte prolongado (dos rondas) y fallas. No debe aparecer Dia 4.
    Final muestra FIRST LAYER / FIN DE LA BETA y estadisticas coherentes.
11. Recargar en el final: debe volver al final, no a una noche incompleta.
    VOLVER AL MENU conserva save. CONTINUAR reabre final.
    REINICIAR BETA: cancelar conserva; confirmar inicia Dia 1.
12. Guardar/recargar durante dia y noche: conserva numero y tipo de turno,
    pedidos/fondos del INICIO de ese turno. Deuda adquirida antes del nuevo
    checkpoint se conserva.
13. Cambiar idioma en menu a EN, continuar, revisar misiones/final; volver a
    ES. Revisar botones y textos sin superposiciones.
14. En los seis turnos: comprobar sprites y capas visibles, PC, inventario,
    impresoras, minijuegos, ausencia de errores nuevos y audio sin crashes.

Registrar navegador, resolucion, dia/fase, pasos y captura de cualquier fallo.
Al aprobar esta puerta recien se decide el siguiente bloque.
