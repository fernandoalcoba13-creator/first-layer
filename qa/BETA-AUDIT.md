# First Layer: cierre de beta por bloques

Actualizado: 2026-09-12.

## Estado actual

- Base preservada: commit `8f59ea1`.
- Bloque 1: implementado anteriormente, validacion real en navegador pendiente.
- Bloque P1: implementado y verificado con pruebas de logica, por pedido expreso
  de continuar. Los cinco P1 originales se confirmaron en el codigo.
- Fernando confirmo el 11/09 que dia, noche y recarga funcionan en Chrome/Edge.
  Se aprueba esa puerta basica para iniciar colisiones. No indico navegador,
  resolucion ni recorrido completo; no equivale a la QA final de seis turnos.
- Push del bloque P1 confirmado el 10/09: `4e00937` en `origin/main`.
  El workflow existente publica GitHub Pages al recibir main.
  No se verifico el resultado del deploy automatico.
  Sin tag de beta, release ni cambios en Steam o itch.io.
- Continuacion acotada: dos bugs de temporizacion de boquilla reproducidos
  y corregidos; seis pruebas adicionales de minijuegos. Puerta manual pendiente.
- Ese bloque se subio como `0d23d65`. Continuacion local del 11/09: guardado
  manual con resultado veraz y seis pruebas de interrupciones/almacenamiento.
  Respaldado en `c1d199c` tras la confirmacion manual, antes de ajustar colisiones.
- Bloque de colisiones iniciado el 11/09: seis regresiones nuevas, 65/65 en verde.
  Fernando aprobo el acceso al escritorio y recorrido alrededor de muebles.
  Respaldado en `21b6a58`, sin push; la matriz final Chrome/Edge sigue pendiente.
- Bloque de animaciones del 11/09: cafe/reparacion ajustados sobre los mismos
  sprites. Tras reportar bloqueo al tomar cafe se corrigio su limpieza;
  doce pruebas nuevas, 77/77 de logica/geometria. Fernando confirmo reparado
  el cafe y autorizo continuar. Respaldo `b2e9b19`, sin push. La matriz visual
  completa de animaciones sigue pendiente; la confirmacion no la sustituye.
- Bloque acotado de audio: reintentos por teclado/puntero, reproduccion unica,
  recuperacion de SFX suspendidos y boton ES/EN. Suite de audio 12/12 y
  regresion general 77/77. Fernando confirmo ON/OFF, paso dia/noche y recarga
  sin problemas el 12/09; se autoriza el siguiente bloque de UI. No se aporto
  matriz por navegador/resolucion ni logs. Sin cambios de pistas ni assets.
- Audio respaldado en `51ce5a8`, sin push. Bloque de textos UI: cinco etiquetas
  persistentes ES/EN y nombre accesible del cierre de tienda. 81/81 pruebas
  generales y 12/12 de audio. Pendiente comprobacion visual de estos textos;
  no cambia gameplay, assets, escenas, economia, colisiones ni formato de save.
- Esto NO certifica que la beta este terminada.

### Prioridad actual: upgrade visual solicitado

Fernando postergo balance y recorridos finales para mejorar UI y animaciones
con spritesheets del Escritorio. Respaldo del bloque anterior: `95268e2`.
Primera pasada visual local, aun sin aprobacion de rendering: 82/82 pruebas
generales, 9/9 de sprites y 12/12 de audio. No hay push ni tag. No se declara
terminado el rediseño completo ni se reemplaza la QA real con estas pruebas.

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
En el bloque P1 no se alteraron hitboxes generales ni posiciones de los sprites.
El ajuste posterior de hitboxes se documenta por separado mas abajo.

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

## Continuacion: interrupciones y guardado manual

Se revisaron menu, recarga, cierre de Night y reset durante minijuegos.
Las protecciones existentes pasan las nuevas pruebas sin modificar escenas:
menu/atajos no reemplazan un evento, shutdown cancela el intervalo activo
y los callbacks de termicas no avanzan despues de terminar la noche.
La recarga desde boquilla, cama o termicas restaura el checkpoint del turno,
sin conservar la falla, el minijuego ni la pausa electrica de la sesion anterior.

