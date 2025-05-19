import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { TextFieldEntry, CheckboxEntry, SelectEntry, TextAreaEntry } from '@bpmn-io/properties-panel';

// const HIGH_PRIORITY = 50; // Priority can be set in BpmnModeler.tsx if needed

// Helper function to create a property (generic for different types)
function Property(props: { element: any, id: string, label: string, component: any, getValue: () => any, setValue: (value: any) => void, translate: any, isVisible?: () => boolean }) {
  const { element, id, label, component, getValue, setValue, translate, isVisible } = props;
  return component({ element, id, label, getValue, setValue, translate, isVisible });
}

// Component Stubs (replace with actual components or remove if not needed for this provider)
const VersionTagProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Version Tag') });
const IsExecutableProperty = (props: any) => CheckboxEntry({ ...props, label: props.translate('Is Executable') });
const TaskPriorityProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Task Priority (Activiti)') });
const JobPriorityProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Job Priority') });
const HistoryTimeToLiveProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('History Time To Live') });

const ActivitiAsyncProperty = (props: any) => CheckboxEntry({ ...props, label: props.translate('Async') });
const ActivitiExclusiveProperty = (props: any) => CheckboxEntry({ ...props, label: props.translate('Exclusive') });
const ActivitiJobPriorityProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Job Priority (Activiti Task)') });

const ActivitiClassProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Class') });
const ActivitiExpressionProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Expression') });
const ActivitiDelegateExpressionProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Delegate Expression') });
const ActivitiResultVariableProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Result Variable') });

const ActivitiAssigneeProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Assignee') });
const ActivitiCandidateUsersProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Candidate Users') });
const ActivitiCandidateGroupsProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Candidate Groups') });
const ActivitiDueDateProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Due Date') });
const ActivitiPriorityProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Priority (User Task)') });
const ActivitiFormKeyProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Form Key') });

const ActivitiCalledElementBindingProperty = (props: any) => SelectEntry({ ...props, label: props.translate('Called Element Binding'), getOptions: () => [{value: 'latest', label: 'Latest'}, {value: 'deployment', label: 'Deployment'}, {value: 'version', label: 'Version'}, {value: 'versionTag', label: 'Version Tag'}] });
const ActivitiCalledElementVersionProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Called Element Version') });
const ActivitiCalledElementVersionTagProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Called Element Version Tag') });
const ActivitiCalledElementTenantIdProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Called Element Tenant ID') });

const ActivitiCandidateStarterGroupsProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Candidate Starter Groups') });
const ActivitiCandidateStarterUsersProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Candidate Starter Users') });
const ActivitiIsStartableInTasklistProperty = (props: any) => CheckboxEntry({ ...props, label: props.translate('Is Startable in Tasklist') });

const ActivitiCollectionProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Collection') });
const ActivitiElementVariableProperty = (props: any) => TextFieldEntry({ ...props, label: props.translate('Element Variable') });
const ActivitiCompletionConditionProperty = (props: any) => TextAreaEntry({ ...props, label: props.translate('Completion Condition') });

class ActivitiPropertiesProvider {
  private _translate: any;
  private _moddle: any;
  private _bpmnFactory: any;
  private _commandStack: any;
  private _elementRegistry: any; // Not used in this simplified version, can be added if needed
  private _eventBus: any; // Not used in this simplified version, can be added if needed

  static $inject = ['eventBus', 'translate', 'moddle', 'bpmnFactory', 'commandStack', 'propertiesPanel']; // Ensure propertiesPanel is injected for bpmn-js to register the provider

  constructor(eventBus: any, translate: any, moddle: any, bpmnFactory: any, commandStack: any /* propertiesPanel: any */) { // propertiesPanel removed as it's not used directly in the constructor body
    console.log('[ActivitiProps] Constructor called');
    this._translate = translate;
    this._moddle = moddle;
    this._bpmnFactory = bpmnFactory;
    this._commandStack = commandStack;
   // this._elementRegistry = propertiesPanel._elementRegistry; // Not used in this simplified version, can be added if needed
    this._eventBus = eventBus;

    // }); // <--- REMOVING THIS MANUAL REGISTRATION
    // propertiesPanel.registerProvider(HIGH_PRIORITY, this); // Registration should be handled by bpmn-js
    console.log('[ActivitiProps] Constructor completed');
  }

