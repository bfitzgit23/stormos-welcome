# PKGBUILD
# Maintainer: StormOS Team <stormos@example.com>
# Contributor: Ben Fitzpatrick <ben@stormos.org>

pkgname=stormos-welcome
pkgver=2.0.0
pkgrel=1
pkgdesc="Modern welcome + software center for StormOS - Electron version"
arch=('x86_64')
url="https://github.com/stormos/stormos-welcome"
license=('MIT')
depends=(
    'electron28'
    'xfce4-terminal'
    'polkit'
)
makedepends=(
    'npm'
    'node-gyp'
)
optdepends=(
    'yay: AUR support'
    'flatpak: Flatpak support'
    'snapd: Snap support'
    'calamares: GUI installer'
    'reflector: Mirror ranking'
    'pacman-contrib: Cache cleaning'
)
source=("${pkgname}-${pkgver}.tar.gz::https://github.com/stormos/stormos-welcome/archive/v${pkgver}.tar.gz")
sha256sums=('SKIP')

prepare() {
    cd "${srcdir}/${pkgname}-${pkgver}"
    npm install --production
}

build() {
    cd "${srcdir}/${pkgname}-${pkgver}"
    # No build step needed for Electron app
    true
}

package() {
    cd "${srcdir}/${pkgname}-${pkgver}"
    
    # Create application directory
    install -dm755 "${pkgdir}/usr/lib/${pkgname}"
    
    # Copy application files
    cp -r . "${pkgdir}/usr/lib/${pkgname}/"
    
    # Remove development files
    rm -rf "${pkgdir}/usr/lib/${pkgname}/node_modules"
    
    # Reinstall production dependencies
    cd "${pkgdir}/usr/lib/${pkgname}"
    npm install --production --no-audit --no-fund
    
    # Create symlink for electron
    install -dm755 "${pkgdir}/usr/bin"
    cat > "${pkgdir}/usr/bin/${pkgname}" << 'EOF'
#!/bin/bash
ELECTRON=/usr/lib/electron28/electron
APP_DIR=/usr/lib/stormos-welcome
exec $ELECTRON $APP_DIR "$@"
EOF
    chmod +x "${pkgdir}/usr/bin/${pkgname}"
    
    # Desktop entry
    install -dm755 "${pkgdir}/usr/share/applications"
    cat > "${pkgdir}/usr/share/applications/${pkgname}.desktop" << EOF
[Desktop Entry]
Type=Application
Name=StormOS Welcome
Comment=Modern welcome and software center for StormOS
Exec=${pkgname}
Icon=${pkgname}
Terminal=false
Categories=System;Settings;
StartupNotify=true
EOF

    # Install icon
    install -dm755 "${pkgdir}/usr/share/pixmaps"
    if [ -f "build/icon.png" ]; then
        install -m644 "build/icon.png" "${pkgdir}/usr/share/pixmaps/${pkgname}.png"
    else
        # Create a simple icon if none exists
        convert -size 256x256 xc:none -font Ubuntu -pointsize 120 \
            -draw "text 50,180 '🌩️'" -scale 256x256 \
            "${pkgdir}/usr/share/pixmaps/${pkgname}.png" 2>/dev/null || true
    fi

    # Install polkit action for elevated privileges
    install -dm755 "${pkgdir}/usr/share/polkit-1/actions"
    cat > "${pkgdir}/usr/share/polkit-1/actions/com.stormos.welcome.policy" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE policyconfig PUBLIC
 "-//freedesktop//DTD PolicyKit Policy Configuration 1.0//EN"
 "http://www.freedesktop.org/standards/PolicyKit/1/policyconfig.dtd">
<policyconfig>
  <action id="com.stormos.welcome.run-commands">
    <description>Run system commands from StormOS Welcome</description>
    <message>Authentication is required to run system commands</message>
    <defaults>
      <allow_any>auth_admin</allow_any>
      <allow_inactive>auth_admin</allow_inactive>
      <allow_active>auth_admin_keep</allow_active>
    </defaults>
    <annotate key="org.freedesktop.policykit.exec.path">/usr/bin/stormos-welcome</annotate>
    <annotate key="org.freedesktop.policykit.exec.allow_gui">true</annotate>
  </action>
</policyconfig>
EOF
}
