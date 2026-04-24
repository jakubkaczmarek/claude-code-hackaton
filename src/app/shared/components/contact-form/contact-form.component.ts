import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Agent } from '../../../core/models/agent.model';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredContact: 'email' | 'phone';
  viewingDate: string;
}

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact-form.component.html',
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
    viewingDate: '',
  };

  readonly submitted = signal(false);
  readonly showSuccess = signal(false);
  readonly showErrors = signal(false);

  submitForm(form: NgForm): void {
    this.submitted.set(true);
    if (form.valid) {
      this.showSuccess.set(true);
      this.showErrors.set(false);
    } else {
      this.showErrors.set(true);
    }
  }
}
