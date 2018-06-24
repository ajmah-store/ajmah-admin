import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ProductsPageComponent } from './pages/products-page/products-page.component';
import { CategoriesPageComponent } from './pages/categories-page/categories-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { AuthGuard } from './guards/auth.guard';
import { DiscountsPageComponent } from './pages/discounts-page/discounts-page.component';

const routes: Routes = [
  {
    path: "dashboard",
    component: DashboardPageComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "home",
        component: HomePageComponent
      },
      {
        path: "products",
        component: ProductsPageComponent
      },
      {
        path: 'categories',
        component: CategoriesPageComponent
      },
      {
        path: 'discounts',
        component: DiscountsPageComponent
      },
      {
        path: "",
        redirectTo: "home",
        pathMatch: "full"
      },
      {
        path: "**",
        redirectTo: "home"
      }
    ]
  },
  {
    path: "login",
    component: LoginPageComponent
  },
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