Bug confirmado antes de corregir: Q anunciaba exito aunque doSave devolviera
false por almacenamiento denegado; Guardar no mostraba aviso de error.
Ambas pruebas fallaron sobre `0d23d65`. Ahora boton y tecla llaman a
G.manualSave, que informa el resultado real usando los textos ES/EN existentes.
Restablecer acceso al storage permite guardar de nuevo sin reemplazar el
checkpoint por el estado instantaneo. No se cambio doSave ni el formato v2.

Alcance local: js/ui.js, su boton/version de cache en index.html y los dos
archivos QA. No se cambiaron autosaves, escenas, assets ni balance.
Los avisos de autosave siguen con su comportamiento anterior; esta correccion
cubre las dos acciones manuales. No implica validacion real de localStorage.

## Archivos modificados

### Bloque de colisiones del 11/09

Se inspeccionaron los PNG existentes sin modificarlos y se midieron sus
componentes opacos. Las coordenadas siguientes son pixeles del arte fuente,
no pixeles de pantalla. Las hitboxes son zonas de contacto, no mascaras de
toda la silueta: el personaje puede acercarse por detras de una mesa alta.

- Escritorio diurno: el PNG ocupa x=12..168, y=95..173. La union anterior
  dejaba un hueco entre y=147 y y=156; ahora las dos zonas se solapan y queda
  un paso trasero a y=110, por encima del retorno que comienza en y=116.
- Cajas y maniqui diurnos terminan en y=109/107, no y=139/141. Se retiraron
  sus bloqueos desplazados del pasillo y se ajusto el pie de la planta.
- Exhibidor y cafetera diurnos terminan en y=125, no y=153. La mesa frontal
  ocupa x=127..217; el banco de P1 coincide con sus 30 px de ancho dibujados.
- Cafetera nocturna: componente x=11..42, y=125..189. Estanteria inferior
  izquierda: x=12..87, y=195..260. Se corrigieron sus offsets antiguos.
- Bancos nocturnos terminan en y=126/127. Los accesos de impresoras se
  desplazaron a y=132 para quedar fuera del nuevo contacto; no se movieron
  las impresoras ni sus puntos visuales de click.
- Las cajas nocturnas derechas usan rectangulos separados, en vez de tapar
  el suelo vacio entre pilas con un unico bloque de 94 x 82.
- Day/Night prueban cada movimiento en pasos de hasta 2 px de arte fuente.
  Evita atravesar muebles finos con un delta grande y conserva deslizamiento
  por ejes. Los deltas se limitan al cuarto antes de calcular los pasos.
- Alcance diurno de objetos proporcional a la escena (28 px de arte fuente),
  para usar el PC desde detras del escritorio tambien en 1920x1080. E ignora
  repeticion de tecla. Se conserva la prioridad de clientes existente.

Los cinco primeros casos nuevos fallaron antes del parche de escenas; se
agrego ademas cobertura de deslizamiento y limites. Las 59 pruebas anteriores
siguen pasando. Cambios de juego: solo DayScene.js, NightScene.js y sus
versiones de cache en index.html. Save, audio, sprites, posiciones visuales,
escala, profundidad, misiones y economia no se modificaron en este bloque.
Sofa y mesa del lounge quedan sin cambios, pendientes de validacion visual.

### Historial acumulado

| Archivo | Alcance |
| --- | --- |
| index.html | Acciones y texto base del final, aviso de save, versiones de cache |
| js/state.js | Misiones compartidas, normalizacion y snapshot terminal |
| js/scenes/DayScene.js | Recuperacion de clientes, gate, cobro y aviso de checkpoint |
| js/scenes/NightScene.js | Interacciones/accesos, gate, recuperacion y final |
| js/g-methods.js | Compras indispensables a deuda, compatibilidad de materiales y temporizador de boquilla |
| js/pro-patch.js | Lista consumiendo betaObjectives |
| js/ui.js | Final, menu sin borrar, confirmacion de reset, teclado del final y resultado de guardado manual |
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

Ultimo resultado: **77/77 pruebas aprobadas** (23 anteriores + 24 P1 + 6 de minijuegos + 6 de interrupciones/guardado + 6 de colisiones + 12 de acciones).
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

