import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { IttopService } from '../ittop.service';
import{ FormGroup,Validators, FormBuilder} from '@angular/forms';
import { User } from 'models/user';
import { Router } from '@angular/router';
declare var RazorpayCheckout:any;

@Component({
  selector: 'app-online-registration',
  templateUrl: './online-registration.page.html',
  styleUrls: ['./online-registration.page.scss'],
})

//razor_secret=HRrxX8Rhb3b3K3Wurle0UHkf
export class OnlineRegistrationPage implements OnInit {

  registrationForm:FormGroup;
  submitted = false;
  err:string="";
  userDetails:User={} as User;
  paymentAmount:number=10;
  currency="INR";
  currencyIcon="₹";
  //razor_key="HRrxX8Rhb3b3K3Wurle0UHkf";
  razor_key="rzp_test_tKmGlTQpVe7iyL";
  constructor(private us:IttopService,private alrt:AlertController,private fb:FormBuilder,private router:Router) { }

  ngOnInit() {
    this.registrationForm = this.fb.group({
      email:    ['', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])],
      name: ['',Validators.required],
      rollno: ['', Validators.required],
      college: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(10),Validators.maxLength(10)]],
    });
  }

  get f() { 
    return this.registrationForm.controls; 
  }  

  call(){
    console.log(this.paymentAmount);
  }


  createCode(){
    this.submitted = true;
    if (this.registrationForm.invalid) {
        return;
    }
    this.us.validEmail({email:this.registrationForm.value.email}).subscribe(data=>{
      console.log(data);
      if(data==true){
        this.userDetails.email=this.registrationForm.value.email;
        this.paywithRazor();
      }
      else{
        alert('enter valid email address');
      }
    })
  }   


  paywithRazor(){
    this.userDetails.name=this.registrationForm.value.name;
    this.userDetails.email=this.registrationForm.value.email;
    this.userDetails.phone=this.registrationForm.value.phone;
    this.userDetails.college=this.registrationForm.value.college;
    this.userDetails.rollno=this.registrationForm.value.rollno;
    var paymentAmount=this.paymentAmount
    var options = {
      description: 'Payment',
      image: 'https://res.cloudinary.com/dmm4awbwm/image/upload/v1591517273/favicon_pbwxru.jpg', 
      currency: this.currency, // your 3 letter currency code
      key: this.razor_key, // your Key Id from Razorpay dashboard
      amount: this.paymentAmount, // Payment amount in smallest denomiation e.g. cents for USD
      name: 'Ecficio',
      prefill: {
        email: this.registrationForm.value.email,
        contact: this.registrationForm.value.phone,
        name: this.registrationForm.value.name
      },
      theme: {
        color: '#F37254'
      },
      modal: {
        ondismiss: function () {
          alert('dismissed')
        }
      }
    };
    
    var successCallback = function (payment_id) {
      this.userDetails.tid=payment_id;
      this.userDetails.paymentAmount=paymentAmount;
      this.userDetails.paid=true;
      this.userDetails.timestamp=new Date();
      this.us.addUser(this.userDetails).subscribe((data)=>{
        if(data['message']=='already exists'){
          alert("email already registered");
        }
        else if(data['message']=='success'){
          alert("receipt:"+data['receipt']);
          this.router.navigate(['online-registration/',data['receipt']]);
        }
        else{
          alert('some error occured');
        }
      });
      //alert('payment_id: ' + payment_id);
    };

    var cancelCallback = function (error) {      
      alert(error.description + ' (Error ' + error.code + ')');
    };

    RazorpayCheckout.open(options, successCallback, cancelCallback);
    
  }
}
