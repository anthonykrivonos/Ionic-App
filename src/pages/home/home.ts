import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, Platform, Slides } from 'ionic-angular';

import { Speech } from '../../classes/speech';
import { Global } from '../../classes/global';
import { Contacts } from '../../classes/contacts';
import { Parser } from '../../classes/parser';

import { ArigatobuttonComponent } from '../../components/arigatobutton/arigatobutton';

import { Observable } from 'rxjs';

@Component({
  selector: 'page-home',
  providers: [Speech, Global, Contacts, Parser],
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
      @ViewChild(Slides) slides: Slides;

      first_name:string;
      last_name:string;
      picture:string;
      company:string;
      email:string;
      phone:string;
      notes:string;

      default:boolean = true;
      isAndroid:boolean;
      logger:boolean = true;
      loading:boolean = false;

      text:string;

      stored:any;

      slide:number = 0;

      constructor(public navCtrl: NavController, private speech:Speech, private plt:Platform, private global:Global, private contacts:Contacts, public parser:Parser) {
            this.global.logger('hide', () => {
                  this.hideLogger();
            });
            this.global.logger('show', () => {
                  this.showLogger();
            });
            this.global.storage('save', () => {
                  this.loadContacts();
            });
            this.global.livecard('delete', () => {
                  this.resetValues();
            });
      }

      ngOnInit():void {
            this.resetValues();
            this.isAndroid = this.plt.is('ios') ? false : true;
            Observable.timer(1000).take(1).subscribe(()=> {
                  this.loadContacts(false);
            });
      }

      slideTo(slide:number) {
            this.global.slides('hide');
            this.slides.slideTo(slide, 250);
      }

      changeSlide():void {
            this.slide = this.slides.getActiveIndex();
      }

      beginSpeech():void {
            if (this.default) {
                  this.default = !this.default;
                  this.resetValues();
            }
            this.loading = true;
            this.speech.listen((text) => {
                  this.text = text;
            });
      }

      endSpeech():void {
            this.loading = false;
            this.speech.stopListening(() => {
                  console.log("Started parse of text " + this.text);
                  var contactObj = this.parser.parse(this.text, this.unparseContactObj());
                  console.log("Ended parse " + JSON.stringify(contactObj, null, 2));
                  this.parseContactObj(contactObj);
            });
      }

      parseContactObj(contactObj:any):void {
            this.first_name = contactObj.first_name;
            this.last_name = contactObj.last_name;
            this.picture = contactObj.picture;
            this.company = contactObj.company;
            this.email = contactObj.email;
            this.phone = contactObj.phone;
            this.notes = contactObj.note;
      }

      unparseContactObj():any {
            return {
                  first_name: this.first_name,
                  last_name: this.last_name,
                  company: this.company,
                  phone: this.phone,
                  email: this.email,
                  picture: this.picture,
                  notes: this.notes
            };
      }

      showLogger():void {
            this.logger = true;
      }

      hideLogger():void {
            this.logger = false;
      }

      resetValues():void {
            this.default = true;
            this.first_name = "First";
            this.last_name = "Last";
            this.picture = "";
            this.company = "Arigato, Inc.";
            this.email = "me@arigato.com";
            this.phone = "(000)000-0000";
            this.notes = "Tap record to create a contact.";
      }

      nullValues():void {
            this.default = true;
            this.first_name = null;
            this.last_name = null;
            this.picture = null;
            this.company = null;
            this.email = null;
            this.phone = null;
            this.notes = null;
      }

      loadContacts(slide:boolean = true):void {
            this.contacts.getContacts((stored) => {
                  this.stored = stored;
                  this.slideTo(slide ? 1 : 0);
            });
      }

      deleteAll():void {
            this.contacts.unStoreContacts(()=>{
                  this.stored = [];
            });
      }
}
