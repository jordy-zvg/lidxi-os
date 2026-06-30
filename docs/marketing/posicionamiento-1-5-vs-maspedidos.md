# Posicionamiento: el 1.5% de Kobi como valor — vs. Maspedidos "sin comisiones"

**Estado:** insumos para revisión de Jordy. Nada de esto se porta a home, deck ni sales material hasta resolver los bloqueadores y aprobar el copy. (STOP POINT del brief respetado: no se implementó nada.)
**Fecha:** 2026-06-09 · **Proceso:** research web con fuentes → 6 drafts → 12 verificadores adversariales (matemáticas + riesgo legal de claims) → ronda de corrección → verificación global cruzada.

---

## Resumen ejecutivo — lo que cambió respecto al brief original

### 1. La premisa central del brief era incorrecta — y el home ya lo publica

El brief pedía posicionar el 1.5% como "precio justo que **incluye** procesamiento de pago". El home v4 en producción dice lo contrario, textual (`page.tsx:694-696`): *"El procesamiento de pago con tarjeta lo cobra tu proveedor de pagos por separado."*

Consecuencia: **toda comparativa tipo "Kobi más barato con todo contado" es indefendible** — al sumar la pasarela (~2.95–3.6% + IVA) al lado Kobi, el "ahorro" no solo se borra: se invierte. Los 6 entregables se reescribieron sobre el argumento que sí se sostiene: **ambos lados pagan procesamiento si cobran con tarjeta; el 1.5% compra la operación integrada** (multicanal en una pantalla, despacho Uber Direct, canal directo sin cupos, y cobro en línea amarrado al pedido cuando shippee).

### 2. Maspedidos, verificado con fuentes (sitio consultado 2026-06-09)

- **Empresa real** (Mérida, Yucatán; maspedidos.com — no confundir con maspedidos.co, Colombia). Su claim real es **"sin comisiones"**, no "gratis": cobra suscripción $299/$599/$899 con **cupos de 100/300/600 pedidos online al mes** y $1.39 por pedido adicional (documentado en Prime).
- **No procesa pagos** — su FAQ verbatim: *"nosotros no intermediamos tu dinero"*. El comensal paga en efectivo contraentrega, transferencia (el menú muestra la CLABE del negocio) o terminal física del negocio. Los 4 claims del brief sobre Maspedidos quedaron **confirmados con fuente** (ver Anexo C).
- **Pero es un POS completo** — mostrador, comandero, KDS, corte de caja con arqueo automático, reportes, multi-sucursal. Denigrarlo como "menú aislado" era indefendible y legalmente riesgoso; el copy lo trata con respeto y gana por contexto.

### 3. El número incómodo que el copy dice de frente

Al volumen del modelo Miztli (4,500 pedidos directos/mes), Maspedidos cuesta **~$6,320/mes** y Kobi **$12,212–$13,012/mes** (comisión + plan, sin IVA): **Kobi cuesta cerca del doble en software + comisión**. Maquillarlo era insostenible; los entregables lo reconocen explícitamente y venden qué compra la diferencia de ~$6,000–7,000/mes. También dicen cuándo Maspedidos conviene más (canal directo único + efectivo/transferencia + bajo volumen) — esa honestidad es el asset.

### 4. Bloqueadores de publicación detectados (internos a Kobi)

| # | Bloqueador | Detalle |
|---|---|---|
| 1 | **[RECONCILIAR PRICING]** | Tres fuentes en conflicto: home v4 ($399/$699/$1,199 + 1.5%) vs `apps/oms/lib/constants/plans.ts` ($799/$1,499/$2,999 por sucursal) vs `/precios`. El copy usa los del home v4. |
| 2 | **`/precios` y `/nosotros` contradicen el 1.5%** | `/precios` aún publica "¿Cobran comisión por transacción? No." y `/nosotros` "sin comisiones por transacción". Autocontradicción documentable por competidores o PROFECO si se publica una comparativa. |
| 3 | **[VALIDAR CON PRODUCTO]** | Cobro en línea (Mercado Pago) diferido, no en producción (Sprint 17). Nada de "pago al ordenar", "conciliación automática" ni "antifraude" en indicativo hasta que shippee. |
| 4 | **[AÑADIR FUENTE PÚBLICA]** | El "25–30% de los marketplaces" ya vive en el FAQ del home, pero necesita tarifario público citable antes de usarse en material comparativo externo. |
| 5 | **Validación Miztli** | Todos los volúmenes/tiempos son supuestos de trabajo; toda cita es [CITA PROPUESTA]. Conseguir datos y aprobación reales antes de usar su nombre externamente. |

### Modelo canónico (única fuente de verdad numérica de todo el documento)

| Variable | Valor | Estatus |
|---|---|---|
| Pedidos directos | 150/día × 30 = 4,500/mes | Supuesto a validar con Miztli |
| Ticket promedio | $175 MXN | Supuesto a validar |
| Venta directa mensual | $787,500 MXN | = 150 × 175 × 30 |
| Comisión Kobi 1.5% | $11,813/mes | = 787,500 × 0.015 |
| Otros canales | Uber Eats 40/día + Rappi 30/día → 220 órdenes/día totales | Supuesto a validar |
| Maspedidos al mismo volumen | $6,320/mes | Prime $899 + (4,500−600) × $1.39 = $5,421 (fuente: maspedidos.com/precios) |
| Tiempo de cobranza manual | 60 h/mes (2 h/día) | Supuesto a validar; se reporta aparte, nunca en totales |
| Valor hora | $60 cajero cargado · ~$105 encargado · $150 solo como costo de oportunidad del dueño | Indeed CDMX + carga social estimada |
| Terminal física (crédito) | 2.15–2.55% bancos · 3.39–3.60% agregadores · débito desde 1.65% · +IVA | Banxico abr-2026 |
| Pasarela online | MP 2.95–3.49% + $4 · Stripe 3.6% + $3 · Conekta 3.4% + $3 · +IVA | Tarifarios públicos |

Nota del brief original: contenía tres juegos de números incompatibles entre sí (150 vs 100 directos/día; "150 × $200 × 30 = $787,500" que en realidad da $900,000; 2h vs 3h). Se canonicalizó al juego de arriba.

**Cómo leer los marcadores:** [VALIDAR CON PRODUCTO] = capacidad no shipeada; [RECONCILIAR PRICING] = bloqueador #1; [AÑADIR FUENTE PÚBLICA] = falta cita externa; [CITA PROPUESTA] / [SUPUESTO A VALIDAR] = pendiente de Miztli. Ningún marcador puede llegar a material publicado.

---

## Entregable 1 — "Sin comisiones" es cierto: lo que cuesta cobrar por tu cuenta

Maspedidos promete pedidos por WhatsApp "sin comisiones"¹ — y es cierto: no te cobra porcentaje sobre tus ventas. Su propio FAQ lo explica de frente: *"nosotros no intermediamos tu dinero"*². Y exactamente por eso, el costo y el trabajo de cobrar quedan de tu lado.

Digamos también lo justo: Maspedidos es un POS completo — mostrador, comandero, KDS, corte de caja con arqueo automático, reportes, multi-sucursal². No te vamos a contar otra cosa. La diferencia entre su modelo y el nuestro no está en quién tiene mejor caja: está en quién carga con la cobranza y en cómo operas cuando vendes por más de un canal.

### 1. Cobrar por tu cuenta cuesta — y son cargos de terceros, no de Maspedidos

Con su modelo tienes tres formas de cobrar un pedido a domicilio. Las tres funcionan, y las tres tienen un costo que le pagas a terceros (tu adquirente, tu pasarela o tu propia operación), no a Maspedidos:

- **Efectivo contraentrega.** Tu repartidor carga el dinero de tu venta por la calle y tu caja se vuelve manual. Como referencia acotada: en retail mexicano la merma promedia 1.59% de ventas y el robo hormiga llega hasta 2.5% en tiendas departamentales según ANTAD³ — son cifras de retail, no de restaurantes, y no encontramos estudio específico de dark kitchens. No sirven para calcular tu riesgo; sirven para recordar que el efectivo que viaja no sale gratis.
- **Transferencia SPEI.** Recibirla no cuesta, pero el menú le muestra tu CLABE al cliente² y alguien de tu equipo verifica cada comprobante a mano: sin pasarela no hay webhook ni conciliación con el POS. Automatizarlo con una pasarela también cuesta (Conekta: $12.50 + IVA por SPEI⁴).
- **Terminal propia.** Su FAQ la lista como "Terminal bancaria (si tus repartidores llevan la terminal física)"². El equipo va de $99–$549 en promo (Mercado Pago, Clip); los equipos pro y de banca cuestan $2,500–$4,499 de lista (los lectores básicos de lista arrancan en $499)⁵. La tasa en restaurantes, según Banxico⁶: tarjeta de crédito 2.15–2.55% en bancos y 3.39–3.60% en agregadores; en débito los bancos bajan hasta 1.65%. Tasas antes de IVA.

Y aquí va la parte que nos toca decir de nuestro lado: si cobras con tarjeta, esto también aplica con Kobi. El procesamiento de pago lo cobra tu proveedor de pagos por separado⁷ — en su modelo y en el nuestro. El 1.5% de Kobi no es el costo de la pasarela; es otra cosa, y más abajo te decimos cuál.

### 2. El tiempo también cuenta (y va aparte de los fees)

Verificar cobros uno por uno, conciliar transferencias contra el banco, atender las disputas de tu terminal y cuadrar reportes a mano. Maspedidos sí trae reportes de venta y corte de caja con arqueo² — pero como no procesa pagos, el cuadre contra lo que de verdad entró a tu cuenta lo haces tú.

¿Cuánto tiempo es? Trabajamos con un supuesto de 60 horas al mes (2 h/día) — **supuesto a validar con Miztli**. En dinero: unos $60/h si lo hace un cajero (con carga social), ~$105/h si lo hace tu encargado, y $150/h solo si lo mides como costo de oportunidad del dueño que concilia en vez de vender⁸. Este número va aparte, como estimación — no lo sumamos a ningún total de fees documentados.

### 3. El riesgo se queda de tu lado

Efectivo en la calle, comprobantes de transferencia que alguien de tu equipo valida a mano, y las disputas de tu terminal, que gestionas tú con tu adquirente. "No intermediamos tu dinero" también significa eso: el dinero es asunto tuyo de punta a punta.

Tampoco te vamos a vender humo del otro lado: el cobro en línea tiene sus propios contracargos y disputas, y no te vamos a prometer blindaje. La diferencia que sí podemos defender es operativa, no mágica: menos pasos manuales entre el pedido y tu caja.

### 4. Números honestos: el modelo Miztli\*

**Modelo ilustrativo con supuestos de trabajo, a validar con Miztli\*:** supongamos que una dark kitchen como Miztli Pardo (Roma Norte, CDMX) mueve 150 pedidos directos al día con ticket de $175 — **$787,500 al mes en tienda propia**, 4,500 pedidos — más 40 órdenes diarias de Uber Eats y 30 de Rappi: 220 al día en total.

**Software, lado a lado (montos sin IVA):**

- **Maspedidos:** Prime $899 + pedidos sobre el cupo (4,500 − 600 = 3,900 × $1.39 = $5,421) = **$6,320/mes** a ese volumen⁹.
- **Kobi:** 1.5% de $787,500 = $11,813 + plan ($399–$1,199¹⁰ [RECONCILIAR PRICING]) = **$12,212–$13,012/mes**.

Sí, leíste bien: a este volumen, en software más comisión, **Kobi te cuesta más — cerca del doble**. No te lo vamos a maquillar. Y el procesamiento del cobro con tarjeta va aparte con tu proveedor de pagos en los dos escenarios⁷, así que tampoco lo sumamos de ningún lado.

La pregunta correcta no es "¿quién cobra menos?" — es **qué compra esa diferencia de alrededor de $6,000–$7,000 al mes**.

> "La comisión no era lo que me quitaba el sueño; era la talacha de cobrar: confirmar cada transferencia y cuadrar la terminal antes de dormir." [CITA PROPUESTA — validar con Miztli]

### 5. Qué compra el 1.5%

- **Tu operación multicanal en una sola pantalla:** Uber Eats, Rappi, Didi, tu tienda propia y mostrador, con tipos de pedido, KDS y caja con arqueo. Las apps de entrega cobran 25–30% de comisión [AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX]; tu canal directo con Kobi paga 1.5%.
- **Despacho con Uber Direct, sin flota propia:** el reparto se pide desde el pedido, no por otro chat. Maspedidos no anuncia integración con Uber Eats, Rappi o Didi ni incluye repartidores — su FAQ indica que el restaurante mantiene el control total de su logística y personal de entrega² (sitio público, consultado junio 2026).
- **Sin cupos en tu canal directo:** vendes 4,500 o 6,000 pedidos al mes y la comisión es la misma proporción, sin contadores de pedidos.
- **Cobro en línea integrado al pedido:** el cliente paga al ordenar y el pedido cae confirmado a tu pantalla [VALIDAR CON PRODUCTO: integración Mercado Pago diferida, aún no en producción]. Su sitio público no documenta una opción de cobro en línea (consultado junio 2026): cobrar en línea pasaría por una pasarela externa que su sitio no anuncia como integrada (Mercado Pago 2.95–3.49% + $4, Stripe 3.6% + $3, Conekta 3.4% + $3, antes de IVA)¹¹.

### Lado a lado

