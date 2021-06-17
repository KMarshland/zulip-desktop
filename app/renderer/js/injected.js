"use strict";
(() => {
    const zulipWindow = window;
    /* eslint-disable @typescript-eslint/naming-convention */
    const electron_bridge = {
        ...zulipWindow.raw_electron_bridge,
        get idle_on_system() {
            return this.get_idle_on_system();
        },
        get last_active_on_system() {
            return this.get_last_active_on_system();
        },
        get send_notification_reply_message_supported() {
            return this.get_send_notification_reply_message_supported();
        },
        set send_notification_reply_message_supported(value) {
            this.set_send_notification_reply_message_supported(value);
        },
    };
    /* eslint-enable @typescript-eslint/naming-convention */
    zulipWindow.electron_bridge = electron_bridge;
    function attributeListener(type) {
        const handlers = new WeakMap();
        function listener(event) {
            if (handlers.get(this).call(this, event) === false) {
                event.preventDefault();
            }
        }
        return {
            configurable: true,
            enumerable: true,
            get() {
                return handlers.get(this);
            },
            set(value) {
                if (typeof value === "function") {
                    if (!handlers.has(this)) {
                        this.addEventListener(type, listener);
                    }
                    handlers.set(this, value);
                }
                else if (handlers.has(this)) {
                    this.removeEventListener(type, listener);
                    handlers.delete(this);
                }
            },
        };
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const NativeNotification = Notification;
    class InjectedNotification extends EventTarget {
        static get permission() {
            return NativeNotification.permission;
        }
        static async requestPermission(callback) {
            if (callback) {
                callback(await Promise.resolve(NativeNotification.permission));
            }
            return NativeNotification.permission;
        }
        constructor(title, options = {}) {
            super();
            Object.assign(this, electron_bridge.new_notification(title, options, (type, eventInit) => this.dispatchEvent(new Event(type, eventInit))));
        }
    }
    Object.defineProperties(InjectedNotification.prototype, {
        onclick: attributeListener("click"),
        onclose: attributeListener("close"),
        onerror: attributeListener("error"),
        onshow: attributeListener("show"),
    });
    window.Notification = InjectedNotification;
})();
