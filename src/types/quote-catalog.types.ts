export type CounterOption = {
    id: string;
    name: string;
    note: string;
    kind: "counter";
    unitPrice: number;
    min: number;
    max: number;
    defaultQuantity?: number;
};

export type ToggleOption = {
    id: string;
    name: string;
    note: string;
    kind: "toggle";
    price: number;
    defaultOn?: boolean;
};

export type ServiceOption = CounterOption | ToggleOption;

export type Service = {
    id: string;
    name: string;
    tagline: string;
    basePrice: number;
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
