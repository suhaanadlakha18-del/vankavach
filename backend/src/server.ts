import {createApp} from './app.js';import {env} from './config/env.js';import {seed} from './db/seed.js';
seed();const server=createApp().listen(env.PORT,env.HOST,()=>console.log(`VAN-GUARD API listening on http://${env.HOST}:${env.PORT}/api/v1 in ${env.DATA_MODE} mode`));
const shutdown=()=>server.close(()=>process.exit(0));process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
