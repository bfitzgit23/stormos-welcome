# PKGBUILD
# Maintainer: StormOS Team <stormos@example.com>

pkgname=stormos-welcome
pkgver=2.0.0
pkgrel=2
pkgdesc="Modern welcome + software center for StormOS - Electron version"
arch=('x86_64')
url="https://github.com/stormos/stormos-welcome"
license=('MIT')
depends=(
    'electron'
    'xfce4-terminal'
    'polkit'
)
makedepends=(
    'npm'
    'nodejs'
)
optdepends=(
    'yay: AUR support'
    'flatpak: Flatpak support'
    'snapd: Snap support'
    'calamares: GUI installer'
    'reflector: Mirror ranking'
    'pacman-contrib: Cache cleaning'
)

# Source the application files directly
source=(
    "main.js"
    "style.css"
    "index.html"
    "package.json"
    "renderer.js"
)
sha256sums=('c37e9138210e97111c53af635d15a4a2e8637e082a8dc90ee89fad9a51f4ccdc'
            '4a423e0d1204f44cd73a4229fbae52a36f3aa33bc74d42aac88c4f5602a42b4d'
            'fedde903fd089609306aeaa23c59054a74b87da0b286483ba0f91b8d3d7762bc'
            '75ef1a29db53811c36238d5acaaf1fcec13b8dbba3dea49d1a0766d5bbbfcc1c'
            '4e225ea36bda6ece4d07f84abffbeed3b99ab0448b572740d783dc063d899602')

prepare() {
    # Create a minimal package.json for production (no electron dependency)
    cat > package.json.prod << 'EOF'
{
  "name": "stormos-welcome",
  "version": "2.0.0",
  "description": "Modern welcome and software center for StormOS",
  "main": "main.js",
  "author": "StormOS Team <stormos@example.com>",
  "license": "MIT",
  "dependencies": {}
}
EOF
}