Seis casos de interrupciones/guardado:
- Menu, Escape y atajos globales no sustituyen un minijuego nocturno activo.
- Guardar durante boquilla, cama y termicas recarga el checkpoint correcto,
  con las referencias pedido/impresora y sin pausas/eventos de la sesion anterior.
- Shutdown cancela timers de boquilla/cama e invalida acciones de termicas.
- Q informa fallo y recuperacion del storage en ES/EN, sin sobrescribir el
  checkpoint ni anunciar exito cuando la escritura fue rechazada.
- El boton Guardar cumple el mismo contrato; se ejecuta su onclick real
  extraido de index.html, no se simula un click de navegador.
- Cancelar reset o fallar al borrar storage conserva save, intento y bloqueo;
  no solicita reload. Se usa storage simulado, nunca el save de Fernando.

## Riesgos y siguiente fase

- Fernando aprobo dia, noche y recarga antes de este bloque. No se especifico
  navegador/resolucion ni se aporto un log de consola. La matriz completa
  Chrome/Edge sigue pendiente. Luego aprobo el bloque de colisiones sin
  detallar navegador/resolucion; no equivale a dos campañas completas.
- Profundidad, layout, animaciones, escalas, resize y UI a 768 px siguen sin
  certificacion visual completa. Cafe/reparacion tienen una nueva puerta manual.
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
- No ampliar el polish ni publicar antes de aprobar las nuevas animaciones.

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
    Probar boton Guardar y tecla Q: ambos avisan que se guarda el checkpoint.
    En un perfil de pruebas con almacenamiento bloqueado deben avisar error,
    nunca exito. No cerrar esa pestaña hasta restablecer permisos y guardar.
13. Cambiar idioma en menu a EN, continuar, revisar misiones/final; volver a
    ES. Revisar botones y textos sin superposiciones.
14. En los seis turnos: comprobar sprites y capas visibles, PC, inventario,
    impresoras, minijuegos, ausencia de errores nuevos y audio sin crashes.

Registrar navegador, resolucion, dia/fase, pasos y captura de cualquier fallo.
Al aprobar esta puerta recien se decide el siguiente bloque.

## Puerta manual del bloque de colisiones

Recargar publish-repo/index.html para cargar Day v33 / Night v38.
Probar en 1366x768 y 1920x1080 con F12 > Console abierto:

1. Dia: entrar al escritorio por arriba del retorno derecho y recorrer su
   parte trasera. La esquina de la L debe frenar el paso, no dejar cruzarla.
2. Abrir PC/tienda desde detras con E y mediante click. Cerrar y mantener E:
   una tecla sostenida no debe volver a abrir el panel por repeticion.
3. Rodear cajas, maniqui, exhibidor, cafetera y banco de P1. No debe existir
   un muro invisible donde antes estaban sus hitboxes. Revisar el contacto
   contra el frente y los laterales de cada objeto, no solo un acceso.
4. Noche: ir desde spawn al PC, inventario, impresoras y tablero. Rodear la
   cafetera y pasar por los huecos entre las pilas derechas. Cargar/reparar P1
   y, al desbloquearla, P2; resolver un corte con E y luego mediante click.
5. Mantener movimiento diagonal contra las esquinas: debe deslizarse por el
   eje libre sin cruzar el mueble ni quedar atrapado. Guardar/recargar cada
   tipo de turno y confirmar capas, personajes y acciones sin errores nuevos.

Las pruebas Node comprueban puntos de contacto, rutas con movePlayer y
accesos usando Phaser simulado. No certifican oclusion de sprites, sensacion
del control, canvas ni consola del navegador. Esperar esta validacion antes
de seguir con presentacion y animaciones.

## Aprobacion del bloque de colisiones - 2026-09-11

Fernando confirmo "confirmo! seguimos" al solicitarle validar el acceso
trasero del escritorio y el recorrido alrededor de muebles. El bloque queda
aprobado para avanzar a animaciones de cafe y reparacion. No se aportaron
logs de consola ni una matriz por navegador/resolucion; esa certificacion
completa sigue pendiente. Regresion previa al respaldo: 65/65 casos de logica.
No se hizo push, tag ni publicacion.

## Bloque de animaciones - 2026-09-11

