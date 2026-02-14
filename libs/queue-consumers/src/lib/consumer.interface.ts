export interface EventHandler {
  preProcessEvent(event: any): Promise<void>;
  processEvent(event: any): Promise<void>;
  postProcessEvent(event: any): Promise<void>;
}

export interface Consumer {
  init(): Promise<void>;
  preProcessEvent: EventHandler['preProcessEvent'];
  processEvent: EventHandler['processEvent'];
  postProcessEvent: EventHandler['postProcessEvent'];
}
