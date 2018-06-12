import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store } from '@ngxs/store';

import { offCanvasFrames } from '../../constants';

import { ProductService } from '../../services/product.service';
import { SelectOption } from '../../components/input-select/input-select.component';

import { Product } from '../../models/product.model';
import { InputImageComponent } from '../../components/input-image/input-image.component';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {

  frameId = offCanvasFrames;
  featuredImage: File;

  @ViewChild(InputImageComponent) featuredImageInput: InputImageComponent;

  categories$: Observable<SelectOption[]>;

  productForm: FormGroup;

  taskChange$: Observable<number>;

  //showProgress: boolean = false;

  constructor(
    private store:Store, private ps: ProductService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.categories$ = this.ps.getCategories().pipe(map(
      (categories) => {
        return categories.map(category => ({value: category.id, content: category.name}));
      }
    ));

    console.log(this.categories$);
    

    this.createProductForm();
  }

  createProductForm() {
    this.productForm = this.fb.group({
      'name': ['', Validators.compose([Validators.required, Validators.pattern("[A-Za-z_][A-Za-z0-9_ ]*")])],
      'category': ['', Validators.required],
      'price': ['', Validators.compose([Validators.required, Validators.pattern("[0-9]*(\.[0-9]*)?")])],
      'description': ['', Validators.required]
    });
  }

  isFrameOpened$(val:number):Observable<boolean> {
    return this.store.select(state => state.ui.offCanvasOpened === val);
  }

  selectImage(ev:any) {
    this.featuredImage = ev.data;
  }

  isInvalid(controlName:string) {
    let control = this.productForm.controls[controlName];
    return control.invalid && !control.pristine;
  }


  addProduct() {

    //check validity
    if(this.productForm.valid && this.featuredImage) {
      //create product object
      let formValue = this.productForm.value;
      
      let product = {
        id: null,
        featuredImageUrl: null, 
        name: formValue.name.trim(),
        category: formValue.category,
        price: formValue.price,
        description: formValue.description.trim()
      };

      //call addProduct
      this.taskChange$ = this.ps.addProduct(product, this.featuredImage);

      this.taskChange$.toPromise().then(
        val => {
          if(val === 100) this.resetForm();
        }
      );
    }
    else {
      alert('Invalid Details');
    }

    // this.taskChange$ = new Observable(
    //   observer => {
    //     let i = 0;
    //     let fn = () => {
    //       observer.next(i);
    //       i++;
    //       (i <= 100) && setTimeout(fn, 50);
    //     };
    //     fn();
    //   }
    // );

  }

  resetForm() {
    this.productForm.reset();
    this.featuredImageInput.reset();
  }

}
