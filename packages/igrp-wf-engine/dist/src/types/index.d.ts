/**
 * Core types for the IGRP Workflow Engine
 */
export interface BaseEntity {
    id: string;
    code: string;
    title: string;
    description?: string;
    status: 'active' | 'inactive' | 'draft';
    createdAt?: Date;
    updatedAt?: Date;
}
export interface WorkflowWorkspace extends BaseEntity {
    areas: Area[];
}
export interface Area extends BaseEntity {
    subareas: SubArea[];
    processes: ProcessDefinition[];
}
export interface SubArea extends BaseEntity {
    areaCode: string;
    processes: ProcessDefinition[];
}
export interface ProcessDefinition extends BaseEntity {
    areaCode: string;
    subareaCode?: string;
    bpmnXml: string;
}
export interface ProjectConfig {
    project: string;
    id: string;
    areas: AreaConfig[];
    createdAt: string;
    updatedAt: string;
}
export interface AreaConfig {
    id: string;
    title: string;
    code: string;
    description?: string;
    status: 'active' | 'inactive' | 'draft';
    subareas: SubAreaConfig[];
    processes: ProcessConfig[];
}
export interface SubAreaConfig {
    id: string;
    title: string;
    code: string;
    description?: string;
    status: 'active' | 'inactive' | 'draft';
    processes: ProcessConfig[];
}
export interface ProcessConfig {
    id: string;
    title: string;
    code: string;
    description?: string;
    status: 'active' | 'inactive' | 'draft';
    bpmnPath?: string;
}
export interface FileOperationResult {
    success: boolean;
    message: string;
    path?: string;
}
export interface AppOptions {
    id: string;
    code: string;
    title: string;
    description?: string;
    status: 'active' | 'inactive' | 'draft';
    created_at: string;
    updated_at: string;
}