Respaldo previo: `21b6a58` (colisiones aprobadas). Alcance de produccion:
`js/draw.js` y su cache `v29` en index; Day v33 / Night v38 sin cambios.
No se modificaron sprites, atlas, audio, colisiones, economia ni formato de save.

Problemas comprobados en el codigo anterior:
- El sprite se creaba en y=24 y el update lo llevaba a y=0: salto inicial.
- Boca desplazada horizontalmente y taza girando sobre su centro. Mano y taza
  tenian tweens independientes, asi que la inclinacion perdia el contacto.
- La llave se movia separada de la mano y las chispas nacian cerca de los pies.
- Las acciones terminadas dejaban listeners de shutdown y timers pendientes;
  callbacks de particulas podian ejecutarse despues de interrumpir la accion.
- Los anclajes del fallback procedural no coincidian con su cara/manos reales.

Cambios:
- Baseline y=0 desde la creacion; el gesto no inclina ni deforma todo el cuerpo.
- Anclajes medidos en los frames 50x50 existentes, considerando origin y escala
  diurna 2.6 / nocturna 2.45. Boca frontal en (25,17), mano cerca de y=32.
- Taza con pivote en el borde, mano solidaria al objeto y antebrazo procedural.
  Sube, hace dos sorbos y baja; restaura la direccion previa.
- Llave con pivote en el agarre y particulas en su punta. Mantiene el
  comportamiento previo de orientarse lateralmente hacia la impresora cercana.
- Limpieza idempotente de timers, listeners, tweens y efectos tanto al terminar
  como en shutdown. Timeout de seguridad si se corta una cadena de tweens.

Pruebas: 75/75. Los diez casos nuevos comprueban baseline, anclajes, pivotes,
chispas, 14 acciones alternadas, bloqueo de duplicados, interrupcion, timeout,
fallback, consumo/energia, reparacion unica y checkpoint durante ambas acciones.
La suite con el draw anterior ejecutado SOLO EN MEMORIA reprodujo seis fallos
(67/73 antes de agregar los dos casos finales). No se revirtio ningun archivo.
Se ajusto una prueba para medir la chispa al crearse, antes del siguiente tick
del tween en el mismo timestamp; no se altero produccion para ese ajuste.

El host nuevo simula tiempos y posiciones de tweens. NO renderiza Phaser,
no reproduce easing real, propagacion del navegador ni orden de shutdown
de sus plugins. Estas siguen siendo animaciones procedurales sobre caminatas,
no frames nuevos dibujados por Mati. La integracion visual del brazo y la mano,
oclusion, suavidad y consola necesitan la prueba real.

### Puerta manual de animaciones

Recargar publish-repo/index.html (draw v30), sin borrar el save principal.
Usar un perfil de prueba en Chrome/Edge, 1366x768 y 1920x1080:

1. Dia: caminar/parar y tomar cafe o infusion. Ver que no salta la altura del
   personaje, que la taza llega a la boca y la mano acompaña los dos sorbos.
   Repetir mirando izquierda/derecha; al terminar vuelve el control normal.
2. Noche: tomar una bebida y reparar una impresora (boquilla/cama o reparacion
   normal). La llave acompaña la mano; las particulas no aparecen en los pies.
   Confirmar que se cobra una sola vez y que la impresora retoma segun su estado.
3. Probar durante un corte: reparar no debe devolver energia a la impresora;
   se mantiene pausada hasta resolver termicas. Revisar la luz de emergencia.
4. Repetir acciones y abrir/cerrar menu. No deben quedar taza/llave flotando,
   aparecer efectos atrasados ni quedar el personaje bloqueado. Revisar F12.
5. Guardar/recargar dia y noche: mismo checkpoint de inicio de turno, sin taza
   ni accion persistida. Confirmar ambos escenarios y assets visibles.

Sin push, tag ni release. Esperar aprobacion de este bloque antes de UI/audio.

### Correccion del bloqueo tras el cafe

Fernando reporto que al terminar el cafe el personaje quedaba trabado.
La puerta visual NO se aprobo: las 75 pruebas anteriores no detectaron
el contrato incorrecto de destruccion en el simulador de acciones.

