import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { importProvidersFrom } from '@angular/core';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { RouteReuseStrategy } from '@angular/router';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { IonicStorageModule } from '@ionic/storage-angular';
import { CloudinaryModule } from '@cloudinary/ng';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './app/models/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firebaseAuthInterceptor } from './app/interceptor/firebaseAuthInterceptor';

defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      IonicModule.forRoot(),
      AppRoutingModule,
      IonicStorageModule.forRoot(),
      CloudinaryModule
    ),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideHttpClient(withInterceptors([firebaseAuthInterceptor])),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
}).catch(err => console.error(err));