| Concepto | Maspedidos ("sin comisiones") | Kobi (1.5% tienda propia) |
|---|---|---|
| Suscripción | Básico $299 / Pro $599 / Prime $899 al mes⁹ | Plan $399–$1,199 al mes¹⁰ [RECONCILIAR PRICING] |
| Comisión sobre ventas | Sin porcentaje; cupos de 100/300/600 pedidos online al mes según plan y $1.39 por pedido adicional (documentado en Prime)⁹ | 1.5% solo en ventas de tu tienda propia; mostrador y marketplaces no pagan comisión a Kobi |
| Procesamiento de pago | Por tu cuenta, con terceros (terminal, pasarela, efectivo o SPEI): no procesan pagos — *"nosotros no intermediamos tu dinero"*² | También por separado: lo cobra tu proveedor de pagos⁷. Cobro en línea integrado al pedido [VALIDAR CON PRODUCTO: Mercado Pago diferido] |
| Canales | Menú digital propio y mostrador; no anuncian integración con Uber Eats, Rappi o Didi² (sitio público, junio 2026) | Uber Eats + Rappi + Didi + tienda propia + mostrador en una sola pantalla |
| Reparto | Con tu propia logística (su FAQ: el sistema no incluye repartidores)² | Despacho con Uber Direct, sin flota propia |
| POS, caja y reportes | POS completo: mostrador, comandero, KDS, corte de caja con arqueo, reportes, multi-sucursal² | POS con tipos de pedido, KDS y caja con arqueo |
| Software a escala del modelo Miztli\* | **$6,320/mes**⁹ | **$12,212–$13,012/mes**¹⁰ — más caro; la sección 5 dice qué compra la diferencia |
| Tiempo de cobranza | + tiempo de cobranza estimado (supuesto: 60 h/mes, a validar)⁸ | El pedido del canal directo llega a tu pantalla y a tu caja con arqueo; cobro y conciliación del pago en línea [VALIDAR CON PRODUCTO] |

### ¿Y si Maspedidos te conviene más?

Puede pasar, y prefe­rimos decírtelo nosotros: si vendes solo por tu canal directo, cobras en efectivo o transferencia y tu operación manual te funciona, **Maspedidos puede salirte más barato**. Su POS es serio y su "sin comisiones" es real.

Kobi gana terreno conforme tu operación se vuelve multicanal y el cobro digital te importa: cuando juntar Uber Eats, Rappi, Didi y tu tienda propia en una pantalla, despachar sin flota y dejar de operar la cobranza a mano vale más que la diferencia de precio. "Sin comisiones" no significa sin costos: significa que los costos se pagan en otra ventanilla — la de tu adquirente, tu pasarela y tus horas.

**¿El 1.5% de Kobi incluye el procesamiento del pago?** No. El procesamiento de pago con tarjeta lo cobra tu proveedor de pagos por separado⁷ — igual que una terminal. El 1.5% paga la operación integrada: tus canales en una pantalla, el despacho y tu canal directo sin cupos.

---

\* Modelo Miztli: volúmenes, ticket, mezcla de canales y horas son supuestos de trabajo, a validar con datos reales del piloto. **Nota sobre IVA:** los montos y tasas de este documento se expresan sin IVA, en los dos lados de la comparación; las tasas de Banxico y de pasarelas se cotizan antes de IVA. [VALIDAR: confirmar si los precios publicados de Maspedidos y los planes de Kobi son montos antes de IVA y homogeneizar antes de publicar.]

¹ Title de la landing de Maspedidos: "Sistema de Pedidos por WhatsApp sin Comisiones" — maspedidos.com/gestion-pedidos/pedidos-por-whatsapp (consultado 2026-06-09) · ² Sitio público de Maspedidos, consultado 2026-06-09: FAQ en maspedidos.com/menu-digital (*"nosotros no intermediamos tu dinero"*, *"Maspedidos no intermedia en las transacciones"*), maspedidos.com/software-para-restaurantes, maspedidos.com/funcionalidades/corte-de-caja, maspedidos.com/funcionalidades/estadisticas-y-reportes y demo maspedidos.menu/ejemplo · ³ ANTAD vía blog.storecheck.com.mx y Milenio — cifras de retail/autoservicio, no de restaurantes · ⁴ conekta.com/pricing · ⁵ shop.clip.mx y mercadopago.com.mx/herramientas-para-vender/lectores-point · ⁶ Banxico, tasas de descuento por giro (restaurantes), abril 2026; tasas antes de IVA · ⁷ Home publicado de Kobi: "El procesamiento de pago con tarjeta lo cobra tu proveedor de pagos por separado." · ⁸ Indeed CDMX: cajero ≈ $47/h (+ ~30% carga social ≈ $60/h); encargado ≈ $82/h (≈ $105/h cargado); $150/h solo como costo de oportunidad del dueño; 60 h/mes es supuesto a validar con Miztli · ⁹ maspedidos.com/precios, consultado 2026-06-09: Básico $299 (100 pedidos online/mes), Pro $599 (300), Prime $899 (600 + $1.39 por pedido adicional) · ¹⁰ Planes del home v4 de Kobi ($399/$699/$1,199). [RECONCILIAR PRICING: difieren de apps/oms/lib/constants/plans.ts — $799/$1,499/$2,999 por sucursal] · ¹¹ Sitios oficiales: Mercado Pago 2.95–3.49% + $4 según plazo de liberación, Stripe 3.6% + $3, Conekta 3.4% + $3; antes de IVA.

---

**Bloqueadores antes de publicar (interno — no va en la pieza final):**
1. [RECONCILIAR PRICING] Pricing de Kobi en conflicto: home v4 publica $399/$699/$1,199 y apps/oms/lib/constants/plans.ts define $799/$1,499/$2,999 por sucursal. Este copy usa los del home v4; resolver antes de publicar.
2. /precios (líneas 37-39) aún publica "¿Cobran comisión por transacción? No." y /nosotros dice "sin comisiones por transacción" — contradicen el modelo 1.5%. Actualizar ambas páginas antes de publicar cualquier comparativa.
3. [VALIDAR CON PRODUCTO] Cobro en línea con Mercado Pago: diferido, no en producción. Mientras no shipee, mantener el marcador en cada mención.
4. [AÑADIR FUENTE PÚBLICA] "25–30% de los marketplaces": citar tarifarios públicos de Uber Eats/Rappi MX antes de usarlo en material comparativo externo.
5. Validar con Miztli: volúmenes, ticket, horas de cobranza y la cita propuesta.

---

## Entregable 2 — Tres narrativas de reposicionamiento (Kobi vs Maspedidos)

> **Antes de leer:** los números operativos de Miztli Pardo (dark kitchen piloto, Roma Norte, CDMX) son **supuestos de trabajo a validar con sus datos reales**; el marcador acompaña al primer número de cada narrativa. Todo claim sobre Maspedidos sale de fuentes públicas citadas al pie (sitio consultado junio 2026); las citas del competidor son verbatim. **Nota de IVA:** los montos mensuales de ambos lados se expresan sin IVA; las tasas de adquirentes y pasarelas se expresan +IVA tal como las publican sus fuentes, y aplican igual a quien cobre con tarjeta — use Kobi o use Maspedidos. Los planes de Kobi citados ($399/$699/$1,199) son los del home v4 [RECONCILIAR PRICING].

---

### Narrativa 1 — El costo que cambia de lugar
#### *«Sin comisiones» es cierto — y exactamente por eso el costo y el trabajo de cobrar quedan de tu lado*

Maspedidos no te cobra un porcentaje por venta. Es cierto — con sus matices documentados: su menú digital tiene cupos de pedidos por plan (100, 300 o 600 al mes) y un cargo de $1.39 por pedido adicional en su plan Prime — y también es cierto que el cobro lo resuelves tú. Ellos lo dicen de frente: "nosotros no intermediamos tu dinero". No es un cobro oculto; es su modelo, dicho con claridad. Lo que sigue es tu costo de cobranza, y son cargos de terceros — del adquirente o la pasarela, no de Maspedidos: efectivo contra entrega es tu repartidor cargando billetes y un arqueo que depende de él; transferencia, si la activas, son tus datos bancarios — CLABE incluida — a la vista del comensal (así aparece en su menú demo) y alguien de tu equipo verificando comprobantes a mano; terminal física es una tasa que va desde 1.65% en débito con bancos hasta 3.60% en crédito con agregadores, más IVA.

¿Y Kobi? Hablemos igual de claro: el 1.5% de tu tienda propia tampoco incluye el procesamiento de pago — tu proveedor de pagos lo cobra por separado, aquí y en cualquier sistema. Si cobras con tarjeta, pagar por cobrar es parte del negocio en los dos lados de esta comparación. La diferencia que sí defendemos es dónde vive el cobro: dentro del pedido, no fuera de él — tu cliente paga al ordenar y el pedido cae confirmado, sin que nadie persiga comprobantes [VALIDAR CON PRODUCTO: integración Mercado Pago diferida, aún no en producción]. El costo de cobrar no desaparece con nadie; el trabajo de cobrar es el que sí se puede quitar de tu cocina.

**Fuentes y supuestos:** "El trato es directo entre tú y tu cliente… nosotros no intermediamos tu dinero": FAQ oficial de Maspedidos (maspedidos.com/menu-digital). Cupos 100/300/600 pedidos/mes y $1.39 por pedido adicional en Prime: maspedidos.com/precios (consultado 2026-06-09). Datos bancarios mostrados al comensal en transferencia (método opcional que configura el negocio): menú demo (maspedidos.menu/ejemplo). Tasas de terminal física, giro restaurantes (Banxico, abril 2026, +IVA): débito bancario desde 1.65% (BBVA); crédito 2.15–2.55% bancos y 3.39–3.60% agregadores (banxico.org.mx, tasas de descuento crédito/débito por giro). Pasarela online — costo que aplica también del lado Kobi (+IVA): Mercado Pago 2.95–3.49% + $4 según plazo de liberación (mercadopago.com.mx/herramientas-para-vender/link-de-pago), Stripe 3.6% + $3 (stripe.com/mx/pricing), Conekta 3.4% + $3 (conekta.com/pricing). "El procesamiento de pago con tarjeta lo cobra tu proveedor de pagos por separado": home publicado de Kobi (apps/oms/app/(marketing)/page.tsx).

---

### Narrativa 2 — Cuentas claras, aunque no nos favorezcan
#### *A este volumen Kobi cuesta más en pesos — la pregunta es qué compra la diferencia*

En el modelo de trabajo de Miztli Pardo — supuestos a validar con sus datos reales — la venta directa es de 150 pedidos al día con ticket de $175: $787,500 al mes, 4,500 pedidos. A ese volumen, Maspedidos también cuesta: plan Prime $899 más 3,900 pedidos sobre el cupo × $1.39 = $5,421, unos $6,320 al mes de software. Kobi: 1.5% sobre la venta directa = $11,813, más tu plan mensual ($399–$1,199 según el plan [RECONCILIAR PRICING]): entre $12,212 y $13,012 al mes. Sí, lo decimos nosotros: en pesos de software más comisión, Kobi cuesta aproximadamente el doble a este volumen (montos sin IVA; tratamiento fiscal de cada proveedor por verificar).

La pregunta honesta es qué compra esa diferencia de ~$6,000–$7,000 al mes: cobro en línea dentro del pedido — pagado al ordenar, confirmado al caer [VALIDAR CON PRODUCTO: integración Mercado Pago diferida, aún no en producción] —, los pedidos de Uber Eats, Rappi, Didi Food, tu tienda propia y el mostrador en una sola pantalla, despacho con Uber Direct sin flota propia, y un canal directo sin cupos de pedidos. Aparte — y sin sumarlo al total, porque es un estimado — está el tiempo de cobranza: en una dark kitchen del tamaño de Miztli Pardo nuestro supuesto de trabajo es de unas 2 horas al día, 60 al mes, verificando comprobantes y cuadrando cortes [SUPUESTO A VALIDAR con Miztli]. Esas horas valen entre $3,600 al mes si las pone tu cajero (~$60/h con carga social) y $9,000 si las pones tú ($150/h, contado como costo de oportunidad del dueño, no como nómina). Y la honestidad completa: si vendes solo por tu canal directo, cobras en efectivo o transferencia y la operación manual no te pesa, Maspedidos puede salirte más barato. Kobi gana terreno conforme tu operación se vuelve multicanal y el cobro digital te importa.

**Fuentes y supuestos:** venta directa (150 pedidos/día, ticket $175), canales (+40 Uber Eats, +30 Rappi/día) y 60 h/mes de cobranza: supuestos de trabajo del modelo canónico, a validar con Miztli. Prime $899 y $1.39/pedido extra: maspedidos.com/precios (consultado 2026-06-09). $60/h: cajero CDMX $8,985/mes (Indeed) + ~30% de carga social estimada; encargado CDMX $15,811/mes (Indeed) ≈ $105/h cargado, como referencia intermedia; $150/h solo defendible como **costo de oportunidad** del dueño, así etiquetado (digest de fees, sección 5). Planes Kobi $399/$699/$1,199: home v4 (apps/oms/app/(marketing)/page.tsx); en conflicto con apps/oms/lib/constants/plans.ts ($799/$1,499/$2,999 por sucursal) [RECONCILIAR PRICING].

---

### Narrativa 3 — Toda tu operación junta, no canales sueltos
#### *Tu operación no cabe en un solo canal*

Digámoslo sin caricaturas: Maspedidos es un punto de venta completo — mostrador, mesas y comandero, pantalla de cocina, corte de caja con arqueo automático, reportes, multi-sucursal. Esa parte de la cancha está cubierta en los dos lados de esta comparación. La diferencia está en los canales y en el cobro: su sitio público no anuncia integración con Uber Eats, Rappi ni Didi Food, ni incluye repartidores — su FAQ responde "¿El sistema incluye repartidores propios? No… El restaurante mantiene el control total de su logística y personal de entrega" — y sobre el dinero es explícito: "Maspedidos no intermedia en las transacciones". En una dark kitchen del tamaño de Miztli Pardo, nuestro supuesto de trabajo es de 220 órdenes al día — 150 directas, 40 de Uber Eats y 30 de Rappi, a validar con sus datos reales — y cuando cada canal vive en su propia pantalla, la cocina se arriesga a pagar el desorden — comandas que se cruzan, tiempos que no embonan, cortes que tardan (hipótesis a validar con su operación real). Kobi orquesta los canales: los pedidos de las apps, tu tienda propia y el mostrador caen en una sola pantalla, el despacho de tu canal directo sale por Uber Direct sin flota propia, tu tienda propia no tiene cupos de pedidos, y las apps — que cobran su propia comisión de 25–30% [AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX] — dejan de ser islas. El 1.5% sobre tu tienda propia — junto con tu plan mensual — es el precio de que tus canales trabajen juntos.