En draw v29 se llamaba rig.destroy(true) estando el rig dentro del jugador.
En Phaser 3.60, el argumento es fromScene, no destroyChildren. El evento
destroy llega a Container.remove(child, destroyChild), por lo que true
puede reentrar en destroy y abortar finish antes de liberar _actBusy.
Referencias de la version que carga index:
- https://github.com/phaserjs/phaser/blob/v3.60.0/src/gameobjects/GameObject.js
- https://github.com/phaserjs/phaser/blob/v3.60.0/src/gameobjects/container/Container.js

Correccion acotada en draw v30: usar destroy() y liberar primero el bloqueo
propio de la accion, sin tocar G.block ni overlays. No cambia el movimiento,
los sprites, las colisiones, el costo del cafe ni el checkpoint.

El simulador ahora rechaza destroy(true) para efectos dentro de otro container
y destruye sus hijos sin confundir ese parametro. Antes del parche: 69/77;
despues: 77/77. Dos casos nuevos comprueban consumo desde inventario, cierre
del panel y movimiento con el update real de cada escena, y liberacion de
_actBusy antes de limpiar efectos sin desbloquear otro overlay.
Son pruebas de logica con el contrato de Phaser comprobado en su fuente,
NO una ejecucion del renderer o del navegador ni una prueba completa del motor.

Revalidacion requerida: recargar draw v30, tomar cafe desde el inventario,
esperar que baje la taza y caminar con WASD/flechas, en dia y noche. Probar
reparacion, consola y recarga del checkpoint. Recargar vuelve al inicio del
turno guardado; no borrar el save ni usar Reset. No hubo push.

### Confirmacion del usuario y siguiente bloque

El 11/09 Fernando confirmo "listo reparado, ahora segui el plan" tras probar
el arreglo del cafe. Se registra resuelto el bloqueo reportado y autorizada
la continuacion a UI/audio. No se infiere de esa respuesta una matriz completa
de navegadores/resoluciones ni la aprobacion del resto de efectos visuales.
Se respalda el bloque de acciones antes de continuar; no se publica ni etiqueta.

## Bloque de audio - 2026-09-12

Respaldo previo: `b2e9b19` (animaciones y correccion del bloqueo de cafe).
Alcance: `js/audio.js`, sincronizacion del boton en `js/i18n.js` y caches v22
de ambos scripts en index. Day v33 / Night v38 / draw v30 no cambian.
No se modifican escenas, colisiones, sprites, atlas, economia ni formato de save.

Problemas comprobados por lectura y pruebas de contratos de API:
- El unico reintento de musica usaba pointerdown con once:true. Un gesto en
  el menu podia agotarlo antes de iniciar el turno; teclado no reintentaba.
- Un AudioContext de SFX suspendido no recibia resume al volver a interactuar.
- Cambiar ES/EN no actualizaba el boton de musica hasta otra accion de audio.
- Llamadas repetidas no distinguian una reproduccion pendiente de una activa.

Correcciones acotadas:
- Reintentar musica al interactuar, solo si esta habilitada y pausada, sin
  llamadas duplicadas mientras play esta pendiente. No consumir ni bloquear
  inputs del juego; ignorar repeticion de tecla.
- Pausar la pista anterior al cambiar de turno, respetar OFF en transiciones
  y resultados tardios, y no reiniciar tras stop por un gesto posterior.
- Manejar rechazo de play/resume y fallos de construccion sin promesas sin
  atender. Un resultado viejo no invalida una solicitud mas reciente.
- Reanudar el contexto existente de SFX al interactuar, sin crear contextos
  adicionales. El boton sigue controlando musica, no silencia los SFX.
- Boton ES/EN con nombre accesible, estado aria-pressed y tooltip traducido.
  ON/OFF indica preferencia, no garantiza permiso de reproduccion del navegador.

Se conserva day-theme.mp3: dia volumen .38; mezcla nocturna provisional .22
y playbackRate .82. No se agrega ni reemplaza una pista. La musica nocturna
definitiva sigue pendiente del asset correspondiente.

Verificacion automatizada:
- `node qa/audio-regression.cjs`: 12/12. Carga audio/i18n reales en Node VM,
  con HTMLAudio, AudioContext, DOM y storage simulados. Antes del parche 4/12;
  algunos casos nuevos son defensivos, no fallos observados en navegador.
