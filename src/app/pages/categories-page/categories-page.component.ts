import { Component, OnInit, OnDestroy } from '@angular/core';
import { offCanvasFrames } from '../../constants';
import { Store } from '@ngxs/store';
import { ToggleOffCanvas, CreateAlert, CreateConfirm, DismissConfirm, ChangeOffCanvas } from '../../store/actions/ui.actions';
import { Observable, Subscription } from 'rxjs';
import { ArrayList } from '@arjunatlast/jsds';
import { Category } from '../../models/category.model';
import { ProductService } from '../../services/product.service';

import { Chart } from "chart.js"
import { chartColors, randomData } from '../../helpers';
import { ALERT_TYPES } from '../../models/alert.model';

@Component({
  selector: 'app-categories-page',
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.scss']
})
export class CategoriesPageComponent implements OnInit, OnDestroy {

  frameId = offCanvasFrames;

  categories = new ArrayList<Category>();

  //currently editing category
  categoryEditted: Category;

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

  deleteCategory(category:Category) {

    //check if the category is empty
    if(category.productCount !== 0) {

      //alert error
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.DANGER,
        title: 'Illegal Operation',
        content: 'Cannot delete a category with associated products.'
      }));

    }

    else {

      //open confirm box
      this.store.dispatch(new CreateConfirm({
        title: 'Delete Category',
        content: `Are you sure you wan't to delete the category '${category.name}'. This action cannot be undone`,
        okButton: {
          text: 'Delete',
          onClick: () => {

            //delete the category
            this.ps.deleteCategory(category);

            //dismiss confirm box
            this.store.dispatch(new DismissConfirm());

          }
        },
        cancelButton: {
          text: 'Cancel',
          onClick: () => {

            //dismiss confirm box
            this.store.dispatch(new DismissConfirm());

          }
        }
      }))
    }

  }

  editCategory(category: Category) {

    //set currently edited category
    this.categoryEditted = category;

    //open edit window
    this.store.dispatch(new ChangeOffCanvas(this.frameId.editCategory));

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


      //if chart not already initialized
      if(!this.productCountChart) {

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
            responsiveAnimationDuration: 300
          }
        });

      }

      else {

        //update the chart
        const lab:any[] = this.productCountChart.data.labels;
        const dat:any[] = this.productCountChart.data.datasets[0].data;
        lab.splice(0, lab.length, ...labels);
        dat.splice(0, dat.length, ...count);
        this.productCountChart.update();
        
      }

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

      //if chart not alread initialized
      if(!this.salesChart) {

        //initialize chart
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
            responsiveAnimationDuration: 300
          }
        });

      }

      else {

        //update chart labels and datas
        const lab:any[] = this.salesChart.data.labels;
        const dat:any[] = this.salesChart.data.datasets[0].data;
        lab.splice(0, lab.length, ...labels);
        dat.splice(0, dat.length, ...sales);
        this.salesChart.update();

      }

    }

  }

  ngOnDestroy() {

    //unsubscribe from all subscriptions
    this.subscriptions.forEach(
      subs => subs.unsubscribe()
    );
  }

}
