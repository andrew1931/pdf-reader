import { ContentContainer } from "../components/ContentContainer";
import { useNavigationEnter } from "../core/router";
import { Layout } from "../components/Layout";
import { Settings } from "../components/Settings/Settings";

export const SettingsPage = (): HTMLElement => {

    const settingsComponent = Settings();

    useNavigationEnter(() => {
        // console.log("end settings");
    });

    return Layout(
        ContentContainer(
            settingsComponent()
        ));
};