- `node qa/beta-regression.cjs`: 77/77. Sintaxis, orden de scripts, referencias
  de assets, escenas y flujos con Phaser simulado, save/checkpoints, colisiones,
  minijuegos y acciones siguen pasando.
- Sin cambios de claves de guardado. La preferencia de musica conserva
  first_layer_music; su storage bloqueado no altera G ni el checkpoint.

Estas suites NO comprueban reproduccion audible, decodificacion, renderer,
politicas reales de autoplay, foco de pestaña ni consola de Chrome/Edge.
La restriccion previa de file:// sigue vigente; no se intento eludirla.
Contratos consultados:
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play
- https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume

### Puerta manual de audio

Recargar publish-repo/index.html sin borrar la partida principal. Comprobar
audio v22 / i18n v22 en Chrome/Edge, 1366x768 y 1920x1080, con consola abierta:

1. Iniciar/continuar dia usando teclado y tambien click. Si el navegador
   deniega autoplay, una nueva interaccion debe permitir reintentar sin error.
2. Apagar musica, cambiar dia/noche y recargar: OFF se conserva. Encenderla
   reproduce la pista del turno actual; pulsaciones repetidas no la duplican.
3. Pasar dia -> noche y noche -> dia: no deben sonar ambas pistas juntas.
   Abrir/cerrar paneles y minijuegos, tomar cafe y caminar: control normal.
4. Cambiar ES/EN: el boton cambia Musica/Music sin alterar ON/OFF ni comenzar
   otra reproduccion. Comprobar tambien tooltip y foco de teclado.
5. Cambiar de pestaña y volver a interactuar: comprobar SFX y musica, sin
   errores nuevos de consola. No forzar ni eludir permisos del navegador.
6. Guardar/recargar dia y noche: mismo checkpoint de inicio de turno, ambas
   escenas y assets visibles, movimiento e interacciones sin regresiones.

Pendiente aprobacion de esta puerta antes del siguiente bloque de UI/balance.
No hubo push, tag, release ni recorrido completo certificado de la beta.

### Aprobacion del bloque de audio - 2026-09-12

Ante la pregunta por musica ON/OFF, paso de dia a noche y recarga del guardado,
Fernando respondio "Si, funciona sin problemas". Se aprueba esa prueba basica
y se respalda el bloque antes de continuar con textos de UI. La respuesta no
certifica cada caso de la puerta manual, resoluciones, navegadores ni seis
turnos completos. No se publica ni etiqueta como release.

## Bloque de textos UI - 2026-09-12

Respaldo previo: `51ce5a8` (audio aprobado). Produccion limitada a index.html
y js/i18n.js, cache v23. Se preservan orden de scripts, clases CSS, handlers
onclick y rutas. No hay cambios en escenas, acciones, timers ni listeners.

Problema comprobado: applyLang no alcanzaba textos fijos del HTML. Con EN
seleccionado quedaban TIENDA, Continuar del inventario/historia, CIERRE DE
TURNO, ENERGIA y TURBO ACTIVO en español. Se agregan IDs a los nodos y se
actualizan desde applyLang, reutilizando shopTitle y continue. El simbolo
de cerrar tienda conserva su accion y ahora tiene aria-label/title ES/EN.

Se descarto una sospecha inicial sobre keyMate/keyRepair: aunque los nombres
internos son viejos, sus valores ya indican I inventario / O tienda y sus
traducciones correctas. No se renombraron ni cambiaron esos atajos. Tampoco
se modificaron los campos Maker/Taller: ya actualizan G al escribir.

Verificacion:
- `node qa/beta-regression.cjs`: 81/81, cuatro casos adicionales de textos
  bidireccionales, etiqueta de cierre, I/O/Escape y persistencia del idioma
  sin cambiar el checkpoint diurno/nocturno, dinero, pedidos o stock.
- `node qa/audio-regression.cjs`: 12/12; BGM y SFX sin cambios.
- Los 77 casos previos siguieron pasando durante el bloque. Se corrigieron
  dos supuestos de las pruebas nuevas, no de produccion: un panel visible
  puede usar display:block, y una noche valida necesita pedidos suficientes.
