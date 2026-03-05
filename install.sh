#!/bin/bash

set -e

echo "-----------------------------------------"
echo "THM OpenVPN Extension Installer"
echo "-----------------------------------------"
echo
echo

if [ "$(id -u)" -ne 0 ]; then
    echo "Please run with 'sudo', to automatically configure everything for the extension."
    exit 1
fi

echo
echo "Select installation platform:"
echo "1. Linux - GNOME"
# echo "2. Linux - KDE"
# echo "3. Linux - Plasma"
# echo "4. Windows"
# echo "5. MacOS"
echo

while :; do
    echo
    printf "Platform Number: "
    read platform_no

    case "$platform_no" in
        1) break ;;
        *) echo "Invalid number. Try again." ;;
    esac
done

while :; do
    echo
    printf "Enter .ovpn file path: "
    read file

    case "$file" in
        *.ovpn) ;;
        *) echo "Must be a .ovpn file"; continue ;;
    esac

    if [ ! -r "$file" ]; then
        echo "File not found or not readable"
        continue
    fi

    if grep -qi "openvpn" "$file" && grep -qi "tryhackme" "$file"; then
        echo "Valid file"
        break
    else
        echo "File doesn't seem to be the OpenVPN config for TryHackMe."
    fi
done

if [ "$platform_no" -eq 1 ]; then
    echo
    echo "GNOME"
    echo
    echo "Installing OpenVPN if not already installed."
    echo
    
    DEBIAN_FRONTEND=noninteractive apt update -y
    DEBIAN_FRONTEND=noninteractive apt install -y openvpn
    
    echo
    echo "Copying extension files to /home/$SUDO_USER/.local/share/gnome-shell/extensions/ishant89op@thm.openvpn"
    echo

    if [ ! -d platforms/linux/gnome/ishant89op@thm.openvpn ]; then
        echo "Extension files not found."
        exit 1
    fi

    mkdir -p "/home/$SUDO_USER/.local/share/gnome-shell/extensions"
    cp -r platforms/linux/gnome/*  "/home/$SUDO_USER/.local/share/gnome-shell/extensions/"

    echo "Enabling the extension."
    echo

    if ! command -v gnome-extensions >/dev/null 2>&1; then
        echo "Tools not found."
        echo "Installing GNOME Extensions tools..."
        DEBIAN_FRONTEND=noninteractive apt install -y gnome-shell-extensions
    fi

    if command -v gnome-extensions >/dev/null 2>&1; then
        gnome-extensions enable ishant89op@thm.openvpn || \
        echo "Extension will activate after next login."
    fi

    echo "Creating config file for the OpenVPN file in /etc/openvpn/client/thm.conf"
    echo

    mkdir -p /etc/openvpn/client
    cp "$file" /etc/openvpn/client/thm.conf

    echo "Adding the 'systemctl' commands to the sudoers list."
    echo

    echo "$SUDO_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl start openvpn-client@thm, /usr/bin/systemctl stop openvpn-client@thm" > /etc/sudoers.d/thm-vpn
    chmod 440 /etc/sudoers.d/thm-vpn

    echo "Setup Done."
    echo
    echo "Please log out and log back in if you're on Wayland."
    echo "Or press      Alt + F2 + r + Enter     if on X11."
    echo
    echo
    echo

elif [ "$platform_no" -eq 2 ]; then
    echo "soon"

elif [ "$platform_no" -eq 3 ]; then
    echo "soon"

elif [ "$platform_no" -eq 4 ]; then
    echo "soon"

elif [ "$platform_no" -eq 5 ]; then
    echo "soon"

fi