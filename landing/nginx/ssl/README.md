# SSL Certificates

Place your production certificate and key in this directory **on the server before building the image**. The Docker build copies everything from `landing/nginx/ssl` into `/etc/nginx/ssl` inside the container.

Expected filenames (can be overridden with env vars):

- `terracontrolgt.com.crt` (full chain)
- `terracontrolgt.com.key` (private key)

> ⚠️ Do **not** commit real certificates to version control. `.gitignore` ignores `landing/nginx/ssl/*.crt` and `.key` files.
