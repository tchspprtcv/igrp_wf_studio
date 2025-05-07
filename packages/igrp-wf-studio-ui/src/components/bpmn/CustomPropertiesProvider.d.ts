declare class CustomPropertiesProvider {
    translate: any;
    moddle: any;
    bpmnFactory: any;
    commandStack: any;
    elementRegistry: any;
    static $inject: string[];
    constructor(propertiesPanel: any, translate: any, moddle: any, bpmnFactory: any, commandStack: any, elementRegistry: any);
    getGroups(element: any): (groups: {
        id: string;
        label: any;
        component: ((props: any) => {
            id: string;
            component: (props: any) => any;
            getValue: (prop: any) => any;
            setValue: (prop: any, value: any) => void;
            translate: any;
        }[]) | ((props: any) => {
            id: string;
            component: (props: any) => any;
            getValue: (prop: any) => any;
            setValue: (prop: any, value: any) => void;
            translate: any;
        }[]);
        element: any;
    }[]) => {
        id: string;
        label: any;
        component: ((props: any) => {
            id: string;
            component: (props: any) => any;
            getValue: (prop: any) => any;
            setValue: (prop: any, value: any) => void;
            translate: any;
        }[]) | ((props: any) => {
            id: string;
            component: (props: any) => any;
            getValue: (prop: any) => any;
            setValue: (prop: any, value: any) => void;
            translate: any;
        }[]);
        element: any;
    }[];
}
export default CustomPropertiesProvider;
//# sourceMappingURL=CustomPropertiesProvider.d.ts.map