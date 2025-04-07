export interface LightspeedStatusResponse {
  status: string;
  dependencies: LightspeedStatusDependency[];
}

export interface LightspeedStatusDependencyStatus {
  provider: string;
  models: string;
}

export interface LightspeedStatusDependency {
  name: string;
  status: string | LightspeedStatusDependencyStatus;
}
