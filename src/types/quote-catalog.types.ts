export type CounterOption = {
    id: string;
    name: string;
    note: string;
    kind: "counter";
    unitPrice: number;
    min: number;
    max: number;
};

export type ToggleOption = {
    id: string;
    name: string;
    note: string;
    kind: "toggle";
    price: number;
};

export type ServiceOption = CounterOption | ToggleOption;

export type Service = {
    id: string;
    name: string;
    tagline: string;
    options: ServiceOption[];
};

export type AddOn = {
    id: string;
    name: string;
    note: string;
    price: number;
    suffix?: string;
    triggers: string[];
};
