import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from "angularfire2/auth";

import { AppStoreModule } from './store/app-store.module';
import { firebase } from '../private/firebase.config';
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
import { InputImageComponent } from './components/input-image/input-image.component';
import { InputSelectComponent } from './components/input-select/input-select.component';
import { InputCurrencyComponent } from './components/input-currency/input-currency.component';
import { DropzoneDirective } from './directives/dropzone.directive';
import { ProgressButtonComponent } from './components/progress-button/progress-button.component';
import { AlertComponent } from './components/alert/alert.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { RangePipe } from './pipes/range.pipe';
import { CategoriesPageComponent } from './pages/categories-page/categories-page.component';
import { AddCategoryComponent } from './partials/add-category/add-category.component';
import { InputSwitchComponent } from './components/input-switch/input-switch.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { EditProductComponent } from './partials/edit-product/edit-product.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { EditCategoryComponent } from './partials/edit-category/edit-category.component';
import { DragItemDirective } from './directives/drag-item.directive';
import { DiscountsPageComponent } from './pages/discounts-page/discounts-page.component';
import { InputRangeComponent } from './components/input-range/input-range.component';

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
    InputImageComponent,
    InputSelectComponent,
    InputCurrencyComponent,
    DropzoneDirective,
    ProgressButtonComponent,
    AlertComponent,
    DataTableComponent,
    RangePipe,
    CategoriesPageComponent,
    AddCategoryComponent,
    InputSwitchComponent,
    ConfirmComponent,
    EditProductComponent,
    LoginPageComponent,
    EditCategoryComponent,
    DragItemDirective,
    DiscountsPageComponent,
    InputRangeComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(firebase),
    AngularFirestoreModule.enablePersistence(),//offline data
    AngularFireStorageModule,
    AngularFireAuthModule,
    AppStoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
