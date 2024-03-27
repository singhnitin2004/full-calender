import { Component, Input, OnInit } from '@angular/core';
import { EventFormData } from '../app.inetrface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-model',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './model.component.html',
  styleUrl: './model.component.scss'
})
export class ModelComponent implements OnInit {
  @Input() formData!: EventFormData;

  form!: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      event: [this.formData ? this.formData.event || '' : '', Validators.required],
      color: [this.formData ? this.formData.color || '' : '']
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Form submitted with values:', this.form.value);
    } else {
      console.error('Form is invalid.');
    }
  }

}