**Fuentes y supuestos:** POS completo de Maspedidos (mostrador, mesas, KDS, arqueo automático, reportes, multi-sucursal): maspedidos.com/software-para-restaurantes y maspedidos.com/funcionalidades/corte-de-caja. "No anuncian" integración con marketplaces ni repartidores: ausencia en el sitemap completo (maspedidos.com/page-sitemap.xml) y FAQ oficial, sitio consultado junio 2026 — se afirma la ausencia de anuncio público, no la inexistencia de la capacidad. Citas verbatim: FAQ de maspedidos.com/menu-digital y maspedidos.com/gestion-pedidos/pedidos-por-whatsapp. Órdenes de Miztli (220/día: 150 directas + 40 Uber Eats + 30 Rappi): [SUPUESTO A VALIDAR con Miztli]. La comisión Kobi de 1.5% aplica solo a ventas de tu tienda propia; mostrador y apps no pagan comisión a Kobi; aplica además la suscripción mensual ($399/$699/$1,199 MXN, home v4) [RECONCILIAR PRICING].

---

### Bloqueadores antes de publicar (no se resuelven en este copy)

1. **[RECONCILIAR PRICING]** — Home v4 publica $399/$699/$1,199; apps/oms/lib/constants/plans.ts define $799/$1,499/$2,999 por sucursal. Este copy usa los del home v4; definir el canónico antes de publicar.
2. **Contradicción en el sitio de Kobi** — /precios aún publica "¿Cobran comisión por transacción? No." y /nosotros dice "sin comisiones por transacción"; ambos contradicen el modelo 1.5%. Actualizar antes de publicar cualquier comparativa.
3. **[AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX]** — el 25–30% de comisión de marketplaces requiere fuente pública antes de uso en material comparativo externo.
4. **[VALIDAR CON PRODUCTO]** — el cobro en línea (Mercado Pago) está diferido y no en producción; ninguna pieza puede afirmarlo en indicativo hasta que se libere.
5. **[SUPUESTOS MIZTLI]** — volumen, ticket y horas de cobranza son supuestos de trabajo; validar con datos reales de Miztli Pardo antes de usar su nombre en material externo.

---

## Entregable 3 — Case study Miztli (~500 palabras)

### Miztli + Kobi: lo que el 1.5% compra (y lo que no)

*La descripción operativa, los volúmenes, tiempos y costos de este caso son supuestos de trabajo del modelo Kobi–Miztli, a validar con la operación real. Todos los montos están en MXN y sin IVA.*

### El punto de partida

Miztli Pardo es una dark kitchen en Roma Norte, CDMX. Sin mesas, sin sala: lo que vende sale por reparto. Su día tipo, según el modelo de trabajo [SUPUESTOS A VALIDAR con Miztli]: 150 pedidos directos por tienda propia, 40 por Uber Eats y 30 por Rappi — 220 órdenes al día.

La hipótesis a validar con ellos: con cada canal en su propio sistema, la caja cuadrándose a mano y las transferencias verificándose comprobante por comprobante, los pedidos se arriesgan a perderse entre captura y captura, y cobrar y conciliar puede comerse unas 2 horas al día — ~60 horas al mes [SUPUESTO A VALIDAR].

### Lo que cambia con Kobi

Con Kobi, Miztli opera sus pedidos en una sola pantalla: tienda propia, Uber Eats, Rappi y mostrador. El despacho corre por Uber Direct sin flota propia, el canal directo no tiene cupos de pedidos, y la caja con arqueo compara lo esperado contra lo declarado y te avisa si algo no cuadra. Cuando el cobro en línea esté activo, tu cliente pagará al ordenar y el pedido caerá confirmado [VALIDAR CON PRODUCTO: integración Mercado Pago diferida, aún no en producción].

¿El costo? Tu plan ($399, $699 o $1,199/mes [RECONCILIAR PRICING]) más 1.5% sobre ventas de tienda propia. Y para que no haya sorpresas: el procesamiento de pago con tarjeta lo cobra tu proveedor de pagos por separado — con Kobi o sin Kobi, ese cargo de terceros existe en cualquier venta con tarjeta.¹

### Los números, sin maquillaje

- **Venta directa mensual:** 150 pedidos × $175 × 30 días = **$787,500** (4,500 pedidos) [SUPUESTOS A VALIDAR].
- **Kobi:** 1.5% ≈ $11,813 + plan = **$12,212–$13,012/mes** [RECONCILIAR PRICING].
- **Maspedidos al mismo volumen:** plan Prime $899 + 3,900 pedidos extra × $1.39 = **$6,320/mes**.²

Sí: en software más comisión, Kobi cuesta más — cerca del doble a este volumen. La pregunta honesta es qué compra esa diferencia de ~$6,000–7,000 al mes: marketplaces, tienda propia y mostrador en una pantalla, despacho sin flota, sin cupos en tu canal directo, y el cobro en línea integrado cuando esté en producción [VALIDAR CON PRODUCTO]. Aparte va el tiempo de cobranza estimado: ~60 h/mes [SUPUESTO A VALIDAR], que valen ~$3,600 con un cajero (~$60/h con carga social), ~$6,300 con un encargado (~$105/h cargado), o más si esas horas son tuyas como dueño (~$150/h, etiquetado como costo de oportunidad).

Para dimensionar: los marketplaces cobran 25–30% por orden [AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX]; el canal directo con Kobi cuesta 1.5% más tu suscripción (y la pasarela de tu proveedor, como en cualquier cobro con tarjeta).

### ¿Y Maspedidos?

Es un POS completo — mostrador, mesas, KDS, corte de caja con arqueo — y su "sin comisiones" es cierto. Exactamente por eso todo el costo y el trabajo de cobrar queda de tu lado: su FAQ dice que "Maspedidos no intermedia en las transacciones"³ — cobras en efectivo, transferencia o terminal física, con tu costo de cobranza (cargos de terceros: adquirente o pasarela, no de Maspedidos) y la conciliación por tu cuenta. Tampoco anuncian integración con Uber Eats, Rappi o Didi (sitio público, consultado junio 2026). Si solo vendes canal directo, cobras en efectivo o transferencia y la operación manual no te pesa, Maspedidos puede salirte más barato. Kobi gana terreno conforme tu operación se vuelve multicanal y el cobro digital importa.

### En sus palabras

> "Antes el corte era calculadora y capturas de transferencias. Ahora cierro turno, reviso el arqueo y me regreso a la cocina." — [CITA PROPUESTA — validar con Miztli; si no se obtiene la cita real, eliminar esta sección completa]

El 1.5% más tu plan no es el camino más barato en pesos a este volumen. Es el precio de que tu canal directo opere integrado, te avise si algo no cuadra y crezca sin cupos ni flota propia.

---

¹ Mercado Pago (link de pago/checkout): 2.95% + $4 con liberación a 30 días, 3.19% + $4 a 7 días, 3.49% + $4 al instante; Stripe: 3.6% + $3. Ambas tarifas +IVA. Fuentes: mercadopago.com.mx/herramientas-para-vender/link-de-pago; stripe.com/mx/pricing.
² maspedidos.com/precios, consultado 2026-06-09: plan Prime $899/mes con 600 pedidos a domicilio/recoger incluidos y $1.39 por pedido adicional.
³ maspedidos.com/menu-digital, consultado 2026-06-09 (FAQ renderizado por JavaScript; archivar captura o snapshot fechado antes de publicar).

---

## Entregable 4 — Messaging matrix por audiencia

Cómo usar esta matriz: el **Mensaje central** va tal cual en deck, email o llamada — por eso carga su propia honestidad, sin depender de la letra de la Prueba. La **Prueba** es el respaldo: cítala con su fuente si te la cuestionan. Todos los números de Miztli Pardo son **supuestos de trabajo a validar** con datos reales del piloto, y van marcados junto al primer número donde aparecen.

Regla de oro de todo el documento: el 1.5% de Kobi **no incluye el procesamiento de pago** — el home publicado lo dice textual: "El procesamiento de pago con tarjeta lo cobra tu proveedor de pagos por separado". Ambos lados de cualquier comparación pagan procesamiento si cobran con tarjeta. El argumento de Kobi no es ahorrar fees: es la operación integrada que el 1.5% compra.

---

### 1. Founder / operador de dark kitchen

**Pain:** Las apps de delivery cobran 25–30% de comisión por pedido [AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX antes de usar en material externo]. Trabajas para el marketplace, no para tu cocina.

**Mensaje central:**

> Las apps te cobran 25–30% de comisión por pedido [AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX]. La comisión de tu tienda propia con Kobi es 1.5% — más tu suscripción y el procesamiento de pago de tu proveedor, que va por separado. Y ese 1.5% trae lo que las apps no incluyen: los pedidos de Uber Eats, Rappi, Didi, tu tienda propia y tu mostrador en una sola pantalla, caja con arqueo y pantalla de cocina (KDS).

> En mostrador y en las apps, Kobi no te cobra comisión. Solo 1.5% en lo que vendes por tu tienda propia, sin cargo a tu cliente — y el cobro con tarjeta lo liquida tu proveedor de pagos por separado, como en cualquier canal directo.

**Prueba:**
- Modelo Miztli (supuesto de trabajo, a validar con el piloto): 150 pedidos directos/día × ticket de $175 × 30 días = **$787,500 MXN/mes de venta directa**. Comisión Kobi al 1.5% = **~$11,813/mes**. La comisión de marketplace al 25–30% sobre esa misma venta sería **$196,875–$236,250/mes** [AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX].
- **Compara comisiones, no costos totales:** la comisión de las apps incluye entrega y procesamiento del pago; en tu canal directo el envío (p. ej. despacho Uber Direct) y la tasa de tu pasarela o adquirente se pagan aparte. No presentar la diferencia como "ahorro neto".
- Honestidad obligada en deck y email: el 1.5% nunca viaja solo. Se suma la suscripción de Kobi ($399/$699/$1,199 MXN/mes según el home v4 [RECONCILIAR PRICING])[^10] y tu costo de cobranza con terceros[^1][^5].
- [CITA PROPUESTA — validar con Miztli]: "Cada pedido que muevo de las apps a mi tienda propia me deja ~23–28 puntos más de margen bruto." (Rango antes de suscripción, envío y procesamiento; que Miztli fije la cifra con sus datos reales antes de usarla.)

---

### 2. Quien lleva las finanzas (contador / CFO)

**Pain:** Comprobantes de transferencia verificados a mano, efectivo que no cuadra y datos que viven en sistemas que no se hablan.

**Mensaje central:**

> Con Kobi, cada peso que entra a tu cocina queda documentado: pedido, pago y arqueo viven en un solo lugar. [VALIDAR CON PRODUCTO — la conciliación automática de pagos en línea depende de la integración de cobro (Mercado Pago), hoy diferida; no afirmar "conciliado en automático" ni "sin perseguir capturas de SPEI" con prospectos hasta que esté en producción.]

> Conciliar a mano no es gratis. Son horas al mes de alguien que podría estar vendiendo.

**Prueba:**
- Modelo Miztli (supuesto a validar con Miztli): **2 h/día de cobranza y conciliación manual = 60 h/mes**. Valor de esa hora, siempre como rango[^7]: cajero con carga social ~$60/h (~$3,600/mes); encargado cargado ~$105/h (~$6,300/mes); y solo como **costo de oportunidad del dueño**, así etiquetado, ~$150/h (hasta ~$9,000/mes). Este costo de tiempo va aparte, como "+ tiempo de cobranza estimado" — no se suma en un total junto a fees documentados.
- SPEI: recibir es gratis; el costo es operativo — verificar comprobantes (CEP de Banxico) a mano, sin webhook ni conciliación con el POS. Automatizarlo vía pasarela cuesta (Conekta: $12.50 + IVA por SPEI)[^9]. Etiquetar siempre como **tu costo de cobranza (cargos de terceros: adquirente/pasarela)**, no como cargo de ningún competidor.
- Efectivo: la merma promedia 1.59% y el robo hormiga llega a 2.5% de ventas en tiendas departamentales (ANTAD)[^8]. **Son cifras de retail, no de restaurantes**: usarlas solo como referencia de magnitud de otro sector, jamás para cuantificar el riesgo de Miztli.

---

### 3. Operador multi-sucursal

**Pain:** Abrir la segunda y tercera cocina multiplica el caos: más terminales, más cortes de caja sueltos, más hojas de cálculo para juntar los números.

**Mensaje central:**

> Abrir tu segunda cocina no debería duplicar tu caos. Tu comisión sigue siendo 1.5% en tienda propia sin importar cuántas cocinas tengas, y ves tus cocinas en un solo reporte consolidado [VALIDAR CON PRODUCTO: reporte consolidado multi-sucursal].

> La comisión no cambia por abrir sucursales; tu suscripción sí escala según plan [VALIDAR CON PRICING — cómo escala la suscripción de Kobi por sucursal adicional antes de afirmar nada sobre costo total].

