import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ApplicationRef } from '@angular/core';

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    const app = appRef.injector.get(ApplicationRef);

    app.isStable.subscribe((stable) => {
      if (stable) {
        const splash = document.getElementById('splash-screen');
        splash?.remove();
      }
    });
  })
  .catch((err) => console.error(err));
