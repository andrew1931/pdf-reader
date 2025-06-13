import { DB } from "./core/DB";
import { useOutlineToggle, useScrollToggle, useThemeToggle, useWindowResize } from "./core/hooks";
import { createRouter } from "./core/router";
import { html, isTouchDevice } from "./core/utils";
import { NotFoundPage } from "./pages/404";
import { HomePage } from "./pages/home";
import { SettingsPage } from "./pages/settings";
import { routes } from "./routes.definition";
import { Theme } from "./theme";


(() => {
    const htmlEl = html();

    const root = document.createElement("div");
    root.setAttribute("id", "app");
    document.body.appendChild(root);

    htmlEl.setAttribute("is-touch-device", String(isTouchDevice()));
   
    useOutlineToggle.on(({ skippedElement, value }) => {
        const elements = "button, input, textarea, a";
        htmlEl.querySelectorAll(elements).forEach((el) => {
            el.setAttribute("tabindex", value ?  "0" : "-1");
        });
        if (skippedElement) {
            skippedElement.querySelectorAll(elements).forEach((el) => {
                el.setAttribute("tabindex", !value ?  "0" : "-1");
            });
        }
    });

    useScrollToggle.on(({ value }) => {
        if (value) {
            htmlEl.classList.remove("no-scroll");
        } else {
            htmlEl.classList.add("no-scroll");
        }
    });

    useThemeToggle.on(() => Theme.handleThemeChange());

    window.addEventListener("resize", () => useWindowResize.emit());

    DB.connect();

    createRouter(root, [
        { path: routes.home.pathname, component: HomePage },
        { path: routes.settings.pathname, component: SettingsPage },
        { path: "*", component: NotFoundPage }
    ]);
})();