**Prueba:**
- Cobrar con terminal física por sucursal cuesta dos veces, y son **cargos de terceros (adquirente), no de Maspedidos**: el equipo (Clip Pro 2 $399 en promo, lista $2,999; Mercado Pago Point $99–$549 en promo, listas $499–$4,499; Getnet GSmart $2,500 + IVA o renta de $250 + IVA/mes)[^6] y la tasa por transacción en **crédito**: bancos 2.15–2.55% + IVA, agregadores 3.39–3.60% + IVA; en débito bancario baja desde 1.65% + IVA (Banxico, abril 2026)[^1].
- Cobro online: **con o sin Kobi pagas tasa de pasarela** — Mercado Pago 2.95–3.49% + $4 (el 2.95% solo con liberación a 30 días; con liberación inmediata, 3.49%), Stripe 3.6% + $3, Conekta 3.4% + $3, todos + IVA; rango típico con liberación inmediata: 3.4–3.6%[^5]. La diferencia con Kobi no es la tasa: es que el pedido, el pago y el arqueo quedan en un solo sistema, sin comprar ni rentar una terminal por sucursal para el canal en línea [VALIDAR CON PRODUCTO — el cobro en línea integrado está diferido; mientras tanto, vender solo lo shipeado: pedidos multicanal en una pantalla y caja con arqueo (el reporte consolidado multi-sucursal también está por validar)].
- Dato competitivo: en Maspedidos la sucursal extra es gratis 4 meses y luego **$499 MXN/mes cada una** (maspedidos.com/precios, consultado 2026-06-09)[^2].
- Modelo Miztli (supuesto de trabajo, a validar): una sola cocina movería 220 órdenes/día entre tienda propia (150), Uber Eats (40) y Rappi (30). Multiplica eso por sucursales sin un reporte consolidado y el cierre de mes se vuelve arqueología.

---

### 4. Usuario actual de Maspedidos evaluando Kobi

**Pain:** El menú digital le quitó la comisión del marketplace en su canal directo — y cumple lo que promete. Pero el cobro, la conciliación y los pedidos de las apps siguen siendo trabajo suyo, en sistemas separados.

**Mensaje central:**

> "Sin comisiones" es cierto — y exactamente por eso todo el costo y el trabajo de cobrar queda de tu lado: transferencias que verificas a mano, efectivo que cuadras de noche, y tus pedidos de Uber, Rappi y tienda propia en pantallas separadas.

> Kobi sí cobra 1.5% en tu tienda propia — y a cambio el pedido y el arqueo viven en un solo sistema, con tus pedidos de Uber Eats, Rappi, Didi, tienda propia y mostrador en una sola pantalla. El cobro en línea integrado al pedido va en camino [VALIDAR CON PRODUCTO: integración Mercado Pago diferida]. El procesamiento del pago lo cobra tu proveedor por separado, igual que hoy.

**Prueba:**
- Maspedidos no procesa pagos. Su FAQ oficial, verbatim: "El trato es directo entre tú y tu cliente… nosotros no intermediamos tu dinero" y "Maspedidos no intermedia en las transacciones" (maspedidos.com/menu-digital)[^3]. Su menú demo muestra la CLABE y datos bancarios del negocio al comensal para transferencia manual (maspedidos.menu/ejemplo)[^3]. El costo de cobrar por tu cuenta son **cargos de terceros (adquirente/pasarela), no de Maspedidos**.
- **No anuncian** integración con Uber Eats, Rappi ni Didi Food en su sitio público (sitemap completo revisado, junio 2026)[^4], ni repartidores ni orquestación tipo Uber Direct: "¿El sistema incluye repartidores propios? No" (FAQ oficial)[^3]. Decir siempre "no anuncian" — nunca "no tienen".
- Cupos de pedidos online por plan: 100/300/600 al mes; en Prime, $1.39 por pedido adicional (maspedidos.com/precios, consultado 2026-06-09)[^2]. Con el volumen supuesto de Miztli (150 pedidos directos/día, supuesto de trabajo a validar), el cupo más alto (600) se cubre en los primeros 4 días del mes; el resto del mes los pedidos siguen entrando a $1.39 c/u — ≈3,900 pedidos extra ≈ **$5,421/mes adicionales** a ese volumen. Qué pasa en Básico/Pro tras el cupo: [VALIDAR — el fee extra solo está documentado en Prime].
- **Honestidad obligada con los números completos** (modelo Miztli, supuestos a validar; montos sin IVA): Maspedidos Prime a ese volumen ≈ **$6,320/mes** ($899 de plan + $5,421 de pedidos extra)[^2]. Kobi ≈ **$12,212–$13,012/mes** ($11,813 de comisión 1.5% + plan $399–$1,199 [RECONCILIAR PRICING])[^10]. En software + comisión, **Kobi cuesta alrededor del doble** a esta escala. La venta es qué compra esa diferencia de ~$6,000–7,000/mes: orquestación multicanal en una pantalla, despacho Uber Direct sin flota propia, sin cupos en el canal directo, y cobro en línea integrado al pedido [VALIDAR CON PRODUCTO — integración Mercado Pago diferida, aún no en producción]. Y decirlo de frente: si un negocio solo vende canal directo, cobra en efectivo o transferencia y tolera la operación manual, **Maspedidos puede salirle más barato**. Kobi gana conforme la operación es multicanal y el cobro digital importa.
- Maspedidos sí es un POS completo: mostrador, mesas/comandero, KDS, corte de caja con arqueo automático, reportes y multi-sucursal[^2][^3]. El argumento de Kobi no es que les falte POS — y el corte de caja con arqueo **no** es diferenciador (ellos también lo tienen). El contraste defendible: el cobro y los marketplaces siguen siendo problema tuyo.

---

### Notas de uso y disclaimers

- **Miztli Pardo** es cliente piloto real (dark kitchen, Roma Norte, CDMX). Todo dato operativo suyo es supuesto de trabajo a validar, marcado junto al primer número donde aparece. Ninguna afirmación en indicativo sobre su operación pasada; toda cita o guion va como [CITA PROPUESTA — validar con Miztli] / [GUION PROPUESTO — validar con Miztli] hasta que los apruebe.
- **Maspedidos** (maspedidos.com, Mérida, México — no confundir con maspedidos.co, empresa colombiana distinta). Su claim real es "sin comisiones". Todos los claims provienen de sus páginas públicas (precios, FAQ, demo, términos), consultadas el 2026-06-09; si algo cambia en su sitio, actualizar antes de publicar.
- **IVA simétrico:** todos los montos en MXN sin IVA salvo indicación; las tasas de adquirentes y pasarelas son +IVA según sus tarifarios públicos y aplican igual a ambos lados de la comparación. Nunca cargar el IVA solo del lado competidor.
- **El 1.5% de Kobi:** aplica solo a ventas de tienda propia, sin cargo al cliente; mostrador y apps no pagan comisión a Kobi. Nunca presentarlo como único costo: se suma la suscripción y el procesamiento de pago del proveedor del cliente. Respuesta canónica a "¿el 1.5% incluye la pasarela?": **no, va por separado** — así lo publica el home; cambiar esa respuesta exigiría cambiar primero el disclaimer del home y los términos.
- **Claims de producto:** afirmable solo lo shipeado (POS con tipos de pedido, KDS, marketplaces conectados, tienda propia 1.5%, despacho Uber Direct, caja con arqueo, pedidos en una pantalla). Cobro online Mercado Pago, "conciliación automática", "antifraude" o "pago validado antes de confirmar" siempre con [VALIDAR CON PRODUCTO]; nunca prometer blindaje anti-contracargos.
- **Tiempo de cobranza:** las 60 h/mes son supuesto a validar; el costo de tiempo se presenta aparte ("+ tiempo de cobranza estimado") y jamás dentro de un total en negritas junto a fees documentados.

### Bloqueadores de publicación (resolver antes de usar externamente)

1. [RECONCILIAR PRICING] — Home v4 publica $399/$699/$1,199; `apps/oms/lib/constants/plans.ts` define $799/$1,499/$2,999 por sucursal. Este copy usa los del home v4.
2. /precios aún publica "¿Cobran comisión por transacción? No." y /nosotros dice "sin comisiones por transacción" — contradicen el modelo 1.5%. Actualizar antes de publicar cualquier comparativa.
3. [AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX] — el rango 25–30% está publicado en el FAQ del home de Kobi pero necesita fuente pública verificable antes de usarse en material comparativo externo.

---

[^1]: Banxico, tasas de descuento por giro "Restaurantes", abril 2026. Crédito: banxico.org.mx/servicios/tasas-de-descuento-para-tarjetas-de-credito-por-gi/{178DFF29-DA8F-E376-78AC-9B52D36C799F}.pdf. Débito: banxico.org.mx/servicios/tasas-de-descuento-para-tarjetas-de-debito-por-gir/{D55B5289-0474-B33F-EA53-212B9EDAAE2D}.pdf. Débito bancario desde 1.65% (BBVA).
[^2]: maspedidos.com/precios, consultado 2026-06-09 (planes $299/$599/$899; cupos 100/300/600; $1.39 por pedido extra en Prime; sucursal extra gratis 4 meses, luego $499/mes).
[^3]: maspedidos.com/menu-digital (FAQ, citas verbatim), maspedidos.menu/ejemplo (demo con CLABE y datos bancarios al comensal), maspedidos.com/funcionalidades/corte-de-caja (arqueo automático).
[^4]: maspedidos.com/page-sitemap.xml — revisión del sitio completo, junio 2026.
[^5]: Pasarelas online: mercadopago.com.mx/herramientas-para-vender/link-de-pago (3.49% + $4 inmediato; 2.95% + $4 a 30 días); stripe.com/mx/pricing (3.6% + $3); conekta.com/pricing (3.4% + $3). Todas + IVA.
[^6]: Terminales: shop.clip.mx/products/clip-pro-2; mercadopago.com.mx/herramientas-para-vender/lectores-point; Getnet GSmart vía ayuda.agendapro.com/es/articles/8491322.
[^7]: Indeed CDMX: cajero $8,985/mes (~$47/h), encargado de restaurante $15,811/mes (~$82/h); carga social estimada ~30% (estimación estándar, sin fuente directa). $150/h solo como costo de oportunidad del dueño/gerente.
[^8]: ANTAD: merma retail 1.59% (blog.storecheck.com.mx); robo hormiga 2.5% de ventas en tiendas departamentales (milenio.com). Cifras de retail, no de restaurantes.
[^9]: banxico.org.mx/cep (verificación de comprobantes SPEI); condusef.gob.mx (enviar SPEI $0–$7.50 según banco; recibir gratis); conekta.com/pricing (SPEI $12.50 + IVA).
[^10]: Pricing Kobi según home v4 publicado ($399/$699/$1,199 MXN/mes). En conflicto con `apps/oms/lib/constants/plans.ts` ($799/$1,499/$2,999 por sucursal) — [RECONCILIAR PRICING] antes de publicar.

---

## Entregable 5 — Assets propuestos para home/pitch

**Posicionamiento Kobi vs. Maspedidos · Specs accionables (no implementar todavía)**

Reglas transversales: todos los números de Miztli Pardo son **supuestos de trabajo a validar** con datos reales del piloto, marcados junto al primer número donde aparecen. Todo claim sobre Maspedidos sale de fuentes públicas citadas; Maspedidos es un POS completo y se le trata con respeto — la comparación gana por contexto, no por golpes. Los costos de cobrar (terminal, pasarela) son **cargos de terceros** y así se etiquetan en ambos lados: si cobras con tarjeta, pagas procesamiento uses el sistema que uses — incluido Kobi, cuyo home publica que el procesamiento de pago con tarjeta lo cobra tu proveedor de pagos por separado. El argumento económico de Kobi no es "ahorras fees": es lo que el 1.5% compra en operación integrada. Y el IVA va simétrico: en este documento **ninguna cifra incluye IVA**, declarado en nota, en los dos lados por igual.

---

### Asset 1 — Comparativa visual de 3 columnas (sección home / slide de pitch)

### 1.1 Mockup de contenido

**Título propuesto:** "Sin comisiones" es cierto. Aquí están los costos que casi nadie suma.
**Subtítulo propuesto:** Comparamos peras con peras: lo que pagas de suscripción, lo que te cuesta cobrar por tu cuenta y lo que compra la diferencia.

| | Maspedidos | Kobi | Nota |
|---|---|---|---|
| **Suscripción y comisión** | Sin comisión porcentual sobre ventas. Suscripción de $299 a $899/mes (Básico / Pro / Prime) con cupo de pedidos online por plan: 100 / 300 / 600 al mes, y $1.39 por pedido extra documentado en el plan Prime.¹ | Suscripción de $399 a $1,199/mes **[RECONCILIAR PRICING]** + 1.5% solo en ventas de tu tienda propia, sin cargo extra a tu cliente y sin cupo de pedidos en tu canal directo. Mostrador y apps no pagan comisión a Kobi. | Los dos cobramos suscripción. La diferencia de modelo: cupos de pedidos por plan vs. porcentaje sin cupo. |
| **Procesamiento de pago** | No procesan pagos: cobras por tu cuenta con efectivo contra entrega, transferencia (SPEI) o terminal física. Su FAQ lo dice textual: "nosotros no intermediamos tu dinero" y "Maspedidos no intermedia en las transacciones".² | Tu cliente paga en línea al ordenar y el pedido cae confirmado **[VALIDAR CON PRODUCTO: la integración de cobro en línea (Mercado Pago) está diferida y no está en producción; no publicar esta celda hasta entonces]**. El procesamiento con tarjeta lo cobra tu proveedor de pagos por separado — igual que con cualquier sistema. | Si cobras con tarjeta, pagas procesamiento con cualquiera de los dos. Son cargos de terceros (adquirente/pasarela), no de Maspedidos ni de Kobi. Rangos abajo, con fuente.³ |
| **Canales y despacho** | POS completo: mostrador, mesas/comandero, KDS, multi-sucursal, menú digital con pedidos por WhatsApp. No anuncian integración con Uber Eats, Rappi o Didi Food ni repartidores propios (sitio público de Maspedidos, consultado junio 2026).⁴ | Uber Eats, Rappi, Didi, tienda propia y mostrador: pedidos en una sola pantalla, con pantalla de cocina (KDS) y despacho Uber Direct sin flota propia. | Las apps cobran su comisión de marketplace con cualquiera de los dos sistemas **[AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX antes de publicar el rango 25–30%]**; la diferencia es operarlas todas desde un solo lugar. |
| **Caja y conciliación** | Corte de caja con arqueo automático y reportes por método de pago — en esto vamos parejos.⁵ La verificación de transferencias y comprobantes queda manual: no hay pasarela que la haga por ti. | Caja con arqueo, igual. La diferencia propuesta: pagos en línea con confirmación automática, cada pedido llega cobrado e identificado **[VALIDAR CON PRODUCTO antes de publicar]**. | Verificar comprobantes SPEI a mano (CEP de Banxico) no cobra comisión, pero sí horas de tu gente — abajo lo estimamos, por separado y como estimación.⁶ |
| **Software + comisión al mes, ejemplo a escala de una dark kitchen\*** | $6,320/mes ($899 Prime + $5,421 por 3,900 pedidos extra × $1.39).¹ **[A VERIFICAR: si los precios publicados de Maspedidos incluyen o causan IVA]** | $12,212–$13,012/mes (plan $399–$1,199 **[RECONCILIAR PRICING]** + $11,813 de comisión 1.5%). | A este volumen, Kobi cuesta más en software + comisión — alrededor del doble. Lo que compra esa diferencia (~$6,000–$7,000/mes): apps, tienda y mostrador en una pantalla, despacho sin flota, sin cupos de pedidos directos y cobro integrado al pedido **[VALIDAR CON PRODUCTO]**. Si solo vendes canal directo, cobras en efectivo o transferencia y la operación manual no te pesa, Maspedidos puede salirte más barato — la calculadora de abajo te lo dice tal cual. |