  getGroups(element: any) {
    console.log('[ActivitiProps] getGroups called for element:', element, 'type:', element.type);
    const groups: any[] = [];

    // General BPMN properties group (often handled by BpmnPropertiesProviderModule, but can add Activiti specific ones here)
    // Example: Add a general Activiti group if needed for properties applicable to many elements

    // Process specific properties
    if (is(element, 'bpmn:Process')) {
      console.log('[ActivitiProps] Element is bpmn:Process, creating process properties group.');
      groups.push({
        id: 'activitiProcessProperties',
        label: this._translate('Activiti Process Properties'),
        entries: ProcessPropertiesGroupEntries({ // Call the entries function directly
          element: element,
          translate: this._translate,
          moddle: this._moddle,
          commandStack: this._commandStack,
          bpmnFactory: this._bpmnFactory
        })
      });
    }

    // Task/Activity specific properties (General Activiti Task properties)
    if (is(element, 'bpmn:Task') || 
        is(element, 'bpmn:Activity') || 
        is(element, 'bpmn:UserTask') || 
        is(element, 'bpmn:ServiceTask') || 
        is(element, 'bpmn:CallActivity')) {
      console.log('[ActivitiProps] Element is bpmn:Task or bpmn:Activity, creating task properties group for type:', element.type);
      groups.push({
        id: 'activitiTaskProperties',
        label: this._translate('Activiti Task Properties'),
        entries: ActivitiUserTaskPropertiesEntries({ // Call the entries function directly
          element: element,
          translate: this._translate,
          moddle: this._moddle,
          commandStack: this._commandStack
        })
      });
    }

    // Add other groups for different element types if needed
    // Example: Add a group for Start Events if they have specific Activiti properties
    // if (is(element, 'bpmn:StartEvent')) {
    //   groups.push({
    //     id: 'activitiStartEventProperties',
    //     label: this._translate('Activiti Start Event Properties'),
    //     entries: ActivitiStartEventEntries({ element, translate: this._translate, moddle: this._moddle, commandStack: this._commandStack })
    //   });
    // }

    console.log('[ActivitiProps] Final groups being returned for element:', element.type, groups);
    return groups;
  }
}

