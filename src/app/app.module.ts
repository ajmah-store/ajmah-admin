import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { AppStoreModule } from './store/app-store.module';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SidebarComponent } from './partials/sidebar/sidebar.component';
import { TitlebarComponent } from './partials/titlebar/titlebar.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ProductsPageComponent } from './pages/products-page/products-page.component';
import { OffcanvasComponent } from './components/offcanvas/offcanvas.component';
import { AddProductComponent } from './partials/add-product/add-product.component';
import { InputTextComponent } from './components/input-text/input-text.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    TitlebarComponent,
    DashboardPageComponent,
    HomePageComponent,
    ProductsPageComponent,
    OffcanvasComponent,
    AddProductComponent,
    InputTextComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AppStoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
