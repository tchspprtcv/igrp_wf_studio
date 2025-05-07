import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { TextFieldEntry, CheckboxEntry, SelectEntry, TextAreaEntry } from '@bpmn-io/properties-panel';

const LOW_PRIORITY = 500;

class ActivitiPropertiesProvider {
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
    return (groups: any[]) => {
      // Add Activiti specific properties for tasks
      if (is(element, 'bpmn:Task') || is(element, 'bpmn:Activity')) {
        const activitiGeneralGroup = {
          id: 'activitiGeneral',
          label: this.translate('Activiti General'),
          component: (props: any) => ActivitiGeneralGroup({ ...props, translate: this.translate, moddle: this.moddle, commandStack: this.commandStack }),
          element: element
        };
        groups.push(activitiGeneralGroup);
      }

      // Add Activiti specific properties for service tasks
      if (is(element, 'bpmn:ServiceTask')) {
        const activitiServiceTaskGroup = {
          id: 'activitiServiceTask',
          label: this.translate('Activiti Service Task'),
          component: (props: any) => ActivitiServiceTaskGroup({ ...props, translate: this.translate, moddle: this.moddle, commandStack: this.commandStack }),
          element: element
        };
        groups.push(activitiServiceTaskGroup);
      }

      // Add Activiti specific properties for user tasks
      if (is(element, 'bpmn:UserTask')) {
        const activitiUserTaskGroup = {
          id: 'activitiUserTask',
          label: this.translate('Activiti User Task'),
          component: (props: any) => ActivitiUserTaskGroup({ ...props, translate: this.translate, moddle: this.moddle, commandStack: this.commandStack }),
          element: element
        };
        groups.push(activitiUserTaskGroup);
      }

      // Add Activiti specific properties for call activities
      if (is(element, 'bpmn:CallActivity')) {
        const activitiCallActivityGroup = {
          id: 'activitiCallActivity',
          label: this.translate('Activiti Call Activity'),
          component: (props: any) => ActivitiCallActivityGroup({ ...props, translate: this.translate, moddle: this.moddle, commandStack: this.commandStack }),
          element: element
        };
        groups.push(activitiCallActivityGroup);
      }

      // Add Activiti specific properties for processes
      if (is(element, 'bpmn:Process')) {
        const activitiProcessGroup = {
          id: 'activitiProcess',
          label: this.translate('Activiti Process'),
          component: (props: any) => ActivitiProcessGroup({ ...props, translate: this.translate, moddle: this.moddle, commandStack: this.commandStack }),
          element: element
        };
        groups.push(activitiProcessGroup);
      }

      // Add Activiti specific properties for multi-instance activities
      if (element.businessObject.loopCharacteristics && 
          is(element.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')) {
        const activitiMultiInstanceGroup = {
          id: 'activitiMultiInstance',
          label: this.translate('Activiti Multi Instance'),
          component: (props: any) => ActivitiMultiInstanceGroup({ ...props, translate: this.translate, moddle: this.moddle, commandStack: this.commandStack }),
          element: element
        };
        groups.push(activitiMultiInstanceGroup);
      }

      // Add Activiti specific properties for execution listeners
      if (is(element, 'bpmn:FlowElement') || is(element, 'bpmn:Process') || is(element, 'bpmn:Collaboration')) {
        const activitiListenersGroup = {
          id: 'activitiListeners',
          label: this.translate('Activiti Listeners'),
          component: (props: any) => ActivitiListenersGroup({ ...props, translate: this.translate, moddle: this.moddle, commandStack: this.commandStack }),
          element: element
        };
        groups.push(activitiListenersGroup);
      }

      return groups;
    };
  }
}

