import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const PROFILE = 'thm';
const SERVICE = `openvpn-client@${PROFILE}`;

function runCommand(argv) {
    try {
        let proc = Gio.Subprocess.new(argv, Gio.SubprocessFlags.NONE);
        proc.wait_async(null, null);
    } catch (e) {
        console.error(`[THM-VPN] Command failed: ${e.message}`);
    }
}

function isVpnActive() {
    try {
        let proc = Gio.Subprocess.new(
            ['systemctl', 'is-active', SERVICE],
            Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_SILENCE
        );
        let [, stdout] = proc.communicate_utf8(null, null);
        return stdout.trim() === 'active';
    } catch (_) {
        return false;
    }
}

const ThmVpnIndicator = GObject.registerClass(
class ThmVpnIndicator extends PanelMenu.Button {
    _init(extensionPath) {
        super._init(0.0, 'THM VPN', true);

        this._label = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
            text: 'THM',
            style: 'font-family: monospace; font-size: 14px; font-weight: bold; padding: 0 6px; color: #e05555;',
        });
        
        this.add_child(this._label);

        this.connect('button-press-event', () => {
            this._toggle();
            return Clutter.EVENT_STOP;
        });

        this._updateState();

        this._pollId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5, () => {
            this._updateState();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _updateState() {
        this._active = isVpnActive();
        if (this._active) {
            this._label.text = 'THM';
            this._label.style = 'font-family: monospace; font-size: 14px; font-weight: bold; padding: 0 6px; color: #57e389;';
        } else {
            this._label.text = 'THM';
            this._label.style = 'font-family: monospace; font-size: 14px; font-weight: bold; padding: 0 6px; color: #e05555;';
        }
    }

    _toggle() {
        if (this._active) {
            runCommand(['sudo', 'systemctl', 'stop', SERVICE]);
        } else {
            runCommand(['sudo', 'systemctl', 'start', SERVICE]);
        }
        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 2, () => {
            this._updateState();
            return GLib.SOURCE_REMOVE;
        });
    }

    destroy() {
        if (this._pollId) {
            GLib.source_remove(this._pollId);
            this._pollId = null;
        }
        super.destroy();
    }
});

export default class ThmVpnExtension extends Extension {
    enable() {
        this._indicator = new ThmVpnIndicator(this.path);
        Main.panel.addToStatusArea('thm-vpn', this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }
}