- La suite comprueba sintaxis, referencias locales de assets y arranque de
  Day/Night en dias 1-3 con Phaser simulado. No renderiza ni certifica consola
  del navegador, apertura file://, tamaño de texto, foco nativo o escucha.

Este bloque NO completa toda la localizacion. Quedan por revisar textos
dinamicos de eventos/ayudas de escenas, descripciones de mejoras/empleados
y la matriz visual de ES/EN. Se evita una reescritura general del catalogo.

### Puerta manual de textos UI

Recargar publish-repo/index.html (i18n v23) sin borrar el save. Chrome/Edge,
1366x768 y 1920x1080, con consola abierta:

1. En menu elegir EN y continuar. Revisar SHOP, ENERGY, TURBO ACTIVE al
   activarlo, CONTINUE en inventario y SHIFT CLOSED al cerrar el dia.
2. Abrir inventario con I, tienda con O, cerrar mediante boton y Escape.
   Ver que vuelve el control y que el cierre de tienda muestra Close al hover.
3. Volver a ES: los cinco textos y tooltip regresan a español. Revisar que
   no se recorten ni se superpongan a otros controles en ambas resoluciones.
4. Guardar/recargar dia y noche: conserva idioma y checkpoint de inicio de
   turno; comprobar escenas, movimiento, interacciones, assets y consola.

Pendiente aprobacion de este bloque antes de cambiar balance. No se hizo push,
tag ni release. Los dos recorridos reales completos consecutivos siguen
siendo requisito para beta-v0.1.0; las pruebas automatizadas no los sustituyen.

## Upgrade visual 01 - 2026-09-12

Pedido nuevo: posponer balance, mejorar UI y aprovechar spritesheets del
Escritorio. Se respalda primero el estado previo en `95268e2`. Alcance de
esta pasada: estilos, seleccion/carga de animaciones y sincronizacion visual
con la pausa existente. No cambia gameplay, economia, misiones, progreso,
posiciones, escalas, origins, profundidad ni colisiones del mundo.

### Inventario revisado

- Carpetas C:/Users/Fernando/Desktop/sprites nuevos y SPRITE BOQUILLA:
  objetos, termicas, cama y boquilla. No se escribio sobre los originales.
- Se revisaron tambien exports existentes en assets/printers y la copia
  previa tmp-new-sprites/a pasar del proyecto. No se agregaron PNG duplicados.
- Termica - Correcto y breaker-success: mismos 168x42 pixeles, diferencia
  de metadatos del archivo. La integracion existente se conserva.
- maquina3d-3.png del Escritorio y lvl1 existente: ambos 26x34, 38 pixeles
  diferentes. No se sustituyo silenciosamente la version actual.
- No se encontro CLI de Aseprite en PATH ni en ubicaciones habituales.
  No se inventaron exports de los .aseprite que faltan como PNG.

| Modelo | Sprites disponibles usados | Animacion de trabajo |
| --- | --- | --- |
| P1 inicial, maquina3d-3 | maquina3d_lvl1 y lvl1_working | 6 frames, 8 fps |
| P2, maquina3d-2 | variants/printer_variant_2 y variant_2_broken | 8 frames, 10 fps |
| Cerrada, futura P3/P4 | maquina3d, BROKENMACHINE, MACHINEFILAMENT | frames 1-7, 10 fps |

El tercer modelo no se desbloquea antes ni se agrega a la beta por este cambio.
Cada spritesheet usa celdas 26x34. Se validan indices contra Texture.has;
las secuencias se registran una sola vez y solo con la textura disponible.
Las variantes tienen offset de inicio y cadencia visual distintos sin usar
Math.random ni cambiar la simulacion. Se conserva el benchy existente:
todavia no hay una coleccion de piezas impresas distinta por tipo de pedido.

### Animaciones y correcciones

- P1 ya no se transforma en una impresora cerrada al romperse o quedarse
  sin filamento. Donde falta arte de falla especifico conserva su modelo
  y usa tinte rojo/ambar. P2 tiene su propia tira de falla de ocho frames.
- Falta exportar como PNG los .aseprite de falla/filamento de P1 y filamento
  de P2 para animar esos estados completamente; no se afirma que ya esten.
