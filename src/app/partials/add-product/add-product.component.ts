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
import { CreateAlert } from '../../store/actions/ui.actions';
import { ALERT_TYPES } from '../../models/alert.model';

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

  addTask: Promise<void>;

  //showProgress: boolean = false;

  constructor(
    private store:Store, private ps: ProductService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.categories$ = this.ps.getCategories().pipe(map(
      (categories) => {
        return categories.map(category => ({value: category.id, content: category.name, image: category.imageUrl}));
      }
    ));
    
    this.createProductForm();
  }

  createProductForm() {
    this.productForm = this.fb.group({
      'name': ['', Validators.compose([Validators.required, Validators.pattern("[A-Za-z_][A-Za-z0-9_ ]*")])],
      'featured': [false, Validators.required],
      'category': ['', Validators.required],
      'price': ['', Validators.compose([Validators.required, Validators.pattern("[0-9]*(\.[0-9]*)?")])],
      'unit': ['', Validators.required],
      'description': ['', Validators.required],
      'discount': [0, Validators.compose([Validators.required, Validators.min(0), Validators.max(100)])]
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
    return control.invalid && control.dirty;
  }


  addProduct() {

    //check validity
    if(this.productForm.valid && this.featuredImage) {
      //create product object
      let formValue = this.productForm.value;
      
      let product:Product = {
        id: null,
        featuredImageUrl: null,
        featured: formValue.featured,
        name: formValue.name.trim(),
        category: formValue.category,
        price: parseFloat(formValue.price),
        unit: formValue.unit.trim(),
        description: formValue.description.trim(),
        discount: Math.abs(parseInt(formValue.discount)%100)
      };

      //call addProduct
      this.addTask = this.ps.addProduct(product, this.featuredImage);

    }
    else {

      //alert error
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.DANGER,
        title: 'Error!',
        content: 'Invalid credentials'
      }));

    }

    
    // this.addTask = new Promise((resolve, reject) => {
    //   setTimeout(() => {reject()}, 5000);
    // });

  }

  // resetForm() {
  //   this.productForm.reset();
  //   this.featuredImageInput.reset();
  // }

}
