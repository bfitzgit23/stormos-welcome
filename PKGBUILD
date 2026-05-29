# stormos-welcome.install
post_install() {
    if [ ! -d "${HOME}/.local/share/stormos/appimages" ]; then
        mkdir -p "${HOME}/.local/share/stormos/appimages" 2>/dev/null || true
    fi
    
    echo ":: StormOS Welcome installed successfully"
    echo ":: Size: ~200KB (Electron is a system dependency)"
}

post_upgrade() {
    post_install
}

pre_remove() {
    echo ":: Removing StormOS Welcome..."
}
