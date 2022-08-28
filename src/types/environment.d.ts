export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEBUG: string;
      TOKEN: string;
      OTHER_TOKEN: string;
      TOPGG_TOKEN: string;
      WEBHOOK_TOKEN: string;
      DB_PASSWORD: string;
      DB_USER: string;
      PERSPECTIVE_API_KEY: string;
      CLUSTER_MANAGER_TOKEN: string;
      ALEKEAGLE_ME_TOKEN: string;
      MESS_WITH_ALEK_TOKEN: string;
      CLUSTERS: string;
      CLUSTER_ID: string;
      GB_MEM: string;
    }
  }
}
