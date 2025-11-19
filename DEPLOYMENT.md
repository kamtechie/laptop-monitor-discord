# Deployment Setup Guide

## GitHub Actions Secrets

To set up the deployment pipeline, add the following secrets to your GitHub repository:

### Tailscale Configuration
1. **TAILSCALE_OAUTH_CLIENT_ID** and **TAILSCALE_OAUTH_SECRET**
   - Go to https://login.tailscale.com/admin/settings/oauth
   - Create an OAuth client
   - Copy the client ID and secret

### SSH Deployment
2. **SERVER_HOST**
   - Your Tailscale IP or hostname (e.g., `100.x.x.x` or `laptop.your-tailnet.ts.net`)

3. **SERVER_USER**
   - SSH user on your home server (e.g., `ubuntu`, `pi`, `kamtechie`)

4. **DEPLOY_KEY**
   - SSH private key for authentication
   - Generate with: `ssh-keygen -t ed25519 -f deploy_key -N ""`
   - Add the public key to `~/.ssh/authorized_keys` on your server
   - Add the private key content to GitHub Secrets

## Home Server Setup

### Prerequisites
- Docker and Docker Compose installed
- Git installed
- SSH server running
- Tailscale installed and connected

### Initial Setup
```bash
# Clone the repo
cd ~
git clone https://github.com/kamtechie/laptop-monitor-discord.git
cd laptop-monitor-discord

# Create .env file with your Discord credentials
cat > .env << 'EOF'
DISCORD_TOKEN=your_token_here
CLIENT_ID=your_client_id_here
ALERT_CHANNEL_ID=your_channel_id_here
NODE_ENV=production
EOF

# Start the bot
docker-compose up -d
```

### Monitoring
```bash
# Check logs
docker-compose logs -f bot

# Check container status
docker-compose ps

# Restart if needed
docker-compose restart bot
```

## How It Works

1. **Push to main** triggers the workflow
2. **Tailscale connects** GitHub Actions to your home network
3. **SSH deploys** via your Tailscale IP
4. **Docker rebuilds** and deploys the new version
5. **Verification logs** confirm success

## Troubleshooting

### SSH Connection Failed
- Verify Tailscale is running on your server: `tailscale status`
- Check SSH key permissions: `ls -la ~/.ssh/authorized_keys`
- Test SSH manually: `ssh -i deploy_key user@100.x.x.x`

### Docker Compose Up Fails
- Check `.env` file exists and has valid Discord credentials
- Review logs: `docker-compose logs bot`
- Ensure `/sys` is accessible (for power monitoring)

### Tailscale Connection Issues
- Regenerate OAuth credentials in Tailscale admin panel
- Check GitHub Actions logs for detailed errors
