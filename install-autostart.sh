#!/bin/bash
# Quick setup for autostart

echo "Setting up StormOS Welcome autostart..."

# System-wide autostart
sudo mkdir -p /etc/xdg/autostart
sudo tee /etc/xdg/autostart/stormos-welcome.desktop > /dev/null << 'EOF'
[Desktop Entry]
Type=Application
Name=StormOS Welcome
Comment=StormOS welcome screen
Exec=stormos-welcome
Icon=stormos-welcome
Terminal=false
Categories=System;
X-GNOME-Autostart-enabled=true
X-GNOME-Autostart-Phase=Application
EOF

# User autostart
mkdir -p ~/.config/autostart
tee ~/.config/autostart/stormos-welcome.desktop > /dev/null << 'EOF'
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

# Template for new users
sudo mkdir -p /etc/skel/.config/autostart
sudo tee /etc/skel/.config/autostart/stormos-welcome.desktop > /dev/null << 'EOF'
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

echo "✓ Autostart configured successfully"
echo ""
echo "To disable autostart, run: rm ~/.config/autostart/stormos-welcome.desktop"
echo "To re-enable autostart, run: cp /etc/xdg/autostart/stormos-welcome.desktop ~/.config/autostart/"