// Activiti General Group for all tasks
function ActivitiGeneralGroup(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  const { element, translate, moddle, commandStack } = props;

  const businessObject = getBusinessObject(element);

  // Get Activiti extension elements
  const getExtensionElements = () => {
    let extensionElements = businessObject.extensionElements;
    
    if (!extensionElements) {
      extensionElements = moddle.create('bpmn:ExtensionElements', { values: [] });
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties: { extensionElements }
      });
    }
    
    return extensionElements;
  };

  // Get or create Activiti properties
  const getActivitiProperties = () => {
    const extensionElements = getExtensionElements();
    let properties = extensionElements.values.find((e: any) => e.$type === 'activiti:Properties');
    
    if (!properties) {
      properties = moddle.create('activiti:Properties', { values: [] });
      extensionElements.values.push(properties);
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: extensionElements,
        properties: { values: extensionElements.values }
      });
    }
    
    return properties;
  };

  // Get Activiti property value
  const getPropertyValue = (propertyName: string) => {
    const properties = getActivitiProperties();
    const property = properties.values.find((p: any) => p.name === propertyName);
    return property ? property.value : '';
  };

  // Set Activiti property value
  const setPropertyValue = (propertyName: string, value: string) => {
    const properties = getActivitiProperties();
    let property = properties.values.find((p: any) => p.name === propertyName);
    
    if (!property) {
      property = moddle.create('activiti:Property', { name: propertyName, value });
      properties.values.push(property);
    } else {
      property.value = value;
    }
    
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: properties,
      properties: { values: properties.values }
    });
  };

  // Get direct Activiti attribute
  const getActivitiAttribute = (attr: string) => {
    return businessObject.get('activiti:' + attr);
  };

  // Set direct Activiti attribute
  const setActivitiAttribute = (attr: string, value: any) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: { ['activiti:' + attr]: value }
    });
  };

  return [
    {
      id: 'activitiAsync',
      component: ActivitiAsyncProperty,
      getValue: () => getActivitiAttribute('async') || false,
      setValue: (value: boolean) => setActivitiAttribute('async', value),
      translate
    },
    {
      id: 'activitiExclusive',
      component: ActivitiExclusiveProperty,
      getValue: () => {
        const exclusive = getActivitiAttribute('exclusive');
        return exclusive === undefined ? true : exclusive;
      },
      setValue: (value: boolean) => setActivitiAttribute('exclusive', value),
      translate
    },
    {
      id: 'activitiJobPriority',
      component: ActivitiJobPriorityProperty,
      getValue: () => getActivitiAttribute('jobPriority') || '',
      setValue: (value: string) => setActivitiAttribute('jobPriority', value),
      translate
    }
  ];
}

// Activiti Service Task Group
function ActivitiServiceTaskGroup(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  const { element, translate, moddle, commandStack } = props;

  const businessObject = getBusinessObject(element);

  // Get direct Activiti attribute
  const getActivitiAttribute = (attr: string) => {
    return businessObject.get('activiti:' + attr);
  };

  // Set direct Activiti attribute
  const setActivitiAttribute = (attr: string, value: any) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: { ['activiti:' + attr]: value }
    });
  };

  return [
    {
      id: 'activitiClass',
      component: ActivitiClassProperty,
      getValue: () => getActivitiAttribute('class') || '',
      setValue: (value: string) => {
        // Clear other implementation types when setting class
        if (value) {
          setActivitiAttribute('expression', undefined);
          setActivitiAttribute('delegateExpression', undefined);
        }
        setActivitiAttribute('class', value);
      },
      translate
    },
    {
      id: 'activitiExpression',
      component: ActivitiExpressionProperty,
      getValue: () => getActivitiAttribute('expression') || '',
      setValue: (value: string) => {
        // Clear other implementation types when setting expression
        if (value) {
          setActivitiAttribute('class', undefined);
          setActivitiAttribute('delegateExpression', undefined);
        }
        setActivitiAttribute('expression', value);
      },
      translate
    },
    {
      id: 'activitiDelegateExpression',
      component: ActivitiDelegateExpressionProperty,
      getValue: () => getActivitiAttribute('delegateExpression') || '',
      setValue: (value: string) => {
        // Clear other implementation types when setting delegateExpression
        if (value) {
          setActivitiAttribute('class', undefined);
          setActivitiAttribute('expression', undefined);
        }
        setActivitiAttribute('delegateExpression', value);
      },
      translate
    },
    {
      id: 'activitiResultVariable',
      component: ActivitiResultVariableProperty,
      getValue: () => getActivitiAttribute('resultVariable') || '',
      setValue: (value: string) => setActivitiAttribute('resultVariable', value),
      translate
    }
  ];
}

