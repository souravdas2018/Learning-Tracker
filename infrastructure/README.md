# Infrastructure Configuration

This directory contains infrastructure configuration files for the Learning Tracker application, including load balancer setup.

## Load Balancer Configuration

### Nginx Load Balancer

The `nginx.conf` file provides a production-ready Nginx load balancer configuration that:

- Distributes traffic across multiple backend instances (round-robin)
- Provides health checks and failover
- Includes compression and caching
- Supports SSL/TLS termination
- Handles WebSocket connections
- Includes proper logging and monitoring

### Setup Instructions

1. **Install Nginx** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install nginx
   
   # macOS (using Homebrew)
   brew install nginx
   
   # CentOS/RHEL
   sudo yum install nginx
   ```

2. **Configure Backend Instances**:
   - Start multiple backend instances on different ports (5500, 5501, 5502)
   - Update the upstream servers in `nginx.conf` to match your setup

3. **Copy Configuration**:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/learning-tracker
   sudo ln -s /etc/nginx/sites-available/learning-tracker /etc/nginx/sites-enabled/
   ```

4. **Test Configuration**:
   ```bash
   sudo nginx -t
   ```

5. **Start/Reload Nginx**:
   ```bash
   sudo systemctl start nginx
   # Or to reload after changes
   sudo systemctl reload nginx
   ```

### Load Balancing Methods

The configuration uses **round-robin** by default. You can change this to:

- **least_conn**: Directs traffic to the server with the fewest active connections
- **ip_hash**: Provides session persistence based on client IP address

Example:
```nginx
upstream learning_tracker_backend {
    least_conn;  # Change from round-robin
    server localhost:5500;
    server localhost:5501;
}
```

### Scaling

To add more backend instances:

1. Start a new backend instance on a new port
2. Add it to the upstream block in `nginx.conf`
3. Reload Nginx: `sudo systemctl reload nginx`

### Health Checks

The configuration includes:
- `max_fails`: Maximum number of failed requests (3)
- `fail_timeout`: Time to wait before retrying a failed server (30s)

Servers that fail health checks are automatically removed from the pool.

### Monitoring

- Access logs: `/var/log/nginx/learning-tracker-access.log`
- Error logs: `/var/log/nginx/learning-tracker-error.log`
- Health endpoint: `http://your-domain/health`

### SSL/TLS Setup

1. Obtain SSL certificates (Let's Encrypt, etc.)
2. Uncomment the HTTPS server block in `nginx.conf`
3. Update certificate paths
4. Reload Nginx

### Production Considerations

- Use environment-specific configurations
- Set up proper firewall rules
- Configure rate limiting
- Enable log rotation
- Set up monitoring and alerting
- Use proper SSL/TLS certificates
- Configure backup and disaster recovery