package() {
    # Create application directory
    install -dm755 "${pkgdir}/usr/lib/${pkgname}"
    
    # Copy application source files (NO node_modules)
    install -Dm644 main.js "${pkgdir}/usr/lib/${pkgname}/"
    install -Dm644 style.css "${pkgdir}/usr/lib/${pkgname}/"
    install -Dm644 index.html "${pkgdir}/usr/lib/${pkgname}/"
    install -Dm644 renderer.js "${pkgdir}/usr/lib/${pkgname}/" 
    install -Dm644 package.json.prod "${pkgdir}/usr/lib/${pkgname}/package.json"
    
    # Copy build directory if it exists (for icons)
    if [ -d "build" ]; then
        cp -r build "${pkgdir}/usr/lib/${pkgname}/"
    fi
    
    # Create launcher script
    install -dm755 "${pkgdir}/usr/bin"
    cat > "${pkgdir}/usr/bin/${pkgname}" << 'EOF'
#!/bin/bash
# Find electron executable
ELECTRON=""
for e in /usr/lib/electron/electron /usr/bin/electron; do
    if [ -x "$e" ]; then
        ELECTRON="$e"
        break
    fi
done

if [ -z "$ELECTRON" ]; then
    echo "Error: Electron not found. Please install electron package."
    exit 1
fi

APP_DIR="/usr/lib/stormos-welcome"
exec "$ELECTRON" "$APP_DIR" "$@"
EOF
    chmod +x "${pkgdir}/usr/bin/${pkgname}"
    
    # Desktop entry (for menu launcher)
    install -dm755 "${pkgdir}/usr/share/applications"
    cat > "${pkgdir}/usr/share/applications/${pkgname}.desktop" << 'EOF'
[Desktop Entry]
Type=Application
Name=StormOS Welcome
Comment=Modern welcome and software center for StormOS
Exec=stormos-welcome
Icon=storm\ os
Terminal=false
Categories=System;Settings;
StartupNotify=true
X-GNOME-Autostart-enabled=true
EOF

    # AUTOSTART ENTRY - This is what makes it launch on login
    # Install to system-wide autostart (for all users)
    install -dm755 "${pkgdir}/etc/xdg/autostart"
    cat > "${pkgdir}/etc/xdg/autostart/${pkgname}.desktop" << 'EOF'
[Desktop Entry]
Type=Application
Name=StormOS Welcome
Comment=StormOS welcome screen (first boot helper)
Exec=stormos-welcome
Icon=storm\ os
Terminal=false
Categories=System;
X-GNOME-Autostart-enabled=true
X-GNOME-Autostart-Phase=Application
X-KDE-autostart-after=panel
EOF

    # Also install to user autostart template (will be copied to new users)
    install -dm755 "${pkgdir}/etc/skel/.config/autostart"
    cat > "${pkgdir}/etc/skel/.config/autostart/${pkgname}.desktop" << 'EOF'
[Desktop Entry]
Type=Application
Name=StormOS Welcome
Comment=StormOS welcome screen
Exec=stormos-welcome
Icon=storm\ os
Terminal=false
Categories=System;
X-GNOME-Autostart-enabled=true
EOF

    # Install icons
    install -dm755 "${pkgdir}/usr/share/pixmaps"
    
    if [ -f "build/icon.png" ]; then
        install -m644 "build/icon.png" "${pkgdir}/usr/share/pixmaps/${pkgname}.png"
    else
        # Create a simple base64 encoded icon
        echo "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAADG0lEQVR4nO2aPWhTURTHf6+NbYJdbDbgJhRUTHRShM5F6CJYBBcL1UVQcCg4iRQRF0EQBxHBoSgqLkUcChWKoIsKgkIFQVxMhVoRUisYQ6N5aR7kJe/Ly835uF9p4YOXnNx37vnd/8d5gT88z/M8j+ATMA6NA/1AK9AAtAItwHvgo9sUxYzADrCRSqW+NRqNdyz/ATYDl4HHaTabBVeKYouANWAC+AZcB5o8z2sHvgLH6JNmWQK8BcYWiwV3jRiRJ7CqUqn0HunUvY/U+QCcBp4m02lPRwzJgVHglueytwyzTpVKZW9bW1vEEd0yA+ZfHR0dMZ1bs9nsb+vr60MpGQH+Ab+An8CJcrn8B3gArKdSqTcAo9ls9qXTicIKFwIncdXKcSn3PFObm5tzUqlUpMpvgdN+O54G+rfb7ae+LYiZ4zLbAczvLXV0dHwGjgNfU6nUS+BkPp9vI+J/MwIYHwHOJJPJhwD5fL4d+AnM4tpuS1dX1y8T9gFLpVLpMSPgRz6fP4arubOZB2CCH4ATwG5j8nO5XFsqlTpYq9U+AqcdzgY4iys/13Dd4kG8AC4Cj3DVsVOhUMjiSoBzXAMi2Gg0zHz/xfVrGgNWgYeVSmXZyjwGTOO6SEfSOoGjqKtrGrhUqVS+yuR/jetWOTISdD/haq1Wax8cHGwkav1asVhsI3IIMM4QYBx3rXwCuLq62lKr1UY7OjpmgLNMLk2icjyvCpgM2t/f/xsAAwMDrUQOnWahWwA2Op1OUVdXVyuM7Gadl3xNlmmbA0ajp6fH9yLgDHDUNnAIFzT3SqVSC+76Z32NSDKZvG3Xfq1W+yDrN1ksFk87rs1arXZE9m+9Xu+V+ZtOpwfK5bK07+tEX8C8gE0hGk9ls9n3juu2Uq/XO0W92+32jKzfarU6SM83aWEt/N1+8z3P82T4H0SgWOj3CvJxAAAAAElFTkSuQmCC" | base64 -d > "${pkgdir}/usr/share/pixmaps/${pkgname}.png"
    fi
    
    # Create icon symlinks for different sizes
    install -dm755 "${pkgdir}/usr/share/icons/hicolor/48x48/apps"
    ln -sf "../../../pixmaps/${pkgname}.png" "${pkgdir}/usr/share/icons/hicolor/48x48/apps/${pkgname}.png"
    install -dm755 "${pkgdir}/usr/share/icons/hicolor/256x256/apps"
    ln -sf "../../../pixmaps/${pkgname}.png" "${pkgdir}/usr/share/icons/hicolor/256x256/apps/${pkgname}.png"
}

post_install() {
    # Create appimages directory for user
    if [ ! -d "\${HOME}/.local/share/stormos/appimages" ]; then
        mkdir -p "\${HOME}/.local/share/stormos/appimages" 2>/dev/null || true
    fi
    
    # For existing users, create autostart if they want it
    for userdir in /home/*; do
        if [ -d "\${userdir}/.config" ]; then
            autostart_dir="\${userdir}/.config/autostart"
            mkdir -p "\$autostart_dir"
            # Only copy if not already exists and not disabled
            if [ ! -f "\$autostart_dir/stormos-welcome.desktop" ] && [ ! -f "\${userdir}/.storm-autostart-disabled" ]; then
                cp "/etc/skel/.config/autostart/stormos-welcome.desktop" "\$autostart_dir/" 2>/dev/null || true
                chown --reference="\${userdir}" "\$autostart_dir/stormos-welcome.desktop" 2>/dev/null || true
            fi
        fi
    done
    
    echo ":: StormOS Welcome installed successfully"
    echo ":: Size: ~200KB (Electron is a system dependency)"
    echo ":: You can run it from the menu or by typing 'stormos-welcome'"
    echo ""
    echo ":: Autostart has been configured for:"
    echo "   - New users (via /etc/skel)"
    echo "   - System-wide (via /etc/xdg/autostart)"
    echo ""
    echo ":: To disable autostart, run: stormos-welcome and use the Settings tab"
}

post_upgrade() {
    post_install
}

pre_remove() {
    echo ":: Removing StormOS Welcome..."
    echo ":: Autostart entries will be preserved for user preference"
}
