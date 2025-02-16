import { ContentContainer } from "../components/ContentContainer";
import { Layout } from "../components/Layout";
import { Settings } from "../components/Settings/Settings";

export const SettingsPage = (): HTMLElement => {

    const settingsComponent = Settings();

    return Layout(
        ContentContainer(
            settingsComponent()
        ));
};