// Activiti User Task Group
function ActivitiUserTaskGroup(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  const { element, translate, moddle, commandStack } = props;

  const businessObject = getBusinessObject(element);

  // Get direct Activiti attribute
  const getActivitiAttribute = (attr: string) => {
    return businessObject.get('activiti:' + attr);
  };

  // Set direct Activiti attribute
  const setActivitiAttribute = (attr: string, value: any) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: { ['activiti:' + attr]: value }
    });
  };

  return [
    {
      id: 'activitiAssignee',
      component: ActivitiAssigneeProperty,
      getValue: () => getActivitiAttribute('assignee') || '',
      setValue: (value: string) => setActivitiAttribute('assignee', value),
      translate
    },
    {
      id: 'activitiCandidateUsers',
      component: ActivitiCandidateUsersProperty,
      getValue: () => getActivitiAttribute('candidateUsers') || '',
      setValue: (value: string) => setActivitiAttribute('candidateUsers', value),
      translate
    },
    {
      id: 'activitiCandidateGroups',
      component: ActivitiCandidateGroupsProperty,
      getValue: () => getActivitiAttribute('candidateGroups') || '',
      setValue: (value: string) => setActivitiAttribute('candidateGroups', value),
      translate
    },
    {
      id: 'activitiDueDate',
      component: ActivitiDueDateProperty,
      getValue: () => getActivitiAttribute('dueDate') || '',
      setValue: (value: string) => setActivitiAttribute('dueDate', value),
      translate
    },
    {
      id: 'activitiPriority',
      component: ActivitiPriorityProperty,
      getValue: () => getActivitiAttribute('priority') || '',
      setValue: (value: string) => setActivitiAttribute('priority', value),
      translate
    },
    {
      id: 'activitiFormKey',
      component: ActivitiFormKeyProperty,
      getValue: () => getActivitiAttribute('formKey') || '',
      setValue: (value: string) => setActivitiAttribute('formKey', value),
      translate
    }
  ];
}

// Activiti Call Activity Group
function ActivitiCallActivityGroup(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  const { element, translate, moddle, commandStack } = props;

  const businessObject = getBusinessObject(element);

  // Get direct Activiti attribute
  const getActivitiAttribute = (attr: string) => {
    return businessObject.get('activiti:' + attr);
  };

  // Set direct Activiti attribute
  const setActivitiAttribute = (attr: string, value: any) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: { ['activiti:' + attr]: value }
    });
  };

  // Get Activiti extension elements
  const getExtensionElements = () => {
    let extensionElements = businessObject.extensionElements;
    
    if (!extensionElements) {
      extensionElements = moddle.create('bpmn:ExtensionElements', { values: [] });
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties: { extensionElements }
      });
    }
    
    return extensionElements;
  };

  // Get In/Out mappings
  const getInMappings = () => {
    const extensionElements = getExtensionElements();
    return extensionElements.values.filter((e: any) => e.$type === 'activiti:In');
  };

  const getOutMappings = () => {
    const extensionElements = getExtensionElements();
    return extensionElements.values.filter((e: any) => e.$type === 'activiti:Out');
  };

  return [
    {
      id: 'activitiCalledElementBinding',
      component: ActivitiCalledElementBindingProperty,
      getValue: () => getActivitiAttribute('calledElementBinding') || 'latest',
      setValue: (value: string) => setActivitiAttribute('calledElementBinding', value),
      translate
    },
    {
      id: 'activitiCalledElementVersion',
      component: ActivitiCalledElementVersionProperty,
      getValue: () => getActivitiAttribute('calledElementVersion') || '',
      setValue: (value: string) => setActivitiAttribute('calledElementVersion', value),
      translate,
      isVisible: () => getActivitiAttribute('calledElementBinding') === 'version'
    },
    {
      id: 'activitiCalledElementVersionTag',
      component: ActivitiCalledElementVersionTagProperty,
      getValue: () => getActivitiAttribute('calledElementVersionTag') || '',
      setValue: (value: string) => setActivitiAttribute('calledElementVersionTag', value),
      translate,
      isVisible: () => getActivitiAttribute('calledElementBinding') === 'versionTag'
    },
    {
      id: 'activitiCalledElementTenantId',
      component: ActivitiCalledElementTenantIdProperty,
      getValue: () => getActivitiAttribute('calledElementTenantId') || '',
      setValue: (value: string) => setActivitiAttribute('calledElementTenantId', value),
      translate
    }
  ];
}

