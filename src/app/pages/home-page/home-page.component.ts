import { Component, OnInit } from '@angular/core';
import { randomData, chartColors } from '../../helpers';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  salesChart:any;

  constructor() { }

  ngOnInit() {
    this.createSalesChart();
  }

  createSalesChart() {

    //get labels and sales
    let labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let sales1 = randomData(12,10,500);
    let sales2 = randomData(12,10,500);

    //create chart
    if(!this.salesChart) {

      this.salesChart = new Chart('sales_chart', {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              data: sales1,
              borderColor: '#EC407A',
              backgroundColor: '#EC407A',
              fill: false,
              label: '2018',
            },
            {
              data: sales2,
              borderColor: '#29B6F6',
              borderDash: [5,5],
              backgroundColor: '#29B6F6',
              fill: false,
              label: '2017',
            }
          ]
        },
        options: {
          responsive: true,
          legend: {
            position: 'top'
          },
          responsiveAnimationDuration: 300,
          tooltips: {
            mode: 'index',
            intersect: true
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
          scales: {
            xAxes: [{
              display: true
            }],
            yAxes: [{
              display: true
            }]
          }
        }
      });

    }
  }

}
