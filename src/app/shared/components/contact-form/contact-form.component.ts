import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Agent } from '../../../core/models/agent.model';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredContact: 'email' | 'phone';
  viewingDate: Date | null;
}

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatRadioModule, MatDatepickerModule, MatNativeDateModule, MatIconModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormComponent {
  agent = input.required<Agent>();

  formData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredContact: 'email',
    viewingDate: null,
  };

  readonly showSuccess = signal(false);

  submitForm(form: NgForm): void {
    form.form.markAllAsTouched();
    if (form.valid) {
      this.showSuccess.set(true);
    }
  }

  reset(): void {
    this.showSuccess.set(false);
    this.formData = { name: '', email: '', phone: '', message: '', preferredContact: 'email', viewingDate: null };
  }
}