// Activiti Process Group
function ActivitiProcessGroup(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  const { element, translate, moddle, commandStack } = props;

  const businessObject = getBusinessObject(element);

  // Get direct Activiti attribute
  const getActivitiAttribute = (attr: string) => {
    return businessObject.get('activiti:' + attr);
  };

  // Set direct Activiti attribute
  const setActivitiAttribute = (attr: string, value: any) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: { ['activiti:' + attr]: value }
    });
  };

  return [
    {
      id: 'activitiCandidateStarterGroups',
      component: ActivitiCandidateStarterGroupsProperty,
      getValue: () => getActivitiAttribute('candidateStarterGroups') || '',
      setValue: (value: string) => setActivitiAttribute('candidateStarterGroups', value),
      translate
    },
    {
      id: 'activitiCandidateStarterUsers',
      component: ActivitiCandidateStarterUsersProperty,
      getValue: () => getActivitiAttribute('candidateStarterUsers') || '',
      setValue: (value: string) => setActivitiAttribute('candidateStarterUsers', value),
      translate
    },
    {
      id: 'activitiVersionTag',
      component: ActivitiVersionTagProperty,
      getValue: () => getActivitiAttribute('versionTag') || '',
      setValue: (value: string) => setActivitiAttribute('versionTag', value),
      translate
    },
    {
      id: 'activitiHistoryTimeToLive',
      component: ActivitiHistoryTimeToLiveProperty,
      getValue: () => getActivitiAttribute('historyTimeToLive') || '',
      setValue: (value: string) => setActivitiAttribute('historyTimeToLive', value),
      translate
    },
    {
      id: 'activitiIsStartableInTasklist',
      component: ActivitiIsStartableInTasklistProperty,
      getValue: () => {
        const isStartable = getActivitiAttribute('isStartableInTasklist');
        return isStartable === undefined ? true : isStartable;
      },
      setValue: (value: boolean) => setActivitiAttribute('isStartableInTasklist', value),
      translate
    }
  ];
}

// Activiti Multi Instance Group
function ActivitiMultiInstanceGroup(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  const { element, translate, moddle, commandStack } = props;

  const businessObject = getBusinessObject(element);
  const loopCharacteristics = businessObject.loopCharacteristics;

  // Get direct Activiti attribute from loop characteristics
  const getActivitiAttribute = (attr: string) => {
    return loopCharacteristics.get('activiti:' + attr);
  };

  // Set direct Activiti attribute on loop characteristics
  const setActivitiAttribute = (attr: string, value: any) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: loopCharacteristics,
      properties: { ['activiti:' + attr]: value }
    });
  };

  // Get Activiti extension elements
  const getExtensionElements = () => {
    let extensionElements = loopCharacteristics.extensionElements;
    
    if (!extensionElements) {
      extensionElements = moddle.create('bpmn:ExtensionElements', { values: [] });
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: loopCharacteristics,
        properties: { extensionElements }
      });
    }
    
    return extensionElements;
  };

  // Get or create Activiti failed job retry time cycle
  const getFailedJobRetryTimeCycle = () => {
    const extensionElements = getExtensionElements();
    let retryTimeCycle = extensionElements.values.find((e: any) => e.$type === 'activiti:FailedJobRetryTimeCycle');
    
    if (!retryTimeCycle) {
      retryTimeCycle = moddle.create('activiti:FailedJobRetryTimeCycle', { body: '' });
      extensionElements.values.push(retryTimeCycle);
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: extensionElements,
        properties: { values: extensionElements.values }
      });
    }
    
    return retryTimeCycle;
  };

  return [
    {
      id: 'activitiAsyncBefore',
      component: ActivitiAsyncBeforeProperty,
      getValue: () => getActivitiAttribute('asyncBefore') || false,
      setValue: (value: boolean) => setActivitiAttribute('asyncBefore', value),
      translate
    },
    {
      id: 'activitiAsyncAfter',
      component: ActivitiAsyncAfterProperty,
      getValue: () => getActivitiAttribute('asyncAfter') || false,
      setValue: (value: boolean) => setActivitiAttribute('asyncAfter', value),
      translate
    },
    {
      id: 'activitiFailedJobRetryTimeCycle',
      component: ActivitiFailedJobRetryTimeCycleProperty,
      getValue: () => {
        const retryTimeCycle = getFailedJobRetryTimeCycle();
        return retryTimeCycle.body || '';
      },
      setValue: (value: string) => {
        const retryTimeCycle = getFailedJobRetryTimeCycle();
        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: retryTimeCycle,
          properties: { body: value }
        });
      },
      translate
    }
  ];
}

// Activiti Listeners Group
function ActivitiListenersGroup(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  const { element, translate, moddle, commandStack } = props;
  
  return [
    {
      id: 'activitiListenersInfo',
      component: ActivitiListenersInfoProperty,
      translate
    }
  ];
}

// Individual property components