**Bloque adicional bajo la tabla — "Tu costo de cobranza" (aparte de la tabla, nunca dentro de la columna de Maspedidos):**

> **Cobrar por tu cuenta también cuesta — con cualquiera de los dos sistemas. Son cargos de terceros (adquirente o pasarela), no de Maspedidos ni de Kobi:**
> - Terminal física: tarjeta de crédito 2.15–2.55% con bancos y 3.39–3.60% con agregadores; débito bancario desde 1.65% (Banxico, abril 2026).³ A escala del ejemplo: entre $12,994 (débito 1.65%) y $28,350 (agregador crédito 3.60%) al mes, sin IVA.
> - Cobro en línea: Mercado Pago 2.95–3.49% + $4, Stripe 3.6% + $3, Conekta 3.4% + $3 por transacción.⁷
> - Transferencia SPEI: recibir es gratis; el costo es operativo — verificación manual de comprobantes, sin webhook ni conciliación con el POS.⁶
> - Efectivo: sin comisiones. Las cifras de merma disponibles (ANTAD, 1.59%) son de retail, no de restaurantes; las citamos solo como referencia acotada y no las usamos para cuantificar este ejemplo.⁸
> - **+ tiempo de cobranza estimado** (estimación aparte; no se suma a ningún total): 60 h/mes — 2 h/día, supuesto de trabajo en validación con Miztli — × $60/h de cajero con carga social ≈ $3,600/mes, o × $150/h solo como costo de oportunidad del dueño ≈ $9,000/mes.⁹

### 1.2 Nota al pie propuesta (obligatoria, visible sin interacción)

> \***Supuestos y fuentes del ejemplo.** Modelo de trabajo de una dark kitchen real en CDMX (cliente piloto); **todo dato operativo es supuesto en validación**: 150 pedidos directos/día (supuesto adicional a validar con Miztli: que los 150 sean 100% pedidos en línea de tienda propia, no mostrador) × ticket de $175 × 30 días = $787,500/mes de venta directa (4,500 pedidos/mes); canales: +40/día Uber Eats y +30/día Rappi = 220 órdenes/día. Maspedidos: plan Prime $899/mes incluye 600 pedidos online; los 3,900 extra × $1.39 = $5,421 (el cargo por pedido extra está documentado solo en el plan Prime).¹ Kobi: suscripción $399–$1,199/mes **[RECONCILIAR PRICING]** + 1.5% en ventas de tienda propia; el procesamiento de pago con tarjeta lo cobra tu proveedor de pagos por separado. **Ninguna cifra de esta sección incluye IVA — misma base en ambas columnas. [VALIDAR: tratamiento de IVA en la facturación de ambos lados antes de publicar.]** El tiempo de cobranza (60 h/mes = 2 h/día, supuesto de trabajo en validación con Miztli) se presenta como estimación aparte y no se suma a los totales documentados.
>
> Fuentes: ¹ maspedidos.com/precios, consultado 2026-06-09. ² maspedidos.com/menu-digital (FAQ), consultado junio 2026. ³ Banxico, tasas de descuento por giro "Restaurantes", abril 2026, banxico.org.mx. ⁴ Sitemap y FAQ públicos de maspedidos.com, consultados junio 2026 ("¿El sistema incluye repartidores propios? No…"). ⁵ maspedidos.com/funcionalidades/corte-de-caja, consultado junio 2026. ⁶ Condusef (SPEI: recibir es gratis; enviar $0–$7.50 según banco); CEP: banxico.org.mx/cep. ⁷ mercadopago.com.mx/herramientas-para-vender/link-de-pago; stripe.com/mx/pricing; conekta.com/pricing, consultados junio 2026. ⁸ ANTAD 2024/25 (vía blog.storecheck.com.mx) — dato de retail, incluye merma de producto; sin dato específico de restaurantes. ⁹ Cajero: Indeed CDMX $8,985/mes ≈ $47/h + ~30% de carga social ≈ $60/h (estimación); $150/h es costo de oportunidad del dueño, no costo laboral; encargado cargado ≈ $105/h (Indeed CDMX).

### 1.3 Lineamientos de diseño (coherentes con home v4)

1. **Cero agresividad visual.** La columna Maspedidos va en neutro: texto descriptivo, sin tachas rojas, sin "✗", sin íconos de fracaso. Es el mismo trato que le dimos a Fudo: datos públicos, presentados con respeto. El acento #7C71FF se usa solo en el encabezado y borde de la columna Kobi.
2. **Mismo lenguaje visual que el home v4 cálido:** fondo crema, título de sección en Fraunces, cuerpo en la sans del sistema, tabla con esquinas redondeadas y mucho aire. En móvil, la tabla colapsa a tarjetas apiladas por fila (Maspedidos arriba, Kobi abajo, nota como pie de tarjeta).
3. **Los supuestos no viven en un tooltip.** La nota al pie con fuentes y supuestos se renderiza siempre visible bajo la tabla, en gris pequeño pero legible, igual que el disclaimer de Fudo. El bloque "Tu costo de cobranza" va fuera de las columnas de marca, para que ningún cargo de terceros se lea como cargo de Maspedidos. Honestidad es parte del diseño, no letra chica.

---

### Asset 2 — Calculadora interactiva para el home: "¿Cuánto te cuesta cobrar?"

### 2.1 Objetivo y ubicación

Sección del home inmediatamente después de la comparativa. Promesa: el usuario mueve tres controles y ve cuánto cuesta cada esquema — y qué compra la diferencia cuando Kobi cuesta más. La calculadora **debe poder decir que Kobi sale más caro** cuando los números lo digan — esa honestidad es el asset. No vende ahorro de fees: muestra la cuenta y deja que la operación integrada se defienda sola.

### 2.2 Inputs

| Input | Control | Rango / opciones | Default |
|---|---|---|---|
| `ordenesDirectasMes` | Slider | 100 – 6,000, paso 50 | 900 (≈30/día) |
| `ticketPromedio` | Slider o campo numérico | $60 – $400 MXN, paso $5 | $175 |
| `metodoCobro` | Segmented control | Efectivo contra entrega · Transferencia (SPEI) · Terminal en la entrega | Transferencia |
| `quienConcilia` | Segmented control | "Un cajero (~$60/h con carga social)" · "Tú (~$150/h, costo de oportunidad)" | Cajero |
| `planKobi` | Selector | $399 / $699 / $1,199 **[RECONCILIAR PRICING]** | Sugerido por volumen *[VALIDAR umbrales de plan con producto]* |
| `cobroEnLinea` | Toggle | "Con Kobi, tu cliente paga en línea al ordenar" ON/OFF **[VALIDAR CON PRODUCTO: integración de cobro en línea diferida]** | ON |
| ~~`incluirMerma`~~ | Eliminado del cálculo: la cifra ANTAD es merma de retail y no puede cuantificar este total. La referencia se muestra solo como línea informativa fuera del resultado (ver 2.6 caso 7) | — | — |

### 2.3 Constantes parametrizadas (archivo único, con fuente y fecha en comentario)

```ts
// fees.ts — fuentes públicas, consultadas junio 2026. NO hardcodear en JSX.
// Todas las tasas sin IVA; el IVA se aplica simétrico (ambos lados) o no se aplica.
export const KOBI_PCT = 0.015;           // 1.5% solo tienda propia, sin cargo extra al cliente
export const IVA = 0.16;                 // aplicar ×(1+IVA) a AMBOS totales o a ninguno
export const TERMINAL_PCT_MIN = 0.0165;  // Banxico abr-2026, DÉBITO bancario (BBVA 1.65). Crédito bancos: 2.15–2.55, mínimos negociables 1.76
export const TERMINAL_PCT_MAX = 0.0360;  // Banxico abr-2026, crédito agregadores (MP 3.39, Clip 3.53, Stripe 3.60)
export const PASARELA_PCT_MIN = 0.0295;  // Mercado Pago online, liberación a 30 días; rango completo 2.95–3.49% + $4
export const PASARELA_PCT_MAX = 0.0349;  // Mercado Pago online, liberación al instante
export const PASARELA_FIJO = 4;          // $4 MXN por transacción (MP). Pasarela = cargo de tercero, NO de Kobi.
                                         // [VALIDAR CON PRODUCTO: proveedor y tasas reales cuando el cobro online esté en producción]
export const MIN_POR_PEDIDO = 0.8;       // min/pedido de verificación manual. Derivado del supuesto Miztli: 120 min/día ÷ 150 pedidos DIRECTOS
                                         // (supone que las apps liquidan solas y las 2 h se van solo en el canal directo). [A VALIDAR con Miztli]
export const COSTO_HORA = { cajero: 60, dueno: 150 }; // cajero: Indeed CDMX $8,985/mes ≈ $47/h + ~30% carga social ≈ $60/h (estimación).
                                         // dueño: costo de oportunidad, NO costo laboral. Encargado cargado ≈ $105/h como referencia intermedia.
export const MERMA_PCT = 0.0159;         // ANTAD 2024/25 — merma TOTAL de RETAIL (incluye producto), no restaurantes. SOLO línea informativa, nunca dentro del total.
```

### 2.4 Fórmulas exactas

```
ventaMes = ordenesDirectasMes × ticketPromedio
// Base sin IVA en AMBOS lados, declarado junto al resultado.
// Si el resultado se muestra con IVA: ×(1+IVA) en los dos totales — simetría o nada.

// Lado Kobi
costoKobiBase = planKobi + ventaMes × KOBI_PCT
// Si cobroEnLinea ON [VALIDAR CON PRODUCTO]: la pasarela (tercero) se suma al lado Kobi,
// porque el home publica que el procesamiento se cobra por separado:
pasarelaMin  = ventaMes × PASARELA_PCT_MIN + ordenesDirectasMes × PASARELA_FIJO
pasarelaMax  = ventaMes × PASARELA_PCT_MAX + ordenesDirectasMes × PASARELA_FIJO
costoKobiMin = costoKobiBase + pasarelaMin
costoKobiMax = costoKobiBase + pasarelaMax
// Si cobroEnLinea OFF: el cliente te paga igual que hoy; el costo de cobro es idéntico
// en ambos lados y se omite de los dos → costoKobiMin = costoKobiMax = costoKobiBase.

// Lado "tu esquema actual", según metodoCobro:
// 1) Terminal en la entrega → rango, nunca un solo número
costoActualMin = ventaMes × TERMINAL_PCT_MIN   // débito bancario 1.65%
costoActualMax = ventaMes × TERMINAL_PCT_MAX   // agregador crédito 3.60%
// (tiempo de conciliación con terminal se asume 0 para no inflar el lado contrario)

// 2) Transferencia (SPEI) → recibir es gratis (Condusef); el costo es tiempo
horasMes    = ordenesDirectasMes × MIN_POR_PEDIDO / 60
costoActual = horasMes × COSTO_HORA[quienConcilia]

// 3) Efectivo contra entrega → mismo tiempo de manejo + merma opcional (proxy retail, OFF default)
costoActual = horasMes × COSTO_HORA[quienConcilia]
// La merma NO entra al total: la cifra ANTAD (retail) se muestra solo como línea
// informativa fuera del resultado — "como referencia, en retail la merma promedia
// 1.59% (ANTAD): dato de otro sector, no lo sumamos a tu total".

// Comparación entre rangos (regla: nunca colapsar un rango a un punto):
// Kobi gana   si costoKobiMax < costoActualMin
// Kobi pierde si costoKobiMin > costoActualMax
// intermedio  si los rangos se traslapan → "depende de la tasa que negocies"
```

Verificación con el modelo Miztli (4,500 pedidos, ticket $175, plan $1,199, todo sin IVA): `costoKobiBase = 1,199 + 787,500 × 0.015 = $13,012`; pasarela ON: `$41,231 – $45,484` extra → `costoKobi = $54,243 – $58,495`; transferencia con dueño: `60 h × $150 = $9,000`; terminal: `$12,994 – $28,350`. Los resultados deben cuadrar en tests. (Nota honesta para QA: a esta escala, el lado Kobi en pesos es mayor en casi cualquier configuración — el copy del estado 3 existe para eso.)

### 2.5 Output (copy propuesto, tres estados)

