import { Buffer } from 'node:buffer';
import console from 'node:console';
import { createHash, timingSafeEqual } from 'node:crypto';
import process from 'node:process';
import cors from 'cors';
import express from 'express';
import {
  calculateJwkThumbprint,
  createRemoteJWKSet,
  decodeProtectedHeader,
  importJWK,
  jwtVerify,
} from 'jose';

const port = 3000;
const proofMaxAgeSeconds = 300;
const replayCacheLimit = 10_000;
const configuredApiOrigin = new URL(
  process.env.API_EXTERNAL_ORIGIN ?? 'https://api.fusionauth-dpop.orb.local',
);
if (
  configuredApiOrigin.protocol !== 'https:' ||
  configuredApiOrigin.pathname !== '/' ||
  configuredApiOrigin.search ||
  configuredApiOrigin.hash
) {
  throw new Error('API_EXTERNAL_ORIGIN must be an HTTPS origin');
}
const apiOrigin = configuredApiOrigin.origin;
const issuer = process.env.EXPECTED_ISSUER ?? 'https://example.com';
const audiences = [
  process.env.REACT_CLIENT_ID,
  process.env.VUE_CLIENT_ID,
  process.env.ANGULAR_CLIENT_ID,
].filter(Boolean);
const allowedOrigins = [
  'https://react.fusionauth-dpop.orb.local',
  'https://vue.fusionauth-dpop.orb.local',
  'https://angular.fusionauth-dpop.orb.local',
];
const jwksUrl =
  process.env.FUSIONAUTH_JWKS_URL ??
  'http://host.orb.internal:9011/.well-known/jwks.json';
const jwks = createRemoteJWKSet(new URL(jwksUrl));
const replayCache = new Map();
let requestSequence = 0;

function log(requestId, message, value) {
  const prefix = `[DPoP request ${requestId}] ${message}`;
  if (value === undefined) {
    console.log(prefix);
  } else {
    console.log(prefix, value);
  }
}

function constantTimeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function externalRequestUrl(request) {
  return `${apiOrigin}${request.path}`;
}

function rejectReplay(thumbprint, jti, now, requestId) {
  log(requestId, 'Replay cache before pruning', {
    size: replayCache.size,
    thumbprint,
    jti,
    now,
  });
  for (const [key, expiresAt] of replayCache) {
    if (expiresAt <= now) {
      log(requestId, 'Pruning expired replay entry', { key, expiresAt });
      replayCache.delete(key);
    }
  }

  const key = `${thumbprint}:${jti}`;
  if (replayCache.has(key)) {
    log(requestId, 'Replay detected', { key, expiresAt: replayCache.get(key) });
    throw new Error('Replayed proof');
  }
  if (replayCache.size >= replayCacheLimit) {
    const oldestKey = replayCache.keys().next().value;
    log(requestId, 'Replay cache full; evicting oldest entry', oldestKey);
    replayCache.delete(oldestKey);
  }
  replayCache.set(key, now + proofMaxAgeSeconds * 1000);
  log(requestId, 'Proof added to replay cache', {
    key,
    expiresAt: replayCache.get(key),
    size: replayCache.size,
  });
}

