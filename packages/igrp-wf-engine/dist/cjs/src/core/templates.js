"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAppOptionsTemplate = generateAppOptionsTemplate;
exports.generateEmptyBpmnTemplate = generateEmptyBpmnTemplate;
exports.generateProjectConfigTemplate = generateProjectConfigTemplate;
/**
 * Generates a default app-options.json file
 */
function generateAppOptionsTemplate(config) {
    const template = {
        id: config.id,
        code: config.code,
        title: config.title,
        description: config.description || '',
        status: config.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    return JSON.stringify(template, null, 2);
}
/**
 * Generates an empty BPMN file with basic structure
 */
function generateEmptyBpmnTemplate(processCode, title) {
    const processName = title || processCode;
    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:process id="Process_${processCode}" name="${processName}" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1" name="Start">
      <bpmn2:outgoing>Flow_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="EndEvent_1" name="End">
      <bpmn2:incoming>Flow_1</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${processName}">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="156" y="81" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="160" y="124" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_EndEvent_1" bpmnElement="EndEvent_1">
        <dc:Bounds x="422" y="81" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="430" y="124" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="192" y="99" />
        <di:waypoint x="422" y="99" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;
}
/**
 * Generates a project configuration template
 */
function generateProjectConfigTemplate(projectCode, projectId) {
    const template = {
        project: projectCode,
        id: projectId,
        areas: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    return JSON.stringify(template, null, 2);
}
