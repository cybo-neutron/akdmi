export interface EventHandler {
  preProcessEvent?(event: any): Promise<void>;
  processEvent(event: any): Promise<void>;
  postProcessEvent?(event: any): Promise<void>;
}

export interface Consumer {
  running: boolean;
  stop(): Promise<void>;
  init(): Promise<void>;
  preProcessEvent: EventHandler['preProcessEvent'];
  processEvent: EventHandler['processEvent'];
  postProcessEvent: EventHandler['postProcessEvent'];
}
