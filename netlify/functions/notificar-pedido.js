// netlify/functions/notificar-pedido.js
//
// Envía un email automático avisando que entró un pedido nuevo.
// Usa Resend (resend.com) — tiene plan gratuito.
// Variables de entorno necesarias en Netlify:
//   RESEND_API_KEY  -> tu API key de Resend
//   OWNER_EMAIL_1   -> email de una de las dueñas
//   OWNER_EMAIL_2   -> email de la otra dueña (opcional)

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Método no permitido" }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const to = [process.env.OWNER_EMAIL_1, process.env.OWNER_EMAIL_2].filter(Boolean);

  if (!RESEND_API_KEY || to.length === 0) {
    console.error("Falta configurar RESEND_API_KEY y/o OWNER_EMAIL_1/2 en Netlify");
    return { statusCode: 200, body: JSON.stringify({ skipped: true }) };
  }

  try {
    const { order, shipping } = JSON.parse(event.body);

    const itemsHtml = (order?.items || [])
      .map(it => `<li>${it.qty} x ${it.name} — ${new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS"}).format(it.price)}</li>`)
      .join("");

    const html = `
      <h2>🛍️ Nuevo pedido en AZ Concept</h2>
      <p><strong>Total:</strong> ${new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS"}).format(order?.total || 0)}</p>
      <p><strong>Método de pago:</strong> ${order?.payment_method || "-"}</p>
      <p><strong>Cliente:</strong> ${order?.customer_name || "-"} · ${order?.customer_email || "-"} · ${order?.customer_whatsapp || "-"}</p>
      <h3>Productos</h3>
      <ul>${itemsHtml}</ul>
      <h3>Datos de envío / facturación</h3>
      <p>
        Domicilio: ${shipping?.address || "-"}<br/>
        Localidad: ${shipping?.locality || "-"}<br/>
        Provincia: ${shipping?.province || "-"}<br/>
        Código Postal: ${shipping?.postalCode || "-"}<br/>
        DNI: ${shipping?.dni || "-"}<br/>
        WhatsApp: ${shipping?.whatsapp || "-"}
      </p>
    `;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AZ Concept <onboarding@resend.dev>",
        to,
        subject: "🛍️ Nuevo pedido en AZ Concept",
        html,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("Error de Resend:", errText);
      return { statusCode: 200, body: JSON.stringify({ sent: false }) };
    }

    return { statusCode: 200, body: JSON.stringify({ sent: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 200, body: JSON.stringify({ sent: false, error: err.message }) };
  }
};
