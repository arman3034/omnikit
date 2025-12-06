#!/bin/bash

# OmniKit Deployment Script
# Path: /var/www/omnikit/deploy.sh
set -e  # Exit on any error

# Configuration
PROJECT_DIR="/var/www/omnikit"
LOG_FILE="/var/www/omnikit/deploy.log"
APACHE_USER="www-data"

# Setup logging (keeps last 10 entries)
setup_logging() {
    touch "$LOG_FILE"
    if [ $(wc -l < "$LOG_FILE") -gt 10 ]; then
        tail -n 10 "$LOG_FILE" > "$LOG_FILE.tmp"
        mv "$LOG_FILE.tmp" "$LOG_FILE"
    fi
    echo "--- $(date) ---" >> "$LOG_FILE"
}

log() {
    echo "$1" | tee -a "$LOG_FILE"
}

# Check Git status - FIXED: Ensures we are on 'main' branch first.
check_git_updates() {
    echo "Checking GitHub for updates..."
    # CRITICAL FIX: Switch to main branch to avoid "detached HEAD"
    git checkout main -q

    if ! git fetch origin 2>/dev/null; then
        echo "Error: Cannot connect to GitHub."
        return 2
    fi

    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)

    if [ "$LOCAL" = "$REMOTE" ]; then
        echo "Already up to date with GitHub."
        return 1
    else
        # Note: This line might show an empty count but is not critical.
        COMMIT_COUNT=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "")
        echo "Updates available ($COMMIT_COUNT new commits)."
        echo "Pulling latest changes..."
        return 0
    fi
}

# Main deployment process
main() {
    cd "$PROJECT_DIR" || { echo "Error: Cannot access $PROJECT_DIR"; exit 1; }

    setup_logging
    log "Starting deployment..."

    # Step 1: Git updates
    if check_git_updates; then
        if git pull origin main; then
            LAST_COMMIT_HASH=$(git log -1 --format="%h")
            echo "✓ Pull successful (commit: $LAST_COMMIT_HASH)"
            log "Git pull completed: $LAST_COMMIT_HASH"
        else
            echo "Error: Git pull failed."
            log "Git pull failed"
            exit 1
        fi
    elif [ $? -eq 2 ]; then
        exit 1
    fi

    # Step 2: Dependency check - FIXED: Always install for a reliable build.
    echo "Installing production dependencies..."
    if npm install --omit=dev; then
        echo "✓ Dependencies installed"
        log "npm install completed"
    else
        echo "Error: Dependency installation failed."
        log "npm install failed"
        exit 1
    fi

    # Step 3: Build
    echo "Building application..."
    if [ -d "dist" ]; then
        # Uses sudo to remove old www-data owned files
        sudo rm -rf dist
    fi

    if npm run build; then
        echo "✓ Build complete"
        log "Build completed"
    else
        echo "Error: Build failed."
        log "Build failed"
        exit 1
    fi

    # Step 4: Cleanup
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        echo "Cleaned up node_modules"
    fi

    # Step 5: Deploy
    echo "Setting permissions..."
    if sudo chown -R $APACHE_USER:$APACHE_USER "dist"; then
        echo "Restarting Apache..."
        if sudo systemctl restart apache2; then
            echo "✓ Deployment successful!"
            echo "Your app is now live at: http://141.98.199.225/omnikit"
            log "Deployment completed successfully"
        else
            echo "Error: Failed to restart Apache."
            log "Apache restart failed"
            exit 1
        fi
    else
        echo "Error: Permission update failed."
        log "chown failed"
        exit 1
    fi
}

# Run with error trapping
trap 'echo "Script interrupted."; exit 1' INT TERM
main