- **Kobi gana (en pesos), método Terminal** (fees documentados en ambos lados): "Tu esquema actual te cuesta **$Y al mes**. El lado Kobi — plan + 1.5% + tu proveedor de pagos — queda entre **$A y $B**. Aun en el peor caso te quedan $Z."
- **Métodos Transferencia/Efectivo:** el lado actual es 100% estimación de horas, así que se etiqueta inline y no se concluye ahorro en pesos: "Tu cobranza manual te cuesta **~$Y al mes en tiempo estimado\*** (N horas de tu equipo). El lado Kobi queda entre **$A y $B** en fees documentados. Compara tú: pesos contra horas." *(\* al expandible de supuestos.)*
- **Rangos traslapados / empate:** "En pesos, depende de la tasa que negocies: tu esquema entre $Y₁ y $Y₂, Kobi entre $A y $B. La diferencia es lo que no sale en la cuenta: cada pedido llega con el pago confirmado y sin perseguir comprobantes **[VALIDAR CON PRODUCTO antes de publicar este claim]**."
- **Kobi pierde (obligatorio mostrarlo tal cual):** "Con tu volumen y tu forma de cobrar, tu esquema actual sale **$Z más barato** al mes. Así de claro. Lo que pagas de más con Kobi compra otra cosa: tus apps, tu tienda y tu mostrador en una sola pantalla, despacho sin flota propia, sin cupos de pedidos directos, y el cobro integrado al pedido **[VALIDAR CON PRODUCTO]**. Si vendes por un solo canal y la cobranza manual no te pesa, quédate con tu esquema — sin rencores."

Debajo del resultado, siempre: enlace expandible "¿Cómo calculamos esto?" con las constantes y fuentes, la declaración "todas las cifras sin IVA, en ambos lados", y los avisos de que el cálculo cubre **solo tus ventas directas** (las apps cobran su comisión de marketplace uses lo que uses **[AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX]**), asume que todas tus ventas directas se cobran con el mismo método, y que la pasarela del lado Kobi es un cargo de tu proveedor de pagos, no de Kobi.

### 2.6 Casos límite (la calculadora debe ser honesta)

1. **Volumen bajo + transferencia/efectivo + cajero:** 300 pedidos × $150, transferencia, $60/h → actual = $240/mes vs. Kobi = $399 + $675 = $1,074 (cobro en línea OFF; con ON, más la pasarela). **El esquema actual gana por mucho.** Mostrar el estado 3 sin maquillaje.
2. **Volumen bajo + terminal:** 300 pedidos × $150 → actual entre $743 (débito bancario 1.65%) y $1,620 (agregador 3.60%), sin IVA, vs. Kobi $1,074, que **cae dentro del rango** → estado intermedio: "depende de la tasa que negocies". Con débito bancario o crédito negociado (mínimos de 1.76%, Banxico), **el esquema actual gana — mostrarlo tal cual**. Prohibido cantar victoria con el extremo alto del rango.
3. **Rango de terminal:** nunca colapsar 1.65%–3.60% a un promedio; mostrar siempre "entre $A y $B según tu proveedor y tipo de tarjeta". Lo mismo aplica al rango de pasarela del lado Kobi.
4. **Escala del ejemplo Miztli:** a 4,500 pedidos, el lado Kobi en software + comisión (~$13,012) es alrededor del doble que Maspedidos (~$6,320) y mayor que la cobranza manual con dueño ($9,000). Estado 3 con el copy de valor — la calculadora no esconde este resultado.
5. **Extremos del slider:** mínimo 100 evita división rara; aun así, guard clauses para 0/NaN y placeholder "mueve los controles para ver tu número".
6. **El supuesto de 0.8 min/pedido es de Miztli, no universal:** etiquetarlo en el expandible como "estimación de una cocina real, en validación; supone que el tiempo de cobranza se va solo en pedidos directos (las apps liquidan solas)".
7. **Merma:** nunca dentro del total calculado. En modo efectivo se muestra solo una línea informativa acotada bajo el resultado: "como referencia, en retail la merma promedia 1.59% (ANTAD) — dato de otro sector que incluye merma de producto; no lo sumamos a tu total".

### 2.7 Nota de implementación

Componente client-side (`"use client"`), sin backend, sin guardar inputs, sin tracking de valores. Constantes en `fees.ts` único con fuente y fecha por línea. Recalcula on-change (sin botón "calcular"). Formato `es-MX` con `Intl.NumberFormat`. Visual: misma tarjeta cálida del home v4, resultado grande en Fraunces, acento #7C71FF solo en la cifra de Kobi. **No se implementa hasta resolver los bloqueadores de la sección final** (pricing y cobro en línea).

---

### Asset 3 — Guion de video 60 s con Miztli Pardo

**Premisa:** testimonial real de dark kitchen en Roma Norte, CDMX (cliente piloto). Tono documental, sin voz de comercial: cocina de verdad, ruido de campana, manos trabajando. **Ningún diálogo se publica sin que Miztli lo valide y lo diga con sus palabras; todas las cifras del guion son modelo de trabajo, no datos confirmados.**

### Bloque 1 · 0–10 s · Hook

- **Visual:** hora pico en la cocina. Plancha, vapor, campana de pedidos sonando. Corte rápido a la persona de Miztli de frente, mandil puesto.
- **Diálogo:** "Doscientas veinte órdenes en un día. Dos apps y mi tienda. Y antes, cada quien por su lado." **[CITA PROPUESTA — validar con Miztli; el modelo de trabajo es 150 directas + 40 Uber Eats + 30 Rappi al día — si Miztli confirma volumen de mostrador o una tercera app, ajustar la línea para que las 220 cuadren]**
- **On-screen:** "Miztli Pardo · dark kitchen · Roma Norte, CDMX"

### Bloque 2 · 10–30 s · Problema

- **Visual:** la versión "antes": tablets apiladas, celular con capturas de transferencias, libreta, fajos de efectivo en el corte.
- **Diálogo:** "Las apps se quedan con una parte grande de cada pedido. Y lo que vendía directo lo cobraba a mano: revisar transferencia por transferencia, contar el efectivo, cuadrar la caja. Se me iban como dos horas diarias nomás persiguiendo dinero." **[CITA PROPUESTA — validar con Miztli — las 2 h/día son supuesto de trabajo, confirmar con su operación real]**
- **On-screen:** "Las apps cobran 25–30% por pedido **[AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX antes de publicar]**" / "Cobranza manual: ~2 h al día*" (asterisco a nota legal final: supuesto en validación).

### Bloque 3 · 30–50 s · Solución con números

- **Visual:** la pantalla de Kobi en la cocina: pedidos de tienda propia, mostrador y apps entrando juntos; pantalla de cocina (KDS) marcando platillos; un pedido sale con despacho Uber Direct; cierre de caja con arqueo.
- **Diálogo:** "Hoy todo cae en una sola pantalla: mi tienda, el mostrador y las apps. El reparto se pide solo, sin flota mía. De lo que vendo en mi tienda, Kobi se queda el uno y medio por ciento, más mi plan del mes — y a mi cliente no le cargan nada extra. La caja se cierra con arqueo, no con libreta." **[CITA PROPUESTA — validar con Miztli]**
- **Línea adicional opcional (NO grabar todavía):** "Mi cliente paga al ordenar y el pedido cae ya cobrado." **[CITA PROPUESTA — validar con Miztli]** **[VALIDAR CON PRODUCTO: cobro en línea diferido, no está en producción; además, el procesamiento con tarjeta lo cobra el proveedor de pagos por separado — esta línea solo entra al corte cuando ambas cosas estén resueltas]**
- **On-screen:** "1.5% solo en tienda propia · $0 extra para tu cliente · Planes desde $399/mes\* **[RECONCILIAR PRICING]**" / "Mostrador y apps: sin comisión de Kobi" (asterisco a nota legal final con la suscripción — en pantalla no puede quedar la impresión de que el 1.5% es el único costo de Kobi).

### Bloque 4 · 50–60 s · Remate

- **Visual:** plano fijo, cocina ya tranquila, la persona de Miztli apaga la pantalla y sonríe.
- **Diálogo:** "¿Las apps? Síguelas usando. Pero que tu tienda sea tuya." **[CITA PROPUESTA — validar con Miztli]**
- **On-screen (cierre):** logo Kobi sobre fondo crema, acento #7C71FF: "Kobi. Tus pedidos en una sola pantalla." + CTA "Pruébalo con tu cocina".

### Notas de producción y legales

- Formatos: 9:16 (social) y 16:9 (home/pitch). Subtítulos quemados: debe entenderse sin audio.
- Lower-thirds en Fraunces, paleta cálida del home v4; #7C71FF solo en cierre y CTA.
- Antes de publicar: (1) validar con Miztli cada línea y cada cifra contra sus datos reales — 220 órdenes/día, 150 directas, 2 h/día y la composición de canales son modelo de trabajo, no hechos; el guion no afirma en indicativo nada de su operación que no esté validado; (2) consentimiento firmado de imagen y aprobación del corte final; (3) revisar que ninguna cifra en pantalla contradiga los claims publicados del home: 1.5% en tienda propia + suscripción, procesamiento de pago por separado; jamás implicar que el 1.5% es el único costo ni que incluye la pasarela; (4) ninguna promesa de antifraude ni de blindaje contra contracargos.
- El video no menciona a Maspedidos ni a ningún competidor: el testimonial vende la solución; la comparativa de la tabla hace el otro trabajo.

---

### Bloqueadores de publicación (resolver antes de implementar cualquier asset)

1. **[RECONCILIAR PRICING]** — El home v4 publica planes de $399/$699/$1,199; `apps/oms/lib/constants/plans.ts` define $799/$1,499/$2,999 por sucursal. Todo el copy de este entregable usa los del home v4; ningún asset se publica hasta unificar.
2. **Contradicción en el sitio publicado** — `/precios` aún responde "¿Cobran comisión por transacción? No." y `/nosotros` dice "sin comisiones por transacción"; ambos contradicen el modelo 1.5%. Actualizar esas páginas antes de publicar cualquier comparativa, o la autocontradicción queda documentada para competidores y PROFECO.
3. **[VALIDAR CON PRODUCTO]** — Cobro en línea (Mercado Pago) diferido: ningún claim de "pago al ordenar", "confirmación automática" o "pedido cae cobrado" se publica hasta que esté en producción y pricing confirme tasas del proveedor.
4. **[AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX]** — El rango 25–30% ya vive en el FAQ del home, pero necesita fuente pública citable antes de usarse en material comparativo externo.
5. **Validación Miztli** — Todos los supuestos operativos (150/40/30 pedidos, ticket $175, 2 h/día, atribución del tiempo al canal directo) y todas las líneas [CITA PROPUESTA] requieren confirmación del piloto.
6. **FAQ canónica sobre el 1.5%** — El home ya publica que el procesamiento de pago va por separado: esa es la respuesta oficial. Cambiarla exigiría cambiar primero el disclaimer del home y los términos; mientras tanto, el argumento de valor del 1.5% se construye sobre la operación integrada, no sobre absorber el fee de pasarela.

---

## Entregable 6 — FAQ / manejo de objeciones (Kobi vs. Maspedidos)

> **Nota de IVA (aplica a todo el documento):** todos los montos y tasas se expresan **sin IVA**, de ambos lados — tarifas de adquirentes y pasarelas, planes de Maspedidos y precios de Kobi [VALIDAR: confirmar el tratamiento de IVA de los precios publicados de Maspedidos y de los planes de Kobi antes de publicar]. El IVA aplica encima donde corresponda.

---

### 1. "Maspedidos no cobra comisión. ¿Por qué pagarle 1.5% a Kobi?"

Es cierto: Maspedidos no cobra comisión porcentual sobre tus ventas, y ambos cobramos suscripción mensual. (Sus planes sí traen cupos de pedidos online al mes — 100, 300 o 600 según plan — y en su plan Prime el pedido adicional cuesta $1.39.[^1]) "Sin comisiones" es verdad — y exactamente por eso todo el costo y el trabajo de cobrar queda de tu lado: su propia FAQ lo dice tal cual, *"El trato es directo entre tú y tu cliente… nosotros no intermediamos tu dinero"*.[^2]

Y cobrar cuesta: en comisión, en horas de caja o en riesgo. Ese costo de cobranza son cargos de **terceros** (tu adquirente o tu pasarela, no de Maspedidos): una terminal física va desde 1.65% en débito bancario hasta 3.39–3.60% en crédito con agregadores,[^3] y el cobro online ronda 2.95–3.6% + $3–$4 por transacción.[^4] Si lo resuelves con efectivo o transferencia, el costo se muda a horas de caja y riesgo.[^5]

El 1.5% de Kobi no sustituye esos cargos — el procesamiento de pago con tarjeta lo cobra tu proveedor de pagos por separado[^6] — y paga otra cosa: tu tienda propia sin cupos de pedidos, y tus canales (Uber Eats, Rappi, Didi, tienda propia, mostrador) cayendo a una sola pantalla, con despacho Uber Direct sin flota propia.

---

### 2. "Corrí los números: a mi volumen, Maspedidos me sale más barato. ¿Entonces?"

A veces sí, y preferimos decírtelo nosotros. Con los supuestos de trabajo de una dark kitchen como Miztli [SUPUESTO — validar con Miztli antes de publicar: 150 pedidos directos/día, ticket $175], la venta directa es $787,500 al mes (4,500 pedidos). A ese volumen:

- **Maspedidos** no sale gratis: Prime $899 + 3,900 pedidos extra × $1.39 = **$6,320/mes** de software.[^1]
- **Kobi**: comisión 1.5% = $11,813 + plan de $399 a $1,199 [RECONCILIAR PRICING] = **$12,212–$13,012/mes**.[^7]

En pesos de software más comisión, Kobi cuesta más — cerca del doble a ese volumen. La pregunta honesta es qué compra esa diferencia (~$6,000–7,000/mes): cobro en línea integrado al pedido [VALIDAR CON PRODUCTO: integración Mercado Pago diferida, aún no en producción], la orquestación de apps + tienda propia + mostrador en una pantalla, despacho Uber Direct sin flota propia y canal directo sin cupos. Aparte de esos totales va **+ tiempo de cobranza estimado** — no lo sumamos al total porque es un supuesto, no un fee documentado (ver pregunta 3).

