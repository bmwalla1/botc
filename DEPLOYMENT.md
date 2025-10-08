# Deployment Guide for Home Server

This guide will help you deploy the Blood on the Clocktower Script Builder to your home server.

## Prerequisites

### On Your Home Server

1. **Node.js** (version 16 or higher)
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Or using Node Version Manager (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **Git** (to clone the repository)
   ```bash
   sudo apt update
   sudo apt install git
   ```

3. **PM2** (will be installed by the deployment script)
   ```bash
   npm install -g pm2
   ```

4. **Serve** (will be installed by the deployment script)
   ```bash
   npm install -g serve
   ```

## Deployment Steps

### 1. Clone the Repository

```bash
# Clone your repository to your server
git clone <your-repo-url> botc-script-builder
cd botc-script-builder
```

### 2. Run the Deployment Script

```bash
# Make the script executable and run it
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Install all dependencies
- Build the frontend for production
- Set up PM2 process manager
- Start both frontend and backend services
- Configure automatic startup

### 3. Configure Firewall (if needed)

```bash
# Allow traffic on ports 3000 and 3001
sudo ufw allow 3000
sudo ufw allow 3001

# Or if using iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
```

### 4. Set Up Reverse Proxy (Optional but Recommended)

If you want to use a domain name and HTTPS, set up Nginx:

```bash
# Install Nginx
sudo apt install nginx

# Create configuration file
sudo nano /etc/nginx/sites-available/botc
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/botc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Accessing Your Application

- **Local access**: http://your-server-ip:3000
- **With domain**: http://your-domain.com (if reverse proxy is set up)

## Management Commands

### PM2 Commands
```bash
pm2 status              # Check process status
pm2 logs                # View all logs
pm2 logs botc-backend   # View backend logs only
pm2 logs botc-frontend  # View frontend logs only
pm2 restart all         # Restart all processes
pm2 stop all            # Stop all processes
pm2 start all           # Start all processes
pm2 monit               # Monitor processes in real-time
```

### Updating the Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
./deploy.sh
```

### Backup Data
```bash
# Backup the scripts database
cp server/data/scripts.json /path/to/backup/scripts-$(date +%Y%m%d).json

# Or create a backup script
echo "#!/bin/bash" > backup.sh
echo "cp server/data/scripts.json /backup/scripts-\$(date +%Y%m%d).json" >> backup.sh
chmod +x backup.sh
```

## Troubleshooting

### Check if services are running
```bash
pm2 status
```

### View logs for errors
```bash
pm2 logs --lines 50
```

### Check port usage
```bash
sudo netstat -tlnp | grep :300
```

### Restart services
```bash
pm2 restart all
```

### Check system resources
```bash
pm2 monit
```

## Security Considerations

1. **Firewall**: Only open necessary ports (3000, 3001)
2. **HTTPS**: Use Let's Encrypt with Nginx for HTTPS
3. **Updates**: Keep your system and Node.js updated
4. **Backups**: Regularly backup the `server/data/scripts.json` file
5. **User permissions**: Run PM2 as a non-root user

## Environment Variables

You can customize the deployment by setting environment variables:

```bash
# Set custom data directory
export DATA_DIR=/var/lib/botc/data

# Set custom port
export PORT=3001

# Then run deployment
./deploy.sh
```

## Monitoring

Consider setting up monitoring for your application:

1. **PM2 Plus** (free tier available)
2. **System monitoring** with tools like htop, iotop
3. **Log rotation** to prevent disk space issues

```bash
# Install logrotate for PM2 logs
sudo apt install logrotate
```

Create `/etc/logrotate.d/pm2`:
```
/var/log/pm2/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
```
