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

  const entries = [];

  const getCustomProp = (propName: string) => {
    const customProps = getExtensionProperties();
    return customProps[propName];
  };

  const setCustomProp = (propName: string, value: any) => {
    const customProps = getExtensionProperties();
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: customProps,
      properties: { [propName]: value }
    });
  };

  if (is(element, 'bpmn:TextAnnotation')) {
    entries.push(
      {
        id: 'textFormat',
        component: TextFormatProperty,
        getValue: () => getCustomProp('textFormat'),
        setValue: (val: any) => setCustomProp('textFormat', val),
        translate
      },
      {
        id: 'includeInHistory',
        component: IncludeInHistoryProperty,
        getValue: () => getCustomProp('includeInHistory'),
        setValue: (val: any) => setCustomProp('includeInHistory', val),
        translate
      },
      {
        id: 'fontSizeAnnotation', // Matches BpmnPropertiesPanel state key
        component: FontSizeAnnotationProperty, // Uses specific label
        getValue: () => getCustomProp('fontSize'), // Moddle property name
        setValue: (val: any) => setCustomProp('fontSize', val),
        translate
      },
      {
        id: 'fontWeightAnnotation',
        component: FontWeightAnnotationProperty,
        getValue: () => getCustomProp('fontWeight'),
        setValue: (val: any) => setCustomProp('fontWeight', val),
        translate
      },
      {
        id: 'fontStyleAnnotation',
        component: FontStyleAnnotationProperty,
        getValue: () => getCustomProp('fontStyle'),
        setValue: (val: any) => setCustomProp('fontStyle', val),
        translate
      },
      {
        id: 'fontColorAnnotation',
        component: FontColorAnnotationProperty,
        getValue: () => getCustomProp('fontColor'),
        setValue: (val: any) => setCustomProp('fontColor', val),
        translate
      },
      {
        id: 'backgroundColorAnnotation',
        component: BackgroundColorAnnotationProperty,
        getValue: () => getCustomProp('backgroundColor'),
        setValue: (val: any) => setCustomProp('backgroundColor', val),
        translate
      },
      {
        id: 'borderColorAnnotation',
        component: BorderColorAnnotationProperty,
        getValue: () => getCustomProp('borderColor'),
        setValue: (val: any) => setCustomProp('borderColor', val),
        translate
      }
    );
  } else if (is(element, 'bpmn:Group')) {
    entries.push(
      {
        id: 'categoryValueRef',
        component: CategoryValueRefProperty,
        getValue: () => getCustomProp('categoryValueRef'),
        setValue: (val: any) => setCustomProp('categoryValueRef', val),
        translate
      },
      {
        id: 'borderColorGroup', // Matches BpmnPropertiesPanel state key
        component: BorderColorGroupProperty, // Uses specific label
        getValue: () => getCustomProp('borderColor'), // Moddle property name
        setValue: (val: any) => setCustomProp('borderColor', val),
        translate
      },
      {
        id: 'backgroundColorGroup',
        component: BackgroundColorGroupProperty,
        getValue: () => getCustomProp('backgroundColor'),
        setValue: (val: any) => setCustomProp('backgroundColor', val),
        translate
      },
      {
        id: 'fontColorGroup',
        component: FontColorGroupProperty,
        getValue: () => getCustomProp('fontColor'),
        setValue: (val: any) => setCustomProp('fontColor', val),
        translate
      },
      {
        id: 'fontSizeGroup',
        component: FontSizeGroupProperty,
        getValue: () => getCustomProp('fontSize'),
        setValue: (val: any) => setCustomProp('fontSize', val),
        translate
      }
    );
  }

  return entries;
}

function TextFormatProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Text Format'),
    description: translate('MIME type of the text (e.g., text/plain, text/html)'),
    getValue: () => getValue('textFormat') || 'text/plain',
    setValue: (value: any) => setValue('textFormat', value)
  });
}

function IncludeInHistoryProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return CheckboxEntry({
    element: { id },
    id: id,
    label: translate('Include in History'),
    description: translate('Determines if the annotation should be included in historical data'),
    getValue: () => getValue('includeInHistory') || false,
    setValue: (value: any) => setValue('includeInHistory', value)
  });
}

function FontSizeProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Font Size'),
    getValue: () => getValue('fontSize') || '',
    setValue: (value: any) => setValue('fontSize', value)
  });
}

function FontWeightProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Font Weight'),
    getValue: () => getValue('fontWeight') || 'Normal',
    setValue: (value: any) => setValue('fontWeight', value)
  });
}

function FontStyleProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Font Style'),
    getValue: () => getValue('fontStyle') || 'Normal',
    setValue: (value: any) => setValue('fontStyle', value)
  });
}

function FontColorProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Font Color'),
    getValue: () => getValue('fontColor') || '',
    setValue: (value: any) => setValue('fontColor', value)
  });
}

function BackgroundColorAnnotationProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Background Color (Annotation)'),
    getValue: () => getValue('backgroundColor') || '',
    setValue: (value: any) => setValue('backgroundColor', value)
  });
}

function BorderColorAnnotationProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Border Color (Annotation)'),
    getValue: () => getValue('borderColor') || '',
    setValue: (value: any) => setValue('borderColor', value)
  });
}

function CategoryValueRefProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Category Value Reference'),
    description: translate('Reference to a category value that classifies the group'),
    getValue: () => getValue('categoryValueRef') || '',
    setValue: (value: any) => setValue('categoryValueRef', value)
  });
}

function BorderColorGroupProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Border Color (Group)'),
    getValue: () => getValue('borderColor') || '',
    setValue: (value: any) => setValue('borderColor', value)
  });
}

function BackgroundColorGroupProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Background Color (Group)'),
    getValue: () => getValue('backgroundColor') || '',
    setValue: (value: any) => setValue('backgroundColor', value)
  });
}

function FontColorGroupProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Font Color (Group)'),
    getValue: () => getValue('fontColor') || '',
    setValue: (value: any) => setValue('fontColor', value)
  });
}

function FontSizeGroupProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Font Size (Group)'),
    getValue: () => getValue('fontSize') || '',
    setValue: (value: any) => setValue('fontSize', value)
  });
}

function FontSizeAnnotationProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Font Size (Annotation)'),
    getValue: () => getValue('fontSize') || '',
    setValue: (value: any) => setValue('fontSize', value)
  });
}

function FontWeightAnnotationProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Font Weight (Annotation)'),
    getValue: () => getValue('fontWeight') || 'Normal',
    setValue: (value: any) => setValue('fontWeight', value)
  });
}

function FontStyleAnnotationProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Font Style (Annotation)'),
    getValue: () => getValue('fontStyle') || 'Normal',
    setValue: (value: any) => setValue('fontStyle', value)
  });
}

function FontColorAnnotationProperty(props: { id: any; getValue: any; setValue: any; translate: any; }) {
  const { id, getValue, setValue, translate } = props;
  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Font Color (Annotation)'),
    getValue: () => getValue('fontColor') || '',
    setValue: (value: any) => setValue('fontColor', value)
  });
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