Dos cosas más, parejas para ambos lados: si cobras con tarjeta, el procesamiento lo cobra un tercero aparte en los dos escenarios; y Maspedidos es un POS completo — mostrador, comandero, KDS, corte de caja con arqueo, reportes — no es un rival de paja. Si solo vendes canal directo, cobras en efectivo o transferencia y la operación manual no te pesa, Maspedidos puede salirte más barato. Kobi gana sentido conforme tu operación se vuelve multicanal y el cobro digital pesa más.

---

### 3. "¿Y si solo cobro efectivo contra entrega? Así no pago nada."

Puedes, y seamos honestos: con volumen bajo, hoy puede convenirte. Lo que no aparece en ningún estado de cuenta: cancelaciones en la puerta, cambio que no cuadra y merma. En retail mexicano la merma es de 1.59% de las ventas según ANTAD — es una cifra de autoservicio, no de restaurantes (no hay estudio específico del giro), pero el mecanismo, efectivo que pasa por muchas manos, es el mismo.[^8]

Súmale las horas de contar, cuadrar y depositar: en una dark kitchen como Miztli estimamos 2 horas al día, unas 60 al mes [SUPUESTO — validar con Miztli antes de publicar]. A $60 la hora de un cajero (con carga social), unos $105 la de un encargado, o $150 si esa hora la pone el dueño en vez de vender (costo de oportunidad, no nómina),[^9] ese "gratis" cuesta. Kobi gana sentido conforme tu tienda propia crece y el cobro digital te pesa más que el efectivo.

---

### 4. "¿Puedo usar Kobi y cobrar por fuera para evitar el 1.5%?"

Poder, puedes. Y de la comisión de pasarela no te escapas cobrando por fuera: un link de pago externo cuesta prácticamente lo mismo que una pasarela integrada (2.95–3.6% + $3–$4 por transacción).[^4] Te lo reconocemos directo: el 1.5% es un costo adicional — es lo que paga la plataforma de tu canal directo, no el procesamiento.

Lo que pierdes al sacar el cobro del flujo es operativo: que el pedido y su cobro viajen juntos y caigan a la misma pantalla donde ya viven tus pedidos de apps y mostrador [VALIDAR CON PRODUCTO: cobro en línea integrado vía Mercado Pago diferido, aún no en producción], en lugar de cruzar a mano tu lista de links cobrados contra tu lista de pedidos. Si ese cuadre manual no te pesa, cobrar por fuera es una opción razonable; si te pesa, eso es exactamente lo que el 1.5% compra.

---

### 5. "¿El 1.5% ya incluye el fee de la pasarela?"

No, y queremos que lo sepas antes de firmar, no después. El 1.5% es la comisión de Kobi por tu tienda propia; el procesamiento de pago con tarjeta lo cobra tu proveedor de pagos por separado — así está publicado en nuestro home.[^6] Como referencia, la tarifa pública online de Mercado Pago va de 2.95% a 3.49% + $4 según el plazo de liberación; Stripe cobra 3.6% + $3 y Conekta 3.4% + $3.[^4] Suma la comisión de Kobi y la tarifa de tu pasarela para conocer tu costo real por venta.

Lo que el 1.5% paga no es absorber ese fee: es la operación integrada — tu tienda propia sin cupos, tus pedidos de apps y mostrador en una pantalla, despacho Uber Direct — y el cobro en línea amarrado al pedido cuando esté en producción [VALIDAR CON PRODUCTO: integración Mercado Pago diferida].

> **Nota interna (no publicar):** esta es la única respuesta consistente con el disclaimer vigente del home de Kobi. Cambiarla exigiría actualizar primero ese disclaimer y los términos.

---

### 6. "¿Por qué no mejor una terminal de banco, que cobra menos?"

Para tu mostrador, adelante: las tasas bancarias con tarjeta presente son buenas — débito desde 1.65% y crédito 2.15–2.55% en restaurantes, según Banxico.[^3] El punto es que tus pedidos a domicilio son ventas online: el cliente paga desde su celular, sin tarjeta presente, y ahí la referencia es el cobro online, 2.95–3.6% + $3–$4 por transacción.[^4] ¿Mandar la terminal con el repartidor? Se hace, pero alarga cada entrega, arriesga el equipo y deja viva la cancelación en puerta.

La comparación honesta para tu canal directo a domicilio es esta: tu costo total por venta con Kobi (1.5% + la tarifa de tu pasarela) contra ese mismo cobro online (~3.4–3.6% + $3–$4 con liberación inmediata; desde 2.95% con liberación a 30 días) cobrando por tu cuenta sin sistema. La diferencia en pesos es el 1.5% más tu suscripción mensual, y lo que compra es que el pedido nazca cobrado y caiga a la misma pantalla que el resto de tu operación [VALIDAR CON PRODUCTO: cobro en línea integrado vía Mercado Pago diferido, aún no en producción].

---

### 7. "¿Y mis ventas de Uber y Rappi? ¿También pagan 1.5%?"

No. La comisión del 1.5% aplica únicamente a las ventas de tu tienda propia, sin cargo a tu cliente. Lo que vendas por Uber Eats, Rappi o Didi Food no paga comisión a Kobi: ahí ya pagas la comisión del marketplace — del orden de 25–30% [AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX] — y no tiene sentido sumarle más. Lo mismo en mostrador: sin comisión a Kobi. Kobi junta esos pedidos en una sola pantalla y los manda a tu pantalla de cocina (KDS), pero solo cobra porcentaje donde te ayuda a vender directo: tu tienda propia.

---

#### Bloqueadores de publicación (resolver antes de publicar; no se resuelven en este copy)

1. **[RECONCILIAR PRICING]** — Home v4 publica $399/$699/$1,199 MXN/mes; `apps/oms/lib/constants/plans.ts` (lo que renderizan /precios y onboarding) dice $799/$1,499/$2,999 por sucursal. Este copy usa los del home v4; reconciliar la fuente única de verdad y actualizar la nota [^7].
2. **/precios y /nosotros contradicen el modelo 1.5%** — /precios aún publica "¿Cobran comisión por transacción? No." y /nosotros "sin comisiones por transacción". Actualizar antes de publicar cualquier comparativa.
3. **[VALIDAR CON PRODUCTO]** — Cobro en línea integrado (Mercado Pago) diferido, no en producción. Afecta las preguntas 2, 4, 5 y 6. No publicar tampoco "conciliación automática", "antifraude" ni "pago validado antes de confirmar".
4. **[AÑADIR FUENTE PÚBLICA — tarifarios Uber Eats/Rappi MX]** — el 25–30% está publicado en el FAQ del home de Kobi, pero requiere fuente pública antes de usarse en material comparativo externo (pregunta 7).
5. **[SUPUESTO — validar con Miztli antes de publicar]** — todo dato operativo de Miztli (150 pedidos/día, ticket $175, 2 h/día de cobranza) es supuesto de trabajo del modelo canónico.

#### Fuentes y notas de auditabilidad

[^1]: Maspedidos, planes: maspedidos.com/precios (consultado 2026-06-09). Básico $299, Pro $599, Prime $899 MXN/mes; cupos de pedidos online 100/300/600 al mes según plan; $1.39 por pedido adicional documentado solo en el plan Prime.
[^2]: Maspedidos, FAQ oficial: "El trato es directo entre tú y tu cliente… nosotros no intermediamos tu dinero" y "Maspedidos no intermedia en las transacciones" — maspedidos.com/menu-digital y maspedidos.com/gestion-pedidos/pedidos-por-whatsapp (consultado junio 2026). Su sitio público no anuncia integración con Uber Eats/Rappi/Didi ni repartidores propios (decimos "no anuncian", no "no tienen"). Maspedidos es un POS completo: mostrador, comandero, KDS, corte de caja con arqueo, reportes, multi-sucursal.
[^3]: Banxico, tasas de descuento por giro "Restaurantes" (abril 2026): crédito — bancos tradicionales 2.15–2.55%, agregadores 3.39–3.60% (Mercado Pago 3.39%, Clip 3.53%, Stripe 3.60%); débito bancario desde 1.65% (BBVA). banxico.org.mx, fichas de tasas de descuento crédito y débito por giro.
[^4]: Online card-not-present, tarifas públicas: Mercado Pago 2.95–3.49% + $4 según plazo de liberación (mercadopago.com.mx/herramientas-para-vender/link-de-pago); Stripe 3.6% + $3 (stripe.com/mx/pricing); Conekta 3.4% + $3 (conekta.com/pricing).
[^5]: Transferencia SPEI: recibir es gratis en comisiones (enviar cuesta $0–$7.50 según banco, Condusef); el costo es operativo — verificación manual de comprobantes (CEP, Banxico), sin webhook ni conciliación con el POS.
[^6]: Disclaimer publicado en el home de Kobi: "El procesamiento de pago con tarjeta lo cobra tu proveedor de pagos por separado."
[^7]: Modelo canónico a escala Miztli — supuestos de trabajo [SUPUESTO — validar con Miztli antes de publicar]: 150 pedidos directos/día × $175 × 30 = $787,500/mes (4,500 pedidos). Maspedidos: $899 + (4,500−600) × $1.39 = $6,320/mes. Kobi: 1.5% × $787,500 = $11,813 + plan $399–$1,199 según home v4 [RECONCILIAR PRICING] = $12,212–$13,012/mes. Montos sin IVA de ambos lados.
[^8]: ANTAD 2024/25: merma 1.59% de ventas en retail México (vía Storecheck). Cifra de retail/autoservicio, no de restaurantes; no existe estudio específico del giro y así debe presentarse. No usar para cuantificar el riesgo de Miztli.
[^9]: Valor hora (Indeed CDMX + carga social estimada ~30%): cajero ≈$47/h → ≈$60/h cargado; encargado ≈$82/h → ≈$105/h cargado. $150/h se sostiene solo como costo de oportunidad del dueño y así se etiqueta. El costo de tiempo se presenta aparte ("+ tiempo de cobranza estimado") y no se suma a totales de fees documentados.

**Claims de Kobi usados (vigentes y afirmables):** 1.5% solo tienda propia, sin cargo al cliente; apps y mostrador sin comisión a Kobi; pedidos multicanal en una pantalla; KDS; despacho Uber Direct sin flota propia; canal directo sin cupos. Todo lo no shipeado lleva su marcador [VALIDAR CON PRODUCTO] inline.

---

## Anexo A — Research: Maspedidos (digest con fuentes, consultado 2026-06-09)