// Entries for Process Properties Group (for bpmn:Process)
function ProcessPropertiesGroupEntries(props: { element: any; translate: any; moddle: any; commandStack: any; bpmnFactory: any; }) {
  console.log('[ActivitiProps] ProcessPropertiesGroupEntries called for element:', props.element);
  const { element, translate, moddle, commandStack, bpmnFactory } = props;
  const businessObject = getBusinessObject(element);

  const getValue = (name: string) => {
    return businessObject.get(name);
  };

  const setValue = (name: string, value: any) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: { [name]: value }
    });
  };

  const getActivitiProperty = (propertyName: string) => {
    const extensionElements = businessObject.extensionElements;
    if (extensionElements && extensionElements.values) {
      const activitiProperties = extensionElements.values.find((ext: any) => ext.$type === 'activiti:Properties');
      if (activitiProperties && activitiProperties.values) {
        const prop = activitiProperties.values.find((p: any) => p.name === propertyName);
        return prop ? prop.value : '';
      }
    }
    return '';
  };

  const setActivitiProperty = (propertyName: string, value: string) => {
    let extensionElements = businessObject.extensionElements;
    if (!extensionElements) {
      // Ensure bpmnFactory is available and create ExtensionElements if it doesn't exist
      extensionElements = bpmnFactory.create('bpmn:ExtensionElements', { values: [] });
    }

    let activitiProperties = extensionElements.values.find((ext: any) => ext.$type === 'activiti:Properties');
    if (!activitiProperties) {
      // Ensure bpmnFactory is available and create activiti:Properties if it doesn't exist
      activitiProperties = bpmnFactory.create('activiti:Properties', { values: [] });
      extensionElements.values.push(activitiProperties);
    }

    let prop = activitiProperties.values.find((p: any) => p.name === propertyName);
    if (prop) {
      prop.value = value;
    } else {
      // Ensure bpmnFactory is available and create activiti:Property if it doesn't exist
      prop = bpmnFactory.create('activiti:Property', { name: propertyName, value });
      activitiProperties.values.push(prop);
    }

    // Update the business object with the modified extensionElements
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: { extensionElements }
    });
  };

  return [
    {
      id: 'versionTag',
      label: translate('Version Tag'),
      component: VersionTagProperty,
      getValue: () => getValue('versionTag') || '',
      setValue: (value: string) => setValue('versionTag', value),
    },
    {
      id: 'isExecutable',
      label: translate('Is Executable'),
      component: IsExecutableProperty,
      getValue: () => getValue('isExecutable') || false,
      setValue: (value: boolean) => setValue('isExecutable', value),
    },
    {
      id: 'taskPriority', // This is an Activiti extension property for Process
      label: translate('Task Priority (Activiti)'),
      component: TaskPriorityProperty,
      getValue: () => getActivitiProperty('taskPriority'),
      setValue: (value: string) => setActivitiProperty('taskPriority', value),
    },
    {
      id: 'jobPriority', // This is a standard BPMN property for Process
      label: translate('Job Priority'),
      component: JobPriorityProperty,
      getValue: () => getValue('jobPriority') || '',
      setValue: (value: string) => setValue('jobPriority', value),
    },
    {
      id: 'historyTimeToLive',
      label: translate('History Time To Live'),
      component: HistoryTimeToLiveProperty,
      getValue: () => getValue('historyTimeToLive') || '',
      setValue: (value: string) => setValue('historyTimeToLive', value),
    },
    // Activiti specific Process properties (candidate starter, etc.)
    {
      id: 'activitiCandidateStarterGroups',
      label: translate('Candidate Starter Groups (Activiti)'),
      component: ActivitiCandidateStarterGroupsProperty,
      getValue: () => businessObject.get('activiti:candidateStarterGroups') || '',
      setValue: (value: string) => setValue('activiti:candidateStarterGroups', value),
    },
    {
      id: 'activitiCandidateStarterUsers',
      label: translate('Candidate Starter Users (Activiti)'),
      component: ActivitiCandidateStarterUsersProperty,
      getValue: () => businessObject.get('activiti:candidateStarterUsers') || '',
      setValue: (value: string) => setValue('activiti:candidateStarterUsers', value),
    },
    {
      id: 'activitiIsStartableInTasklist',
      label: translate('Is Startable in Tasklist (Activiti)'),
      component: ActivitiIsStartableInTasklistProperty,
      getValue: () => {
        const isStartable = businessObject.get('activiti:isStartableInTasklist');
        return isStartable === undefined ? true : isStartable; // Default to true if not set
      },
      setValue: (value: boolean) => setValue('activiti:isStartableInTasklist', value),
    }
  ];
}

// Main function for Activiti Task Properties Entries
function ActivitiUserTaskPropertiesEntries(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  console.log('[ActivitiProps] ActivitiUserTaskPropertiesEntries called for element:', props.element);
  const { element, translate, moddle, commandStack } = props;
  const businessObject = getBusinessObject(element);

  let entries: any[] = [];

  // Add General Activiti Properties
  entries = entries.concat(ActivitiGeneralEntries({ element, translate, moddle, commandStack }));

  // Add Service Task specific properties
  if (is(element, 'bpmn:ServiceTask')) {
    entries = entries.concat(ActivitiServiceTaskEntries({ element, translate, moddle, commandStack }));
  }

  // Add User Task specific properties
  if (is(element, 'bpmn:UserTask')) {
    entries = entries.concat(ActivitiUserTaskEntries({ element, translate, moddle, commandStack }));
  }

  // Add Call Activity specific properties
  if (is(element, 'bpmn:CallActivity')) {
    entries = entries.concat(ActivitiCallActivityEntries({ element, translate, moddle, commandStack }));
  }

  // Add Multi-Instance specific properties if applicable
  if (businessObject.loopCharacteristics && is(businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')) {
    entries = entries.concat(ActivitiMultiInstanceEntries({ element, translate, moddle, commandStack }));
  }

  return entries;
}

// Activiti General Entries for all tasks
function ActivitiGeneralEntries(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  console.log('[ActivitiProps] ActivitiGeneralEntries called for element:', props.element);
  const { element, translate, moddle, commandStack } = props;
  const businessObject = getBusinessObject(element);

  const getActivitiAttribute = (attr: string) => {
    return businessObject.get('activiti:' + attr);
  };

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
      label: translate('Async'),
      component: ActivitiAsyncProperty,
      getValue: () => getActivitiAttribute('async') || false,
      setValue: (value: boolean) => setActivitiAttribute('async', value),
    },
    {
      id: 'activitiExclusive',
      label: translate('Exclusive'),
      component: ActivitiExclusiveProperty,
      getValue: () => {
        const exclusive = getActivitiAttribute('exclusive');
        return exclusive === undefined ? true : exclusive; // Default to true
      },
      setValue: (value: boolean) => setActivitiAttribute('exclusive', value),
    },
    {
      id: 'activitiJobPriorityTask',
      label: translate('Job Priority (Activiti Task)'),
      component: ActivitiJobPriorityProperty,
      getValue: () => getActivitiAttribute('jobPriority') || '',
      setValue: (value: string) => setActivitiAttribute('jobPriority', value),
    }
  ];
}

