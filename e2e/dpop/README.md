# Manual DPoP browser demo

This fixture builds the React, Vue, and Angular SDKs from this checkout, then
serves three minimal browser apps and one DPoP-protected Express API through
OrbStack. OrbStack terminates TLS.

## Configure and start

Prerequisites: OrbStack with Docker Compose, and FusionAuth available at
`https://local.fusionauth.io`.

Create three public FusionAuth applications with Authorization Code and Refresh
Token grants, client authentication disabled, PKCE required with S256, and
asymmetric access-token signing. Use each app URL below as its exact authorized
redirect and logout URL. Add all three origins to FusionAuth CORS and allow the
`Authorization`, `Content-Type`, and `DPoP` headers with `GET`, `POST`, and
`OPTIONS` methods.

```bash
cd e2e/dpop
cp .env.example .env
# Edit .env with the three public client IDs.
docker compose build
docker compose up -d
docker compose ps
```

Open:

- https://react.fusionauth-dpop.orb.local
- https://vue.fusionauth-dpop.orb.local
- https://angular.fusionauth-dpop.orb.local
- https://api.fusionauth-dpop.orb.local/health

In each app, click **Login**, authenticate, click **Call resource server**, and
confirm the protected response. Click **Logout** to finish.

Stop the fixture with:

```bash
docker compose down
```

The `.env` values are public identifiers, but `.env` is local configuration and
must not contain secrets.