function ActivitiAsyncProperty(props: { id: string; getValue: () => boolean; setValue: (value: boolean) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return CheckboxEntry({
    element: { id },
    id: id,
    label: translate('Asynchronous'),
    description: translate('The task is executed asynchronously'),
    getValue: () => getValue(),
    setValue: (value: boolean) => setValue(value)
  });
}

function ActivitiExclusiveProperty(props: { id: string; getValue: () => boolean; setValue: (value: boolean) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return CheckboxEntry({
    element: { id },
    id: id,
    label: translate('Exclusive'),
    description: translate('The job is executed exclusively'),
    getValue: () => getValue(),
    setValue: (value: boolean) => setValue(value)
  });
}

function ActivitiJobPriorityProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Job Priority'),
    description: translate('Priority for jobs related to this element'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiClassProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Java Class'),
    description: translate('The fully qualified Java class name'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiExpressionProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Expression'),
    description: translate('Expression that resolves to a delegate implementation'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiDelegateExpressionProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Delegate Expression'),
    description: translate('Expression that resolves to a delegate implementation'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiResultVariableProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Result Variable'),
    description: translate('Name of variable to store the result'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiAssigneeProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Assignee'),
    description: translate('User assigned to this task'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiCandidateUsersProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Candidate Users'),
    description: translate('Comma-separated list of candidate users'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiCandidateGroupsProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Candidate Groups'),
    description: translate('Comma-separated list of candidate groups'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiDueDateProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Due Date'),
    description: translate('Due date for the task (ISO date or expression)'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiPriorityProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Priority'),
    description: translate('Priority of the task'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiFormKeyProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Form Key'),
    description: translate('Key of the form to use'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiCalledElementBindingProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return SelectEntry({
    element: { id },
    id: id,
    label: translate('Called Element Binding'),
    description: translate('Version binding for the called process'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value),
    getOptions: () => [
      { value: 'latest', label: translate('Latest') },
      { value: 'deployment', label: translate('Deployment') },
      { value: 'version', label: translate('Version') },
      { value: 'versionTag', label: translate('Version Tag') }
    ]
  });
}

function ActivitiCalledElementVersionProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Called Element Version'),
    description: translate('Version of the called process'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiCalledElementVersionTagProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Called Element Version Tag'),
    description: translate('Version tag of the called process'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiCalledElementTenantIdProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Called Element Tenant ID'),
    description: translate('Tenant ID of the called process'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiCandidateStarterGroupsProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Candidate Starter Groups'),
    description: translate('Comma-separated list of candidate starter groups'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiCandidateStarterUsersProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Candidate Starter Users'),
    description: translate('Comma-separated list of candidate starter users'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiVersionTagProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Version Tag'),
    description: translate('Version tag of the process'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiHistoryTimeToLiveProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('History Time To Live'),
    description: translate('History time to live in days'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiIsStartableInTasklistProperty(props: { id: string; getValue: () => boolean; setValue: (value: boolean) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return CheckboxEntry({
    element: { id },
    id: id,
    label: translate('Is Startable In Tasklist'),
    description: translate('Process can be started from the tasklist'),
    getValue: () => getValue(),
    setValue: (value: boolean) => setValue(value)
  });
}

function ActivitiAsyncBeforeProperty(props: { id: string; getValue: () => boolean; setValue: (value: boolean) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return CheckboxEntry({
    element: { id },
    id: id,
    label: translate('Asynchronous Before'),
    description: translate('Task is executed asynchronously before entering the activity'),
    getValue: () => getValue(),
    setValue: (value: boolean) => setValue(value)
  });
}

function ActivitiAsyncAfterProperty(props: { id: string; getValue: () => boolean; setValue: (value: boolean) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return CheckboxEntry({
    element: { id },
    id: id,
    label: translate('Asynchronous After'),
    description: translate('Task is executed asynchronously after the activity'),
    getValue: () => getValue(),
    setValue: (value: boolean) => setValue(value)
  });
}

function ActivitiFailedJobRetryTimeCycleProperty(props: { id: string; getValue: () => string; setValue: (value: string) => void; translate: any }) {
  const { id, getValue, setValue, translate } = props;

  return TextFieldEntry({
    element: { id },
    id: id,
    label: translate('Failed Job Retry Time Cycle'),
    description: translate('Retry time cycle for failed jobs (e.g., R3/PT10M)'),
    getValue: () => getValue(),
    setValue: (value: string) => setValue(value)
  });
}

function ActivitiListenersInfoProperty(props: { id: string; translate: any }) {
  const { id, translate } = props;

  return {
    id,
    component: () => {
      return {
        id,
        html: `
          <div class="bio-properties-panel-entry">
            <div class="bio-properties-panel-description">
              ${translate('Execution and task listeners can be configured in the XML editor.')}
            </div>
          </div>
        `
      };
    }
  };
}

ActivitiPropertiesProvider.$inject = ['propertiesPanel', 'translate', 'moddle', 'bpmnFactory', 'commandStack', 'elementRegistry'];

export default ActivitiPropertiesProvider;