// Activiti Service Task Entries
function ActivitiServiceTaskEntries(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  console.log('[ActivitiProps] ActivitiServiceTaskEntries called for element:', props.element);
  const { element, translate, moddle, commandStack } = props;
  const businessObject = getBusinessObject(element);

  const getActivitiAttribute = (attr: string) => {
    return businessObject.get('activiti:' + attr);
  };

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
      label: translate('Class'),
      component: ActivitiClassProperty,
      getValue: () => getActivitiAttribute('class') || '',
      setValue: (value: string) => {
        if (value) {
          setActivitiAttribute('expression', undefined);
          setActivitiAttribute('delegateExpression', undefined);
        }
        setActivitiAttribute('class', value);
      },
    },
    {
      id: 'activitiExpression',
      label: translate('Expression'),
      component: ActivitiExpressionProperty,
      getValue: () => getActivitiAttribute('expression') || '',
      setValue: (value: string) => {
        if (value) {
          setActivitiAttribute('class', undefined);
          setActivitiAttribute('delegateExpression', undefined);
        }
        setActivitiAttribute('expression', value);
      },
    },
    {
      id: 'activitiDelegateExpression',
      label: translate('Delegate Expression'),
      component: ActivitiDelegateExpressionProperty,
      getValue: () => getActivitiAttribute('delegateExpression') || '',
      setValue: (value: string) => {
        if (value) {
          setActivitiAttribute('class', undefined);
          setActivitiAttribute('expression', undefined);
        }
        setActivitiAttribute('delegateExpression', value);
      },
    },
    {
      id: 'activitiResultVariable',
      label: translate('Result Variable'),
      component: ActivitiResultVariableProperty,
      getValue: () => getActivitiAttribute('resultVariable') || '',
      setValue: (value: string) => setActivitiAttribute('resultVariable', value),
    }
  ];
}

// Activiti User Task Entries
function ActivitiUserTaskEntries(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  console.log('[ActivitiProps] ActivitiUserTaskEntries called for element:', props.element);
  const { element, translate, moddle, commandStack } = props;
  const businessObject = getBusinessObject(element);

  const getActivitiAttribute = (attr: string) => {
    return businessObject.get('activiti:' + attr);
  };

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
      label: translate('Assignee'),
      component: ActivitiAssigneeProperty,
      getValue: () => getActivitiAttribute('assignee') || '',
      setValue: (value: string) => setActivitiAttribute('assignee', value),
    },
    {
      id: 'activitiCandidateUsers',
      label: translate('Candidate Users'),
      component: ActivitiCandidateUsersProperty,
      getValue: () => getActivitiAttribute('candidateUsers') || '',
      setValue: (value: string) => setActivitiAttribute('candidateUsers', value),
    },
    {
      id: 'activitiCandidateGroups',
      label: translate('Candidate Groups'),
      component: ActivitiCandidateGroupsProperty,
      getValue: () => getActivitiAttribute('candidateGroups') || '',
      setValue: (value: string) => setActivitiAttribute('candidateGroups', value),
    },
    {
      id: 'activitiDueDate',
      label: translate('Due Date'),
      component: ActivitiDueDateProperty,
      getValue: () => getActivitiAttribute('dueDate') || '',
      setValue: (value: string) => setActivitiAttribute('dueDate', value),
    },
    {
      id: 'activitiPriorityUserTask',
      label: translate('Priority (User Task)'),
      component: ActivitiPriorityProperty,
      getValue: () => getActivitiAttribute('priority') || '',
      setValue: (value: string) => setActivitiAttribute('priority', value),
    },
    {
      id: 'activitiFormKey',
      label: translate('Form Key'),
      component: ActivitiFormKeyProperty,
      getValue: () => getActivitiAttribute('formKey') || '',
      setValue: (value: string) => setActivitiAttribute('formKey', value),
    }
  ];
}

