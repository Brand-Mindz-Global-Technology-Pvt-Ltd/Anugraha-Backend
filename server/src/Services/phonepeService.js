const SANDBOX_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const PRODUCTION_BASE_URL = "https://api.phonepe.com/apis/pg";

let cachedAccessToken = null;
let cachedAccessTokenExpiresAt = 0;
let accessTokenRequest = null;

export class PhonePeApiError extends Error {
  constructor(message, statusCode = null) {
    super(message);
    this.name = "PhonePeApiError";
    this.statusCode = statusCode;
  }
}

const getConfig = () => {
  const {
    PHONEPE_CLIENT_ID: clientId,
    PHONEPE_CLIENT_SECRET: clientSecret,
    PHONEPE_CLIENT_VERSION: clientVersion,
    PHONEPE_ENVIRONMENT: environment,
    PHONEPE_REDIRECT_URL: redirectUrl,
  } = process.env;

  if (
    !clientId ||
    !clientSecret ||
    !clientVersion ||
    !["sandbox", "production"].includes(environment) ||
    !redirectUrl
  ) {
    throw new PhonePeApiError(
      "PhonePe is not configured. Set its credentials, environment, and redirect URL.",
      503
    );
  }

  let parsedRedirectUrl;
  try {
    parsedRedirectUrl = new URL(redirectUrl);
  } catch {
    throw new PhonePeApiError("PHONEPE_REDIRECT_URL must be an absolute URL.", 503);
  }
  if (!["http:", "https:"].includes(parsedRedirectUrl.protocol)) {
    throw new PhonePeApiError("PHONEPE_REDIRECT_URL must use HTTP or HTTPS.", 503);
  }
  if (environment === "production" && parsedRedirectUrl.protocol !== "https:") {
    throw new PhonePeApiError(
      "PHONEPE_REDIRECT_URL must use HTTPS in production.",
      503
    );
  }

  return {
    clientId,
    clientSecret,
    clientVersion,
    environment,
    redirectUrl: parsedRedirectUrl,
    baseUrl:
      environment === "sandbox" ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL,
  };
};

export const assertPhonePeConfigured = () => {
  getConfig();
};

const readJsonResponse = async (response, operation) => {
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new PhonePeApiError(
      `PhonePe ${operation} returned an invalid response.`,
      response.status
    );
  }

  if (!response.ok) {
    throw new PhonePeApiError(
      `PhonePe ${operation} failed with HTTP ${response.status}.`,
      response.status
    );
  }

  return payload;
};

export const getPhonePeAccessToken = async () => {
  const config = getConfig();
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessTokenExpiresAt > now + 60) {
    return cachedAccessToken;
  }
  if (accessTokenRequest) return accessTokenRequest;

  accessTokenRequest = (async () => {
    const tokenUrl =
      config.environment === "sandbox"
        ? `${SANDBOX_BASE_URL}/v1/oauth/token`
        : "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";
    const body = new URLSearchParams({
      client_id: config.clientId,
      client_version: config.clientVersion,
      client_secret: config.clientSecret,
      grant_type: "client_credentials",
    });

    let response;
    try {
      response = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new PhonePeApiError("Unable to reach PhonePe authorization API.");
    }

    const payload = await readJsonResponse(response, "authorization");
    if (
      typeof payload.access_token !== "string" ||
      !Number.isFinite(payload.expires_at) ||
      payload.token_type !== "O-Bearer"
    ) {
      throw new PhonePeApiError(
        "PhonePe authorization response is missing required token fields."
      );
    }

    cachedAccessToken = payload.access_token;
    cachedAccessTokenExpiresAt = payload.expires_at;
    return cachedAccessToken;
  })();

  try {
    return await accessTokenRequest;
  } finally {
    accessTokenRequest = null;
  }
};

const phonePeHeaders = (accessToken) => ({
  Authorization: `O-Bearer ${accessToken}`,
  "Content-Type": "application/json",
});

const getRedirectUrl = (baseUrl, merchantOrderId) => {
  const redirectUrl = new URL(baseUrl);
  redirectUrl.searchParams.set("merchantOrderId", merchantOrderId);
  return redirectUrl.toString();
};

export const createPhonePePayment = async (
  accessToken,
  { merchantOrderId, amount }
) => {
  const config = getConfig();
  let response;
  try {
    response = await fetch(`${config.baseUrl}/checkout/v2/pay`, {
      method: "POST",
      headers: phonePeHeaders(accessToken),
      body: JSON.stringify({
        merchantOrderId,
        amount,
        paymentFlow: {
          type: "PG_CHECKOUT",
          merchantUrls: {
            redirectUrl: getRedirectUrl(
              config.redirectUrl.toString(),
              merchantOrderId
            ),
          },
        },
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new PhonePeApiError("Unable to reach PhonePe payment API.");
  }

  const payload = await readJsonResponse(response, "payment initiation");
  if (
    typeof payload.redirectUrl !== "string" ||
    typeof payload.orderId !== "string"
  ) {
    throw new PhonePeApiError(
      "PhonePe payment response is missing its order or checkout URL."
    );
  }

  let checkoutUrl;
  try {
    checkoutUrl = new URL(payload.redirectUrl);
  } catch {
    throw new PhonePeApiError("PhonePe returned an invalid checkout URL.");
  }
  if (checkoutUrl.protocol !== "https:") {
    throw new PhonePeApiError("PhonePe returned a non-HTTPS checkout URL.");
  }

  return { orderId: payload.orderId, redirectUrl: checkoutUrl.toString() };
};

export const getPhonePeOrderStatus = async (
  accessToken,
  merchantOrderId
) => {
  const config = getConfig();
  const url = new URL(
    `${config.baseUrl}/checkout/v2/order/${encodeURIComponent(
      merchantOrderId
    )}/status`
  );
  url.searchParams.set("details", "false");

  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: phonePeHeaders(accessToken),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new PhonePeApiError("Unable to reach PhonePe order-status API.");
  }

  const payload = await readJsonResponse(response, "order status");
  if (
    typeof payload.state !== "string" ||
    !Number.isSafeInteger(payload.amount)
  ) {
    throw new PhonePeApiError(
      "PhonePe order-status response is missing required fields."
    );
  }

  return payload;
};
