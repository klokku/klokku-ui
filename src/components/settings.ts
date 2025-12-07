export const userSettings = {
    locale: "pl-PL",
    weekStartDay: "monday",
}

export interface Settings {
    weekStartDay: "monday" | "sunday";
}


export const defaultSettings: Settings = {
    weekStartDay: "monday",
};