// Activiti Call Activity Entries
function ActivitiCallActivityEntries(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  console.log('[ActivitiProps] ActivitiCallActivityEntries called for element:', props.element);
  const { element, translate, moddle, commandStack } = props;
  const businessObject = getBusinessObject(element);

  const getActivitiAttribute = (attr: string) => {
    return businessObject.get('activiti:' + attr);
  };

  const setActivitiAttribute = (attr: string, value: any) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: { ['activiti:' + attr]: value }
    });
  };

  return [
    {
      id: 'activitiCalledElementBinding',
      label: translate('Called Element Binding'),
      component: ActivitiCalledElementBindingProperty,
      getValue: () => getActivitiAttribute('calledElementBinding') || 'latest',
      setValue: (value: string) => setActivitiAttribute('calledElementBinding', value),
    },
    {
      id: 'activitiCalledElementVersion',
      label: translate('Called Element Version'),
      component: ActivitiCalledElementVersionProperty,
      getValue: () => getActivitiAttribute('calledElementVersion') || '',
      setValue: (value: string) => setActivitiAttribute('calledElementVersion', value),
      isVisible: () => getActivitiAttribute('calledElementBinding') === 'version'
    },
    {
      id: 'activitiCalledElementVersionTag',
      label: translate('Called Element Version Tag'),
      component: ActivitiCalledElementVersionTagProperty,
      getValue: () => getActivitiAttribute('calledElementVersionTag') || '',
      setValue: (value: string) => setActivitiAttribute('calledElementVersionTag', value),
      isVisible: () => getActivitiAttribute('calledElementBinding') === 'versionTag'
    },
    {
      id: 'activitiCalledElementTenantId',
      label: translate('Called Element Tenant ID'),
      component: ActivitiCalledElementTenantIdProperty,
      getValue: () => getActivitiAttribute('calledElementTenantId') || '',
      setValue: (value: string) => setActivitiAttribute('calledElementTenantId', value),
    }
    // TODO: Add In/Out Mappings if needed, requires more complex components
  ];
}

// Activiti Multi Instance Entries
function ActivitiMultiInstanceEntries(props: { element: any; translate: any; moddle: any; commandStack: any; }) {
  console.log('[ActivitiProps] ActivitiMultiInstanceEntries called for element:', props.element);
  const { element, translate, moddle, commandStack } = props;
  const businessObject = getBusinessObject(element);
  const loopCharacteristics = businessObject.loopCharacteristics;

  const getLoopCharActivitiAttribute = (attr: string) => {
    return loopCharacteristics.get('activiti:' + attr);
  };

  const setLoopCharActivitiAttribute = (attr: string, value: any) => {
    commandStack.execute('element.updateModdleProperties', {
      element, // The element whose loopCharacteristics are being modified
      moddleElement: loopCharacteristics,
      properties: { ['activiti:' + attr]: value }
    });
  };

  return [
    {
      id: 'activitiCollection',
      label: translate('Collection'),
      component: ActivitiCollectionProperty,
      getValue: () => getLoopCharActivitiAttribute('collection') || '',
      setValue: (value: string) => setLoopCharActivitiAttribute('collection', value),
      isVisible: () => !!loopCharacteristics // Only if loopCharacteristics exists
    },
    {
      id: 'activitiElementVariable',
      label: translate('Element Variable'),
      component: ActivitiElementVariableProperty,
      getValue: () => getLoopCharActivitiAttribute('elementVariable') || '',
      setValue: (value: string) => setLoopCharActivitiAttribute('elementVariable', value),
      isVisible: () => !!loopCharacteristics
    },
    {
      id: 'activitiCompletionCondition',
      label: translate('Completion Condition'),
      component: ActivitiCompletionConditionProperty,
      getValue: () => loopCharacteristics.get('completionCondition')?.body || '',
      setValue: (value: string) => {
        let completionCondition = loopCharacteristics.get('completionCondition');
        if (!completionCondition) {
          completionCondition = moddle.create('bpmn:FormalExpression');
        }
        completionCondition.body = value;
        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: loopCharacteristics,
          properties: { completionCondition }
        });
      },
      isVisible: () => !!loopCharacteristics
    }
    // TODO: Add other multi-instance properties like sequential, loopCardinality etc.
  ];
}

ActivitiPropertiesProvider.$inject = ['eventBus', 'translate', 'moddle', 'bpmnFactory', 'commandStack', 'propertiesPanel']; // propertiesPanel is kept here for bpmn-js DI and registration mechanism

export default ActivitiPropertiesProvider;