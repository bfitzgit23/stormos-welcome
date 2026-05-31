# PKGBUILD
# Maintainer: StormOS Team <stormos@example.com>

pkgname=stormos-welcome
pkgver=2.0.0
pkgrel=2
pkgdesc="Modern welcome + software center for StormOS - Python version"
arch=('x86_64')
url="https://github.com/stormos/stormos-welcome"
license=('MIT')
depends=(
    'python'
    'python-pyqt6'
    'xfce4-terminal'
    'polkit'
)
optdepends=(
    'yay: AUR support'
    'flatpak: Flatpak support'
    'snapd: Snap support'
    'calamares: GUI installer'
    'reflector: Mirror ranking'
    'pacman-contrib: Cache cleaning'
)

source=("stormos-welcome.py")
sha256sums=('SKIP')

package() {
    # Install the main script
    install -Dm755 stormos-welcome.py "${pkgdir}/usr/bin/stormos-welcome"
    
    # Desktop entry for menu
    install -Dm644 /dev/stdin "${pkgdir}/usr/share/applications/stormos-welcome.desktop" << 'EOF'
[Desktop Entry]
Type=Application
Name=StormOS Welcome
Comment=Modern welcome and software center for StormOS
Exec=stormos-welcome
Icon=stormos-welcome
Terminal=false
Categories=System;Settings;
StartupNotify=true
EOF

    # System-wide autostart (enabled by default)
    install -Dm644 /dev/stdin "${pkgdir}/etc/xdg/autostart/stormos-welcome.desktop" << 'EOF'
[Desktop Entry]
Type=Application
Name=StormOS Welcome
Comment=StormOS welcome screen (first boot helper)
Exec=stormos-welcome
Icon=stormos-welcome
Terminal=false
Categories=System;
X-GNOME-Autostart-enabled=true
X-GNOME-Autostart-Phase=Application
X-KDE-autostart-after=panel
EOF

    # Template for new users
    install -Dm644 /dev/stdin "${pkgdir}/etc/skel/.config/autostart/stormos-welcome.desktop" << 'EOF'
[Desktop Entry]
Type=Application
Name=StormOS Welcome
Comment=StormOS welcome screen
Exec=stormos-welcome
Icon=stormos-welcome
Terminal=false
Categories=System;
X-GNOME-Autostart-enabled=true
EOF

    # Icon (create a simple one)
    install -Dm644 /dev/stdin "${pkgdir}/usr/share/pixmaps/stormos-welcome.png" << 'EOF'
iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAADG0lEQVR4nO2aPWhTURTHf6+NbYJdbDbgJhRUTHRShM5F6CJYBBcL1UVQcCg4iRQRF0EQBxHBoSgqLkUcChWKoIsKgkIFQVxMhVoRUisYQ6N5aR7kJe/Ly835uF9p4YOXnNx37vnd/8d5gT88z/M8j+ATMA6NA/1AK9AAtAItwHvgo9sUxYzADrCRSqW+NRqNdyz/ATYDl4HHaTabBVeKYouANWAC+AZcB5o8z2sHvgLH6JNmWQK8BcYWiwV3jRiRJ7CqUqn0HunUvY/U+QCcBp4m02lPRwzJgVHglueytwyzTpVKZW9bW1vEEd0yA+ZfHR0dMZ1bs9nsb+vr60MpGQH+Ab+An8CJcrn8B3gArKdSqTcAo9ls9qXTicIKFwIncdXKcSn3PFObm5tzUqlUpMpvgdN+O54G+rfb7ae+LYiZ4zLbAczvLXV0dHwGjgNfU6nUS+BkPp9vI+J/MwIYHwHOJJPJhwD5fL4d+AnM4tpuS1dX1y8T9gFLpVLpMSPgRz6fP4arubOZB2CCH4ATwG5j8nO5XFsqlTpYq9U+AqcdzgY4iys/13Dd4kG8AC4Cj3DVsVOhUMjiSoBzXAMi2Gg0zHz/xfVrGgNWgYeVSmXZyjwGTOO6SEfSOoGjqKtrGrhUqVS+yuR/jetWOTISdD/haq1Wax8cHGwkav1asVhsI3IIMM4QYBx3rXwCuLq62lKr1UY7OjpmgLNMLk2icjyvCpgM2t/f/xsAAwMDrUQOnWahWwA2Op1OUVdXVyuM7Gadl3xNlmmbA0ajp6fH9yLgDHDUNnAIFzT3SqVSC+76Z32NSDKZvG3Xfq1W+yDrN1ksFk87rs1arXZE9m+9Xu+V+ZtOpwfK5bK07+tEX8C8gE0hGk9ls9n3juu2Uq/XO0W92+32jKzfarU6SM83aWEt/N1+8z3P82T4H0SgWOj3CvJxAAAAAElFTkSuQmCC
EOF
    
    # Symlink icon for hicolor theme
    install -dm755 "${pkgdir}/usr/share/icons/hicolor/48x48/apps"
    ln -sf "../../../pixmaps/stormos-welcome.png" "${pkgdir}/usr/share/icons/hicolor/48x48/apps/stormos-welcome.png"
    install -dm755 "${pkgdir}/usr/share/icons/hicolor/256x256/apps"
    ln -sf "../../../pixmaps/stormos-welcome.png" "${pkgdir}/usr/share/icons/hicolor/256x256/apps/stormos-welcome.png"
}

post_install() {
    # Create marker file to track first run
    if [ ! -f "\${HOME}/.storm-autostart-disabled" ]; then
        # On first install, disable autostart after first run
        echo ":: StormOS Welcome installed"
        echo ":: Autostart is enabled by default for new logins"
        echo ":: To disable autostart, open the app and go to Settings"
    fi
}

post_upgrade() {
    post_install
}

pre_remove() {
    echo ":: Removing StormOS Welcome..."
    echo ":: Autostart entries will be preserved for user preference"
}