Maspedidos (maspedidos.com / maspedidos.mx, dashboard en dashboard.maspedidos.mx) es una empresa real con sede en Mérida, Yucatán (RFC RUMB010913L10 según sus términos: https://www.maspedidos.com/terminos-y-condiciones). Ojo: maspedidos.co es otra empresa (Colombia), no confundir.

1) PRECIOS (https://www.maspedidos.com/precios): modelo de suscripción mensual con 3 planes en MXN: Básico $299/mes (POS mostrador ilimitado, corte de caja/arqueo, tickets, menú digital con 100 pedidos a domicilio/recoger al mes incluidos), Pro $599/mes (añade comandero 1,500 pedidos en mesa/mes, KDS, 300 pedidos domicilio/recoger), Prime $899/mes (mesa ilimitada, 600 pedidos domicilio/recoger + $1.39 por pedido adicional). Pago anual −20%, prueba 14 días sin tarjeta, sucursal extra gratis 4 meses y luego $499 c/u. El "cero comisión" no aparece como banner "0%" en home/precios; sí en el title de su landing "Sistema de Pedidos por WhatsApp sin Comisiones" (https://www.maspedidos.com/gestion-pedidos/pedidos-por-whatsapp) y en su marketing social contra las comisiones de agregadores (https://www.tiktok.com/@maspedidos.mx/video/7432905550200950021). En la práctica: no hay comisión porcentual sobre ventas, pero sí cupos de pedidos del menú digital por plan y fee fijo de $1.39/pedido extra (Prime).

2) COBRO/PAGOS: NO integran pasarela online (cero menciones de Mercado Pago/Stripe/Conekta en todo el sitio). FAQ oficial (texto renderizado por JS en https://www.maspedidos.com/menu-digital y https://www.maspedidos.com/gestion-pedidos/pedidos-por-whatsapp): "El trato es directo entre tú y tu cliente. Puedes configurar tus propios métodos de pago como: Efectivo contra entrega, Transferencia bancaria (directo a tu cuenta) o Terminal bancaria (si tus repartidores llevan la terminal física)… nosotros no intermediamos tu dinero" y "efectivo contra entrega, transferencia bancaria (SPEI) o cobro con terminal física. Maspedidos no intermedia en las transacciones". El menú demo (https://www.maspedidos.menu/ejemplo) lo confirma en su configuración embebida: flags accepts_cash/card/transfer para delivery y pickup, y datos bancarios del negocio (banco, CLABE, número de tarjeta) mostrados al comensal para transferencia manual; campo de propina opcional. No hay fee de procesamiento porque no procesan pagos: la cobranza recae 100% en el restaurante.

3) DELIVERY: sin integración con Uber Eats/Rappi/Didi en ninguna página del sitemap completo (https://www.maspedidos.com/page-sitemap.xml); solo blog educativo sobre cuánto cobran esas apps. FAQ: "¿El sistema incluye repartidores propios? No… El restaurante mantiene el control total de su logística y personal de entrega. Tú defines tus zonas de cobertura y costos de envío directamente en el panel". No hay orquestación tipo Uber Direct. El envío se calcula por colonias o por distancia con Google Maps (FAQ en /menu-digital); demo muestra "Costo envío Desde $20" al comensal.

4) POS/KDS/CAJA/REPORTES: sí es un POS completo (https://www.maspedidos.com/software-para-restaurantes): mostrador, mesas/comandero, KDS, tickets, roles, multi-sucursal. Corte de caja con arqueo automático: "el sistema calcula automáticamente los montos esperados y detecta faltantes o descuadres al cerrar turno", compara esperado vs declarado, registro de gastos con motivo (https://www.maspedidos.com/funcionalidades/corte-de-caja). Reportes: total de ventas, pedidos, ticket promedio, productos top y desglose por método de pago efectivo/tarjeta/transferencia (https://www.maspedidos.com/funcionalidades/estadisticas-y-reportes). NO mencionan conciliación bancaria/de pasarela (no aplica: no procesan pagos) ni facturación/contabilidad.

5) LETRA CHICA: cupos mensuales de pedidos online por plan (100/300/600); $1.39/pedido extra solo documentado en Prime; sucursal $499 tras 4 meses; términos sin permanencia ni fee de activación, terminación por cualquiera de las partes con aviso de 30 días (https://www.maspedidos.com/terminos-y-condiciones). El flujo depende de WhatsApp del negocio (recomiendan WhatsApp Business). En el demo aparece un flag interno "watermarkHiddenUntil", lo que sugiere marca de agua de Maspedidos en el menú en ciertos casos, pero no encontré documentación pública: sin evidencia concluyente sobre ese punto.

## Anexo B — Research: costos de cobro en México (digest con fuentes)

**1. Terminal física (card-present).** La fuente más autoritativa es Banxico, "Tasas de descuento por giro: Restaurantes" (abril 2026). Crédito, tasa promedio: bancos tradicionales 2.15–2.55% (Banorte 2.24%, Getnet 2.26%, BBVA 2.33%, mínimos negociables hasta 1.76%); agregadores 3.39–3.60% (Mercado Pago 3.39%, Clip 3.53%, Stripe 3.60%) (https://www.banxico.org.mx/servicios/tasas-de-descuento-para-tarjetas-de-credito-por-gi/%7B178DFF29-DA8F-E376-78AC-9B52D36C799F%7D.pdf). Débito: BBVA 1.65%, Getnet 1.79%, Banorte 1.84% vs. Mercado Pago 3.39% y Clip 3.52% (https://www.banxico.org.mx/servicios/tasas-de-descuento-para-tarjetas-de-debito-por-gir/%7BD55B5289-0474-B33F-EA53-212B9EDAAE2D%7D.pdf). Todas las comisiones son +IVA 16%. Equipos: Clip 3.6% + IVA sin renta; Clip Pro 2 a $399 (lista $2,999) (https://shop.clip.mx/products/clip-pro-2). Mercado Pago Point 3.5% + IVA sin renta; Point Mini $99, Point Air $199, Point Smart 2 $549 (listas $499–$4,499) (https://www.mercadopago.com.mx/herramientas-para-vender/lectores-point). Getnet GSmart: $2,500 + IVA compra o $250 + IVA/mes renta (https://ayuda.agendapro.com/es/articles/8491322). BBVA: primera TPV sin costo ni renta, tasa negociada caso por caso (https://www.bbva.mx/empresas/landings/fb-leads-tpv-restaurantes.html); Banamex no publica tasas (cotización personalizada; su adquirencia promedia 2.27% crédito vía EVO según Banxico).

**2. Pago online (card-not-present).** Stripe México: 3.6% + $3 MXN + IVA tarjetas nacionales; +0.5% internacionales, +2% conversión de divisa (https://stripe.com/mx/pricing). Mercado Pago link de pago/checkout: 3.49% + $4 + IVA con liberación al instante; 3.19% + $4 a 7 días; 2.95% + $4 a 30 días (https://www.mercadopago.com.mx/herramientas-para-vender/link-de-pago). Conekta: 3.4% + $3 + IVA tarjeta; efectivo 2.6% + $3; SPEI $12.50 + IVA por transacción (https://www.conekta.com/pricing).

**3. SPEI/CoDi.** CoDi opera sin comisiones, 24x7, sobre rieles SPEI (https://www.banxico.org.mx/sistemas-de-pago/codi-cobro-digital-banco-me.html). Enviar SPEI cuesta $0–$7.50 según banco (BBVA $5, Scotiabank $5, Bajío $7.50; Azteca y Santander $0) según Condusef (https://www.condusef.gob.mx/?p=contenido&idc=2042&idcat=1). Recibir es gratis, pero la fricción es operativa: sin pasarela no hay webhook ni conciliación automática con el POS — hay que verificar comprobantes (CEP, https://www.banxico.org.mx/cep/) a mano; automatizarlo vía pasarela cuesta (Conekta: $12.50 + IVA por SPEI). El costo en horas no está cuantificado en fuentes públicas (sin_evidencia cuantitativa).

**4. Efectivo contraentrega.** Merma en retail México: 1.59% de ventas (dato ANTAD 2024/25, https://blog.storecheck.com.mx/el-impacto-de-las-mermas-en-la-industria-del-retail/). El robo hormiga representa hasta 2.5% de ventas en tiendas departamentales según ANTAD (https://www.milenio.com/sociedad/robo-hormiga-representa-2-5-de-las-ventas-en-tiendas-departamentales) y >$13,000 millones MXN/año en pérdidas, con robo interno de empleados ≈42% del total en la región (https://cuspidemexico.com/2025/09/25/videovigilancia-en-retail-una-herramienta-contra-el-robo-hormiga-y-perdidas-economicas/). Ojo: son cifras de retail/autoservicio; no encontré estudio específico de merma de efectivo en restaurantes/dark kitchens ni un % confiable de "costo de manejo de efectivo" sobre ventas en México (sin_evidencia).

**5. Hora de trabajo.** Salario mínimo 2026 (vigente 1-ene, aplica CDMX zona general): $315.04/día = $9,582.47/mes ≈ $39.4/hora (https://www.gob.mx/conasami/articulos/incremento-a-los-salarios-minimos-para-2026; DOF: https://www.dof.gob.mx/nota_detalle.php?codigo=5775534&fecha=09/12/2025). Cajero en CDMX: $8,985/mes promedio (https://mx.indeed.com/career/cajero/salaries/Ciudad-de-M%C3%A9xico) ≈ $47/h; con carga social estimada ~30% (IMSS/Infonavit/aguinaldo/vacaciones; estimación estándar, no fuente directa) ≈ $60/h. Encargado de restaurante CDMX: $15,811/mes (https://mx.indeed.com/career/encargado-de-restaurante/salaries/Ciudad-de-M%C3%A9xico) ≈ $82/h; cargado ≈ $105/h. Veredicto sobre "$150 MXN/hora": NO es defendible como costo laboral cargado de cajero (~$60/h) ni de encargado (~$105/h); solo se sostiene como costo de oportunidad del dueño/gerente que concilia en vez de vender — y así debe etiquetarse en el brief.

**Claims:** (a) "2–4%" confirmado para crédito y agregadores (Banxico: 2.15–3.60% promedio +IVA), aunque débito bancario baja a 1.49–2.11%. (b) "$500–2,000 por terminal" refutado como rango: hoy las promos permanentes van de $99–$549 (Clip/MP) y los equipos pro/banca cuestan $2,500–$4,499 de lista. (c) "Online ~3.5% + IVA o más" confirmado: MP 3.49% + $4, Stripe 3.6% + $3, Conekta 3.4% + $3, todos +IVA.

## Anexo C — Verificación de los claims del brief original

### Sobre Maspedidos

| Claim del brief | Veredicto | Evidencia |
|---|---|---|
| MásPedidos cobra $0 de comisión en el menú digital propio | **confirmado** | No existe comisión porcentual sobre ventas: el modelo es suscripción ($299-$899 MXN/mes) con cupos de pedidos online (100/300/600/mes) según https://www.maspedidos.com/precios, y su landing se titula 'Sistema de Pedidos por WhatsApp sin Comisiones' (https://www.maspedidos.com/gestion-pedidos/pedidos-por-whatsapp). Matiz: en Prime hay un fee fijo de $1.39 MXN por pedido adicional sobre los 600 incluidos — no es comisión porcentual, pero tampoco es 'ilimitado gratis'. |
| MásPedidos descarga la cobranza al negocio (efectivo contraentrega, transferencias manuales o terminal propia) | **confirmado** | FAQ oficial en https://www.maspedidos.com/menu-digital: 'Efectivo contra entrega, Transferencia bancaria (directo a tu cuenta) o Terminal bancaria (si tus repartidores llevan la terminal física)… nosotros no intermediamos tu dinero'. El demo https://www.maspedidos.menu/ejemplo lo corrobora: flags accepts_cash/card/transfer y datos bancarios del negocio (banco, CLABE, tarjeta) mostrados al comensal para transferencia manual. Sin rastro de Mercado Pago/Stripe/Conekta en el sitio. |
| MásPedidos NO integra Uber/Rappi/Didi (menú digital aislado) | **confirmado** | Ninguna página del sitemap (https://www.maspedidos.com/page-sitemap.xml) menciona integración con agregadores; las únicas menciones de Uber/Rappi/Didi son posts de blog educativos sobre sus comisiones. FAQ: no proporcionan repartidores, el restaurante gestiona su propia logística. Matiz: 'aislado' no es exacto del todo — el menú digital sí está sincronizado con su propio POS/KDS, pero no orquesta agregadores ni ofrece flota tipo Uber Direct. |
| MásPedidos no incluye conciliación automática ni reportes financieros | **refutado** | Sí incluyen arqueo de caja automático ('el sistema calcula automáticamente los montos esperados y detecta faltantes o descuadres al cerrar turno', esperado vs declarado por cajero) y registro de gastos (https://www.maspedidos.com/funcionalidades/corte-de-caja), además de reportes de ventas con desglose por método de pago, ticket promedio y productos top (https://www.maspedidos.com/funcionalidades/estadisticas-y-reportes). Lo que NO tienen es conciliación bancaria/de pasarela — pero porque no procesan pagos online, no por carecer de módulo de reportes. |

### Sobre fees en México

| Claim del brief | Veredicto | Evidencia |
|---|---|---|
| Una terminal/cuenta merchant propia cuesta 2-4% por transacción en México | **confirmado** | Banxico (abril 2026, giro Restaurantes): crédito promedio 2.15-2.55% en bancos y 3.39-3.60% en agregadores (Mercado Pago 3.39%, Clip 3.53%, Stripe 3.60%), todo +IVA 16%. Matiz: débito con bancos tradicionales promedia 1.49-2.11% (BBVA 1.65%), es decir, puede quedar por debajo del rango 2-4%. Fuentes: https://www.banxico.org.mx/servicios/tasas-de-descuento-para-tarjetas-de-credito-por-gi/%7B178DFF29-DA8F-E376-78AC-9B52D36C799F%7D.pdf y https://www.banxico.org.mx/servicios/tasas-de-descuento-para-tarjetas-de-debito-por-gir/%7BD55B5289-0474-B33F-EA53-212B9EDAAE2D%7D.pdf |
| Comprar terminal cuesta ~$500-2,000 MXN | **refutado** | Los precios reales actuales caen fuera de ese rango por ambos lados: promociones permanentes de agregadores van de $99 a $549 (MP Point Mini $99, Point Air $199, Point Smart 2 $549: https://www.mercadopago.com.mx/herramientas-para-vender/lectores-point; Clip Pro 2 $399: https://shop.clip.mx/products/clip-pro-2), mientras los precios de lista/banca son $2,500-$4,499 (Getnet GSmart $2,500 + IVA: https://ayuda.agendapro.com/es/articles/8491322; lista Point Smart 2 $4,499). BBVA regala la primera TPV. Mejor formulación: 'desde ~$100-550 con agregadores, sin renta'. |
| El pago online en México cuesta ~3.5% + IVA o más | **confirmado** | Mercado Pago link de pago con liberación al instante: 3.49% + $4 + IVA (https://www.mercadopago.com.mx/herramientas-para-vender/link-de-pago); Stripe: 3.6% + $3 + IVA, +0.5% internacional (https://stripe.com/mx/pricing); Conekta: 3.4% + $3 + IVA (https://www.conekta.com/pricing). Con el fijo de $3-4 por transacción, el costo efectivo en un ticket típico de delivery (~$250-400) ronda 4.4-5.4% ya con IVA. Solo baja de 3.5% aceptando liberación a 7-30 días en MP. |
| Valuar la hora de conciliación manual a $150 MXN/hora | **refutado** | Como costo laboral cargado no se sostiene: cajero CDMX $8,985/mes (https://mx.indeed.com/career/cajero/salaries/Ciudad-de-M%C3%A9xico) ≈ $47/h, ~$60/h con carga social ~30% (estimación); encargado $15,811/mes (https://mx.indeed.com/career/encargado-de-restaurante/salaries/Ciudad-de-M%C3%A9xico) ≈ $82/h, ~$105/h cargado; salario mínimo 2026 ≈ $39.4/h (https://www.gob.mx/conasami/articulos/incremento-a-los-salarios-minimos-para-2026). $150/h solo es defendible etiquetado explícitamente como costo de oportunidad del dueño/gerente, no como costo de un cajero. |
| Costo de manejo de efectivo como % de ventas en restaurantes México (merma/robo aplicable a dark kitchens) | **sin_evidencia** | Las cifras confiables disponibles son de retail/autoservicio, no de restaurantes: merma 1.59% de ventas (ANTAD 2024/25, https://blog.storecheck.com.mx/el-impacto-de-las-mermas-en-la-industria-del-retail/), robo hormiga hasta 2.5% de ventas en departamentales (https://www.milenio.com/sociedad/robo-hormiga-representa-2-5-de-las-ventas-en-tiendas-departamentales) y >$13,000 mdp/año con 42% de robo interno (https://cuspidemexico.com/2025/09/25/videovigilancia-en-retail-una-herramienta-contra-el-robo-hormiga-y-perdidas-economicas/). No encontré estudio cuantitativo específico del costo de manejar efectivo en restaurantes mexicanos; usar las cifras de retail como proxy, citándolas como tales. |
