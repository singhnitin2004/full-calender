import interactionPlugin from '@fullcalendar/interaction';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import multiMonthPlugin from '@fullcalendar/multimonth'
import { ModelComponent } from './model/model.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FullCalendarModule, ModelComponent, ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  @Output() formSubmitted = new EventEmitter<any>();
  title = 'demo-fullcalendar';
  card: boolean = false;
  isOpenForm: boolean = false;
  events: any[] = [];
  selectedDate: Date | null = null;
  updatedate: Date | null = null;
  selectedEvent: any;
  edit: boolean = false;
  form!: FormGroup;
  opneDrop: boolean = false;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, multiMonthPlugin, resourceTimelinePlugin],
    themeSystem: 'bootstrap5',
    initialView: 'multiMonthYear',
    multiMonthMaxColumns: 1,
    selectable: true,
    droppable: true,
    editable: true,
    events: [],
    select: this.calenderDateClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventClick: this.handleEventClick.bind(this),
  };

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchEvents();
    this.form = this.fb.group({
      id: [''],
      date: [''],
      event: [''],
      color: ['']
    });
  }

  onSubmit() {
    this.http.post<any>('http://localhost:3000/submit-form', this.form.value)
      .subscribe({
        next: () => {
          this.form.reset({
            date: '',
            event: '',
            color: ''
          });
          this.isOpenForm = false;
          this.fetchEvents();
        },
        error: error => {
          console.error('Error submitting data', error);
        }
      });
  }

  fetchEvents() {
    const timestamp = new Date().getTime();
    this.http.get<any[]>(`http://localhost:3000/events?timestamp=${timestamp}`)
      .subscribe({
        next: data => {
          if (!data) { return; }
          this.events = data.map((event: any) => ({
            id: event.id,
            title: event.event,
            date: event.date ? event.date.split('T')[0] : null,
            color: event.color,
          }));
          this.calendarOptions.events = this.events;
        },
        error: error => {
          console.error('Error retrieving events', error);
        }
      });
  }

  calenderDateClick(arg: any) {
    this.edit = false;
    this.isOpenForm = true;
    this.selectedDate = new Date(arg.startStr);
    this.form.patchValue({
      date: this.selectedDate.toISOString().split('T')[0],
      event: '',
      color: '#2563eb'
    });
  }

  handleEventDrop(info: any) {
    const updatedEvent = {
      id: info.event.id,
      event: info.event.title,
      date: info.event.startStr,
      color: info.event.backgroundColor
    };
    this.http.put<any>(`http://localhost:3000/drop-event/${updatedEvent.id}`, updatedEvent)
      .subscribe({
        next: () => {
          console.log('Event dropped successfully');
        },
        error: error => {
          console.error('Error updating event', error);
        }
      });
  }

  handleEventClick(info: any) {
    this.isOpenForm = false;
    this.opneDrop = true;
    this.selectedEvent = info.event;
    console.log("🚀 ~ AppComponent ~ handleEventClick ~ selectedEvent:", this.selectedEvent)
  }

  deleteEvent(eventId: any) {
    alert(`Are you sure you want to delete this event from the database and delete it from the database  ${eventId ? `${eventId}` : ''}`)
    this.http.delete<any>(`http://localhost:3000/delete-event/${eventId}`)
      .subscribe({
        next: () => {
          console.log('Event deleted successfully');
          const index = this.events.findIndex(event => event.id === eventId);
          if (index !== -1) {
            this.events.splice(index, 1);
          }
          this.fetchEvents();
        },
        error: error => {
          console.error('Error deleting event', error);
        }
      });
    this.isOpenForm = false;
    this.opneDrop = false;
  }

  updateEvent(event: any) {
    console.log(event);
    this.isOpenForm = true;
    this.opneDrop = false;
    this.edit = true;
    this.http.get<any>(`http://localhost:3000/fetch-event/${event._def.publicId}`)
      .subscribe({
        next: (existingEventData) => {
          console.log('Existing event data:', existingEventData);
          this.form.patchValue({
            id: existingEventData.id,
            date: existingEventData.date,
            event: existingEventData.event,
            color: existingEventData.color
          });
          this.fetchEvents();
        },
        error: error => {
          console.error('Error fetching event data', error);
        }
      });
  }

  editData() {
    const updatedEventData = this.form.value;
    this.http.put<any>(`http://localhost:3000/update-event/${updatedEventData.id}`, updatedEventData)
      .subscribe({
        next: () => {
          console.log('Event updated successfully');
          this.fetchEvents();
          this.isOpenForm = false;
        },
        error: error => {
          console.error('Error updating event', error);
        }
      });
  }
}
