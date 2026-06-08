import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackStatus } from '../../core/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="statusClass">
      <span class="inline-block w-1.5 h-1.5 rounded-full mr-1.5" [ngClass]="dotClass"></span>
      {{ label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() status!: FeedbackStatus;

  get label() {
    const map: Record<FeedbackStatus, string> = {
      OPEN: 'Open', IN_REVIEW: 'In Review', PLANNED: 'Planned', RESOLVED: 'Resolved', DECLINED: 'Declined',
    };
    return map[this.status] || this.status;
  }

  get statusClass() {
    return `status-${this.status.toLowerCase()}`;
  }

  get dotClass() {
    const map: Record<FeedbackStatus, string> = {
      OPEN: 'bg-blue-400', IN_REVIEW: 'bg-amber-400', PLANNED: 'bg-violet-400',
      RESOLVED: 'bg-green-400', DECLINED: 'bg-red-400',
    };
    return map[this.status];
  }
}
