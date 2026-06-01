# SSL Certificates

This directory is now only a fallback for local or manual certificates.

In production, the container expects Let's Encrypt files to be mounted at runtime from `/etc/letsencrypt/live/...`, and the `certbot` service handles issuance and renewal automatically.

Expected filenames (can be overridden with env vars):

- `terracontrolgt.com.crt` (full chain)
- `terracontrolgt.com.key` (private key)

> ⚠️ Do **not** commit real certificates to version control. `.gitignore` ignores `landing/nginx/ssl/*.crt` and `.key` files.