async function validateDpop(request, requestId) {
  const authorization = request.get('authorization') ?? '';
  const match = authorization.match(/^DPoP ([^\s]+)$/i);
  const proof = request.get('dpop');
  log(requestId, 'Incoming request', {
    method: request.method,
    originalUrl: request.originalUrl,
    path: request.path,
    protocol: request.protocol,
    hostname: request.hostname,
    host: request.get('host'),
    ip: request.ip,
    headers: request.headers,
  });
  log(requestId, 'Raw Authorization header', authorization);
  log(requestId, 'Raw DPoP proof', proof);
  log(requestId, 'Credential parsing', {
    authorizationMatched: Boolean(match),
    proofPresent: Boolean(proof),
  });
  if (!match || !proof) {
    throw new Error('Missing credentials');
  }
  const accessToken = match[1];
  log(requestId, 'Raw access token', accessToken);
  log(requestId, 'Starting access-token JWT verification', {
    issuer,
    audiences,
  });

  const { payload: tokenPayload } = await jwtVerify(accessToken, jwks, {
    audience: audiences,
    issuer,
  });
  log(requestId, 'Access-token JWT verification succeeded', tokenPayload);

  const proofHeader = decodeProtectedHeader(proof);
  log(requestId, 'Decoded DPoP protected header', proofHeader);
  log(requestId, 'Proof-header checks', {
    typActual: proofHeader.typ,
    typExpected: 'dpop+jwt',
    algActual: proofHeader.alg,
    algExpected: 'ES256',
    jwkPresent: Boolean(proofHeader.jwk),
    ktyActual: proofHeader.jwk?.kty,
    ktyExpected: 'EC',
    crvActual: proofHeader.jwk?.crv,
    crvExpected: 'P-256',
    containsPrivateKey: Boolean(proofHeader.jwk && 'd' in proofHeader.jwk),
  });
  if (
    proofHeader.typ?.toLowerCase() !== 'dpop+jwt' ||
    proofHeader.alg !== 'ES256' ||
    !proofHeader.jwk ||
    proofHeader.jwk.kty !== 'EC' ||
    proofHeader.jwk.crv !== 'P-256' ||
    'd' in proofHeader.jwk
  ) {
    throw new Error('Invalid proof header');
  }

  log(requestId, 'Importing proof public key');
  const proofKey = await importJWK(proofHeader.jwk, 'ES256');
  log(requestId, 'Starting DPoP proof signature verification', {
    algorithms: ['ES256'],
    clockTolerance: 5,
    maxTokenAgeSeconds: proofMaxAgeSeconds,
  });
  const { payload: proofPayload } = await jwtVerify(proof, proofKey, {
    algorithms: ['ES256'],
    clockTolerance: 5,
    maxTokenAge: `${proofMaxAgeSeconds} seconds`,
  });
  log(requestId, 'DPoP proof signature verification succeeded', proofPayload);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const expectedHtu = externalRequestUrl(request);
  log(requestId, 'Proof-claim checks', {
    htmActual: proofPayload.htm,
    htmExpected: request.method,
    htmMatches: proofPayload.htm === request.method,
    htuActual: proofPayload.htu,
    htuExpected: expectedHtu,
    htuMatches: proofPayload.htu === expectedHtu,
    iatActual: proofPayload.iat,
    nowSeconds,
    iatAgeSeconds:
      typeof proofPayload.iat === 'number'
        ? nowSeconds - proofPayload.iat
        : undefined,
    iatIsInteger: Number.isInteger(proofPayload.iat),
    iatWithinMaxAge:
      Number.isInteger(proofPayload.iat) &&
      Math.abs(nowSeconds - proofPayload.iat) <= proofMaxAgeSeconds,
    jtiActual: proofPayload.jti,
    jtiValid:
      typeof proofPayload.jti === 'string' && proofPayload.jti.length > 0,
    athActual: proofPayload.ath,
    athIsString: typeof proofPayload.ath === 'string',
    nonceActual: proofPayload.nonce,
  });
  if (
    proofPayload.htm !== request.method ||
    proofPayload.htu !== expectedHtu ||
    !Number.isInteger(proofPayload.iat) ||
    Math.abs(nowSeconds - proofPayload.iat) > proofMaxAgeSeconds ||
    typeof proofPayload.jti !== 'string' ||
    proofPayload.jti.length === 0 ||
    typeof proofPayload.ath !== 'string'
  ) {
    throw new Error('Invalid proof claims');
  }

  const expectedAth = createHash('sha256')
    .update(accessToken)
    .digest('base64url');
  log(requestId, 'Access-token hash check', {
    athActual: proofPayload.ath,
    athExpected: expectedAth,
    matches: constantTimeEqual(proofPayload.ath, expectedAth),
  });
  if (!constantTimeEqual(proofPayload.ath, expectedAth)) {
    throw new Error('Invalid token hash');
  }

  const thumbprint = await calculateJwkThumbprint(proofHeader.jwk, 'sha256');
  log(requestId, 'Token-binding check', {
    cnfActual: tokenPayload.cnf,
    jktActual: tokenPayload.cnf?.jkt,
    proofJwkThumbprintExpected: thumbprint,
    matches:
      typeof tokenPayload.cnf?.jkt === 'string' &&
      constantTimeEqual(tokenPayload.cnf.jkt, thumbprint),
  });
  if (
    typeof tokenPayload.cnf !== 'object' ||
    tokenPayload.cnf === null ||
    typeof tokenPayload.cnf.jkt !== 'string' ||
    !constantTimeEqual(tokenPayload.cnf.jkt, thumbprint)
  ) {
    throw new Error('Invalid token binding');
  }

  rejectReplay(thumbprint, proofPayload.jti, Date.now(), requestId);
  log(requestId, 'All JWT and DPoP validation checks passed');
}

const app = express();
app.disable('x-powered-by');
app.use(
  cors({
    allowedHeaders: ['Authorization', 'Content-Type', 'DPoP'],
    methods: ['GET', 'OPTIONS'],
    origin: allowedOrigins,
  }),
);

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/resource', async (request, response) => {
  const requestId = ++requestSequence;
  log(requestId, '----- BEGIN /resource validation -----');
  response.set('Cache-Control', 'no-store');
  try {
    await validateDpop(request, requestId);
    log(requestId, 'Returning 200 protected resource response');
    response.json({ message: 'DPoP-protected resource reached' });
  } catch (error) {
    log(requestId, 'Validation failed', {
      name: error?.name,
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });
    log(requestId, 'Returning 401 invalid_dpop_request');
    response.status(401).json({ error: 'invalid_dpop_request' });
  } finally {
    log(requestId, '----- END /resource validation -----');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`DPoP resource server listening on port ${port}`);
  console.log('DPoP resource server validation configuration', {
    apiOrigin,
    issuer,
    audiences,
    allowedOrigins,
    jwksUrl,
    proofMaxAgeSeconds,
    replayCacheLimit,
  });
  console.warn(
    'DEV DIAGNOSTICS ENABLED: raw Authorization headers, access tokens, and DPoP proofs are logged.',
  );
});