- Una impresora rota tiene prioridad visual sobre busy. Una impresora
  pausada conserva el frame actual y reanuda sin reiniciar cada update.
- Al abrir overlays se sincroniza solo el sprite antes del return de
  Day/Night.update; no avanzan timers, energia, jobs ni input. Pausar la
  escena desde el menu sigue siendo responsabilidad del flujo existente.
- Se corrige el loader que podia crear animaciones incompletas si solo
  habia llegado la textura base. Errores de carga liberan callbacks y
  permiten reintento sin volver a crear animaciones existentes.
- Caminar -> idle -> caminar reinicia la secuencia si estaba detenida.
  Se usa resume antes de stop cuando estaba pausada: Phaser conserva
  isPaused despues de stop; el host de pruebas refleja ese contrato.

Contrato consultado: fuente oficial de Phaser 3.60 AnimationState.js,
metodos play, pause, resume, stop, propiedad isPaused y timeScale:
https://github.com/phaserjs/phaser/blob/v3.60.0/src/animations/AnimationState.js

### UI

- Paleta de paneles gris verdosa con texto claro, verde para exito,
  cian para informacion, ambar para foco/acciones y rojo para errores.
  Conserva fuente pixel, marcos y sprites originales.
- HUD y tareas con mayor contraste; contador de energia en dos lineas
  para no comprimir etiqueta, cantidad y porcentaje en 130px.
- Se retiran vignette y scanlines decorativas sobre la escena.
- Menus, dialogos, inventario y tienda tienen limites verticales y scroll.
  Tienda adapta columnas; textos largos y acciones tienen espacio para wrap.
- Filas de tareas y estadisticas mas simples, foco visible, entradas breves
  por opacidad y preferencias de movimiento reducido para efectos decorativos.
  No se desactivan spritesheets de minijuegos al reducir movimiento.
- ProPanel permite scroll y recibe pointer events dentro del propio panel;
  no se modifican colliders ni posiciones de las estaciones.

Caches: styles v20, draw v31, Day v34, Night v39. Audio v22, i18n v23,
UI v23 y orden de scripts sin cambios.

### Verificacion y pendientes

- node qa/beta-regression.cjs: 82/82; incluye el nuevo caso de pausa visual
  integrada en ambas escenas sin avance de simulacion.
- node qa/sprite-regression.cjs: 9/9; valida PNG reales, frames, cargas
  desordenadas/fallidas, identidad de modelos, pausa, geometria y caminata.
- node qa/audio-regression.cjs: 12/12; audio sin cambios.
- Las pruebas NO ejecutan renderer, layout CSS ni consola real. No se
  encontro un parser CSS instalado; no se certifica CSS por un mock DOM.
- La restriccion previa de file:// no se eludio con otro navegador/servidor.
  No se obtuvieron screenshots ni se certifica aspecto por resolucion.

Puerta manual antes de otra pasada visual:
1. Recargar index y abrir dia/noche en Chrome/Edge a 1366x768 y 1920x1080.
   Confirmar las capas, el personaje, HUD y ausencia de errores nuevos.
2. P1: cargar trabajo, abrir/cerrar inventario, provocar/reparar una falla
   y probar corte de luz. Debe conservar modelo, posicion y control.
3. Cuando el flujo desbloquee P2, comprobar su modelo y tira de trabajo;
   sin otra impresora superpuesta y con el avance normal del pedido.
4. Caminar, parar, volver a caminar y tomar cafe: debe animar y recuperar
   control. Guardar/recargar conserva el checkpoint de inicio del turno.
5. ES/EN, tienda, inventario, menu, cierre y minijuegos: revisar overflow,
   botones alcanzables, foco, scroll y ausencia de clicks sobre el mundo.
6. Revisar tambien una ventana estrecha/corta; reduced motion no debe
   ocultar resultados ni impedir termicas/cama/boquilla.

Despues de aprobar: exportar los estados Aseprite faltantes, ampliar piezas
por pedido con arte real, y revisar feedback de seleccion/completado. No
acumular mas retoques de escena antes de validar esta pasada. Balance y
los dos recorridos finales permanecen pospuestos por pedido de Fernando.
