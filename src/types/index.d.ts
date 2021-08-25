import ECH from 'eris-command-handler';
declare namespace NodeJS {
  export interface ProcessEnv {
    token: string;
    otherToken: string;
    topGGToken: string;
    iftttToken: string;
    webhookToken: string;
    serverPass: string;
    perspectiveKey: string;
    grafanaToken: string;
    alekeagleMEToken: string;
    DEBUG: string;
  }
}

 export declare interface CommandModule {
    name: string;

    handler: ECH.CommandGenerator;

    options?: ECH.CommandOptions;
  }

  export declare interface EventModule {
    name: string;

    handler: (...args: any[]) => void;
  }