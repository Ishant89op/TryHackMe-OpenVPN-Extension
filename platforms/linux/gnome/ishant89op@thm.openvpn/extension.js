import St from 'gi://St';
import Gio from 'gi://Gio';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export default class ExampleExtension extends Extension {
    enable() {
        this._active = false;

        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);

        // Icon in the panel
        this._icon = new St.Icon({
            icon_name: 'network-wireless-disabled-symbolic', // OFF state icon
            style_class: 'system-status-icon',
        });
        this._indicator.add_child(this._icon);

        // Single click toggles directly
        this._indicator.connect('button-press-event', () => {
            this._toggle();
        });

        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    _toggle() {
        this._active = !this._active;

        if (this._active) {
            this._icon.icon_name = 'network-wireless-symbolic'; // ON state icon
            this._runTask('on');
        } else {
            this._icon.icon_name = 'network-wireless-disabled-symbolic'; // OFF state icon
            this._runTask('off');
        }
    }

    _runTask(state) {
        try {
            // Replace this with whatever command you want to run
            let proc = Gio.Subprocess.new(
                ['bash', '-c', `echo "Task is now ${state}"`],
                Gio.SubprocessFlags.NONE
            );
        } catch (e) {
            console.error(`my-extension: error running task: ${e}`);
        }
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
        this._active = false;
    }
}