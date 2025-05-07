import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { TextFieldEntry, CheckboxEntry } from '@bpmn-io/properties-panel';

const LOW_PRIORITY = 500;

class CustomPropertiesProvider {
  translate: any;
  moddle: any;
  bpmnFactory: any;
  commandStack: any;
  elementRegistry: any;
  static $inject: string[];
  constructor(propertiesPanel: any, translate: any, moddle: any, bpmnFactory: any, commandStack: any, elementRegistry: any) {
    this.translate = translate;
    this.moddle = moddle;
    this.bpmnFactory = bpmnFactory;
    this.commandStack = commandStack;
    this.elementRegistry = elementRegistry;

    propertiesPanel.registerProvider(LOW_PRIORITY, this);
  }

  getGroups(element: any) {
    return (groups: { id: string; label: any; component: ((props: any) => { id: string; component: (props: any) => any; getValue: (prop: any) => any; setValue: (prop: any, value: any) => void; translate: any; }[]) | ((props: any) => { id: string; component: (props: any) => any; getValue: (prop: any) => any; setValue: (prop: any, value: any) => void; translate: any; }[]); element: any; }[]) => {
      // const businessObject = getBusinessObject(element); // Commented out unused variable

      // Add custom properties for data objects
      if (is(element, 'bpmn:DataObjectReference') || is(element, 'bpmn:DataObject')) {
        const dataGroup = groups.find((g: { id: string; }) => g.id === 'dataProperties');
        if (!dataGroup) {
          groups.push({
            id: 'dataProperties',
            label: this.translate('Data Properties'),
            component: (props: any) => DataPropertiesGroup({ ...props, translate: this.translate, moddle: this.moddle, commandStack: this.commandStack }),
            element: element
          });
        }
      }

      // Add custom properties for artifacts
      if (is(element, 'bpmn:TextAnnotation') || is(element, 'bpmn:Group')) {
        const artifactGroup = groups.find((g: { id: string; }) => g.id === 'artifactProperties');
        if (!artifactGroup) {
          groups.push({
            id: 'artifactProperties',
            label: this.translate('Artifact Properties'),
            component: (props: any) => ArtifactPropertiesGroup({ ...props, translate: this.translate, moddle: this.moddle, commandStack: this.commandStack }),
            element: element
          });
        }
      }

      // Add custom properties for workspace (Process or Collaboration)
      if (is(element, 'bpmn:Process') || is(element, 'bpmn:Collaboration')) {
        const workspaceGroup = groups.find((g: { id: string; }) => g.id === 'workspaceProperties');
        if (!workspaceGroup) {
          groups.push({
            id: 'workspaceProperties',
            label: this.translate('Workspace Properties'),
            component: (props: any) => WorkspacePropertiesGroup({ ...props, translate: this.translate, moddle: this.moddle, commandStack: this.commandStack }),
            element: element
          });
        }
      }

      return groups;
    };
  }
}

function DataPropertiesGroup(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  const { element, translate, moddle, commandStack } = props;
  // const bpmnFactory = useService('bpmnFactory'); // Commented out unused variable

  const getExtensionProperties = () => {
    const businessObject = getBusinessObject(element);
    const extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');
    let customProps = extensionElements.get('values').find((e: { $type: string; }) => e.$type === 'custom:DataObjectProperties');

    if (!customProps) {
      customProps = moddle.create('custom:DataObjectProperties');
      extensionElements.get('values').push(customProps);
      // Ensure extensionElements is added if it didn't exist
      if (!businessObject.extensionElements) {
        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        });
      }
    }
    return customProps;
  };

  const getValue = (prop: string | number) => {
    const customProps = getExtensionProperties();
    return customProps[prop];
  };

  const setValue = (prop: any, value: any) => {
    //const businessObject = getBusinessObject(element);
    const customProps = getExtensionProperties();

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: customProps,
      properties: { [prop]: value }
    });
  };

  return [
    {
      id: 'dataType',
      component: DataTypeProperty,
      getValue,
      setValue,
      translate
    },
    {
      id: 'isCollection',
      component: IsCollectionProperty,
      getValue,
      setValue,
      translate
    }
  ];
}

function DataTypeProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id }, // Pass a dummy element object with id
    id: id,
    label: translate('Data Type'),
    getValue: () => getValue('dataType') || '',
    setValue: (value: any) => setValue('dataType', value)
  });
}

function IsCollectionProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;

  return CheckboxEntry({
    element: { id }, // Pass a dummy element object with id
    id: id,
    label: translate('Is Collection'),
    getValue: () => getValue('isCollection') || false,
    setValue: (value: any) => setValue('isCollection', value)
  });
}

function ArtifactPropertiesGroup(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  const { element, translate, moddle, commandStack } = props;
  // const bpmnFactory = useService('bpmnFactory'); // Commented out unused variable

  const getExtensionProperties = () => {
    const businessObject = getBusinessObject(element);
    const extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');
    let customProps = extensionElements.get('values').find((e: { $type: string; }) => e.$type === 'custom:ArtifactProperties');

    if (!customProps) {
      customProps = moddle.create('custom:ArtifactProperties');
      extensionElements.get('values').push(customProps);
      // Ensure extensionElements is added if it didn't exist
      if (!businessObject.extensionElements) {
        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        });
      }
    }
    return customProps;
  };

  const getValue = (prop: string | number) => {
    const customProps = getExtensionProperties();
    return customProps[prop];
  };

  const setValue = (prop: any, value: any) => {
    //const businessObject = getBusinessObject(element);
    const customProps = getExtensionProperties();

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: customProps,
      properties: { [prop]: value }
    });
  };

  // Note: Documentation is a standard BPMN property, handled differently.
  // We only add artifactType here.
  return [
    {
      id: 'artifactType',
      component: ArtifactTypeProperty,
      getValue,
      setValue,
      translate
    }
  ];
}

function ArtifactTypeProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id }, // Pass a dummy element object with id
    id: id,
    label: translate('Artifact Type'),
    getValue: () => getValue('artifactType') || '',
    setValue: (value: any) => setValue('artifactType', value)
  });
}

// --- Workspace Properties --- 

function WorkspacePropertiesGroup(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  const { element, translate, moddle, commandStack } = props;

  const getExtensionProperties = () => {
    const businessObject = getBusinessObject(element);
    const extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');
    let customProps = extensionElements.get('values').find((e: { $type: string; }) => e.$type === 'custom:WorkspaceProperties');

    if (!customProps) {
      customProps = moddle.create('custom:WorkspaceProperties');
      extensionElements.get('values').push(customProps);
      // Ensure extensionElements is added if it didn't exist
      if (!businessObject.extensionElements) {
        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        });
      }
    }
    return customProps;
  };

  const getValue = (prop: string | number) => {
    const customProps = getExtensionProperties();
    return customProps[prop];
  };

  const setValue = (prop: any, value: any) => {
    const customProps = getExtensionProperties();

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: customProps,
      properties: { [prop]: value }
    });
  };

  return [
    {
      id: 'workspaceName',
      component: WorkspaceNameProperty,
      getValue,
      setValue,
      translate
    }
    // Add more workspace properties here if needed
  ];
}

function WorkspaceNameProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id }, // Pass a dummy element object with id
    id: id,
    label: translate('Workspace Name'),
    getValue: () => getValue('workspaceName') || '',
    setValue: (value: any) => setValue('workspaceName', value)
  });
}

CustomPropertiesProvider.$inject = ['propertiesPanel', 'translate', 'moddle', 'bpmnFactory', 'commandStack', 'elementRegistry'];

export default CustomPropertiesProvider;