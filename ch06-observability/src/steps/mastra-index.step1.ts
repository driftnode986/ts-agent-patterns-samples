// 6.3 時点の src/mastra/index.ts (6.11 で置き換える)
// #region index-step1
// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';
import {
  Observability,
  MastraStorageExporter,
} from '@mastra/observability';

export const mastra = new Mastra({
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'my-agent-app',
        exporters: [new MastraStorageExporter()],
      },
    },
  }),
  storage: new LibSQLStore({
    id: 'mastra-storage',
    url: 'file:./mastra.db',
  }),
});
// #endregion
