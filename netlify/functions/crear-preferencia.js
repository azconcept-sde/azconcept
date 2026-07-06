// netlify/functions/crear-preferencia.js
//
// Crea una preferencia de pago en Mercado Pago usando el Access Token
// (variable de entorno segura). Incluye el orderId como external_reference
// para poder identificar el pedido cuando la clienta vuelve al sitio.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Método no permitido" }) };
  }

  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Falta configurar MP_ACCESS_TOKEN en Netlify" }),
    };
  }

  try {
    const { cart, form, orderId } = JSON.parse(event.body);

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Carrito vacío o inválido" }) };
    }

    const items = cart.map((item) => ({
      title: item.name,
      quantity: item.qty,
      unit_price: Number(item.price),
      currency_id: "ARS",
    }));

    const siteUrl = process.env.URL || "https://azconcept.netlify.app";

    const body = {
      items,
      payer: {
        name: form?.name || undefined,
        email: form?.email || undefined,
      },
      external_reference: orderId || undefined,
      back_urls: {
        success: `${siteUrl}/?pago=exito`,
        failure: `${siteUrl}/?pago=fallo`,
        pending: `${siteUrl}/?pago=pendiente`,
      },
      auto_return: "approved",
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Error de Mercado Pago:", data);
      return {
        statusCode: mpResponse.status,
        body: JSON.stringify({ error: "Error al crear preferencia", detail: data }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ init_point: data.init_point, id: data.id }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Error interno", detail: err.message }) };
  }
};
