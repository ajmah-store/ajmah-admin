import { Component, OnInit, OnDestroy } from '@angular/core';
import { offCanvasFrames } from '../../constants';
import { Store } from '@ngxs/store';
import { ToggleOffCanvas } from '../../store/actions/ui.actions';
import { Observable, Subscription } from 'rxjs';
import { ArrayList } from '@arjunatlast/jsds';
import { Category } from '../../models/category.model';
import { ProductService } from '../../services/product.service';

import { Chart } from "chart.js"
import { chartColors, randomData } from '../../helpers';

@Component({
  selector: 'app-categories-page',
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.scss']
})
export class CategoriesPageComponent implements OnInit, OnDestroy {

  frameId = offCanvasFrames;

  categories = new ArrayList<Category>();

  //used to filter datatable
  searchTxt:string = '';

  //keep selected datas
  selectedCategories = new ArrayList<Category>();

  //datatable inputs
  datatableKeys = ["imageUrl:image","name","productCount:number"];
  datatableAttrs = ['Image', 'Name', 'Product Count'];

  //subscriptions
  private subscriptions:Subscription[] = [];

  //charts
  productCountChart:any;
  salesChart:any;

  constructor(
    private store: Store,
    private ps: ProductService
  ) { }

  ngOnInit() {

    //push each subscription to subscriptions so that we can unsubscribe at the end.
    this.subscriptions.push(

      //get categories
      this.ps.getCategoriesAsList().subscribe(
        categoryList => {

          //if categoryList exists
          if(categoryList) {

            //store it to categories
            this.categories = categoryList

            //create charts
            this.createProductCountChart(categoryList);
            this.createSalesChart(categoryList);

          }
        }
      )
    );

  }

  filteredCategories() {
    return this.categories.filter(category => !!category.name.toLowerCase().match(this.searchTxt.toLowerCase()));
  }

  isFrameOpened$(id:number):Observable<boolean> {
    return this.store.select(state => state.ui.offCanvasOpened == id);
  }

  toggleFrame(id:number) {
    this.store.dispatch(new ToggleOffCanvas(id));
  }

  private createProductCountChart(categories:ArrayList<Category>) {

    if(categories) {

      //categories size
      let size = categories.size();

      //extract data and labels
      let labels = [];
      let count = [];

      categories.forEach(
        (category: Category) => {
          labels.push(category.name);
          count.push(category.productCount);
        }
      );


      //create the product count chart
      this.productCountChart = new Chart('product_count_chart', {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: count,
            backgroundColor: chartColors(size,80,50,0.8),
          }],
        },
        options: {
          responsive: true,
          legend: {
            position: 'right',
          },
        }
      });

    }

  }

  /**
   * Create Sales / Category Chart
   */
  private createSalesChart(categories:ArrayList<Category>) {

    if(categories) {

      //size of categories
      let size = categories.size();

      //extract data and labels
      let labels = categories.toArray().map(x => x.name);
      let sales = randomData(size);

      this.salesChart = new Chart('sales_chart',{
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            data: sales,
            backgroundColor: chartColors(size,80,50,0.5),
            borderColor: chartColors(size),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          legend: {
            display: false
          },
        }
      })
    }

  }

  ngOnDestroy() {

    //unsubscribe from all subscriptions
    this.subscriptions.forEach(
      subs => subs.unsubscribe()
    );
  }

}
