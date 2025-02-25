import {nativeImage} from "electron/common";
import {type BrowserWindow, app} from "electron/main";
import process from "node:process";

import * as ConfigUtil from "../common/config-util.js";

import {send} from "./typed-ipc-main.js";

function showBadgeCount(
  messageCount: number,
  hasUnreads: boolean,
  mainWindow: BrowserWindow,
): void {
  if (process.platform === "win32") {
    updateOverlayIcon(messageCount, mainWindow);
  } else {
    if (messageCount > 0) {
      app.badgeCount = messageCount;
      app.dock.setBadge(messageCount.toString());
    } else if (hasUnreads) {
      app.badgeCount = 0;
      app.dock.setBadge('•');
    } else {
      app.dock.setBadge("");
      app.badgeCount = 0;
    }
  }
}

function hideBadgeCount(mainWindow: BrowserWindow): void {
  if (process.platform === "win32") {
    mainWindow.setOverlayIcon(null, "");
  } else {
    app.badgeCount = 0;
  }
}

export function updateBadge(
  badgeCount: number,
  hasUnreads: boolean,
  mainWindow: BrowserWindow,
): void {
  if (ConfigUtil.getConfigItem("badgeOption", true)) {
    showBadgeCount(badgeCount, hasUnreads, mainWindow);
  } else {
    hideBadgeCount(mainWindow);
  }
}

function updateOverlayIcon(
  messageCount: number,
  mainWindow: BrowserWindow,
): void {
  if (!mainWindow.isFocused()) {
    mainWindow.flashFrame(
      ConfigUtil.getConfigItem("flashTaskbarOnMessage", true),
    );
  }

  if (messageCount === 0) {
    mainWindow.setOverlayIcon(null, "");
  } else {
    send(mainWindow.webContents, "render-taskbar-icon", messageCount);
  }
}

export function updateTaskbarIcon(
  data: string,
  text: string,
  mainWindow: BrowserWindow,
): void {
  const img = nativeImage.createFromDataURL(data);
  mainWindow.setOverlayIcon(img, text);
}
