import { FormBuilderSchema } from '../core/types'

export interface FormTemplate {
  id: string
  title: string
  description: string
  schema: FormBuilderSchema
}

export const TEMPLATES: FormTemplate[] = [
  {
    id: 'customer-feedback',
    title: 'Customer Feedback Survey',
    description: 'Single-page feedback form with conditional improvement questions & evaluation matrix',
    schema: {
      id: 'template_feedback',
      version: '1.0.0',
      title: 'Customer Satisfaction Survey',
      description: 'We value your honest feedback to improve our services.',
      settings: {
        submitButtonText: 'Submit Feedback',
        showResetButton: true,
        resetButtonText: 'Clear',
        layout: 'standard',
        labelPosition: 'top',
        theme: 'system',
        showProgressBar: false,
        allowPageNavigation: true,
      },
      pageOrder: ['page_1'],
      pages: {
        page_1: {
          id: 'page_1',
          title: 'Feedback',
          rowIds: ['row_1', 'row_2', 'row_3', 'row_4'],
        },
      },
      rows: {
        row_1: {
          id: 'row_1',
          columnIds: ['col_1', 'col_2'],
        },
        row_2: {
          id: 'row_2',
          columnIds: ['col_3'],
        },
        row_3: {
          id: 'row_3',
          columnIds: ['col_4'],
        },
        row_4: {
          id: 'row_4',
          columnIds: ['col_5'],
        },
      },
      columns: {
        col_1: { id: 'col_1', width: 6, fieldIds: ['f_name'] },
        col_2: { id: 'col_2', width: 6, fieldIds: ['f_email'] },
        col_3: { id: 'col_3', width: 12, fieldIds: ['f_rating', 'f_improve'] },
        col_4: { id: 'col_4', width: 12, fieldIds: ['f_matrix'] },
        col_5: { id: 'col_5', width: 12, fieldIds: ['f_comments'] },
      },
      fields: {
        f_name: {
          id: 'f_name',
          type: 'text',
          name: 'full_name',
          label: 'Full Name',
          placeholder: 'Jane Doe',
          required: true,
        },
        f_email: {
          id: 'f_email',
          type: 'email',
          name: 'email',
          label: 'Email Address',
          placeholder: 'jane@example.com',
          required: true,
        },
        f_rating: {
          id: 'f_rating',
          type: 'radio-group',
          name: 'overall_satisfaction',
          label: 'How satisfied are you with our service?',
          required: true,
          options: [
            { label: '⭐ Very Dissatisfied', value: '1' },
            { label: '⭐⭐ Dissatisfied', value: '2' },
            { label: '⭐⭐⭐ Neutral', value: '3' },
            { label: '⭐⭐⭐⭐ Satisfied', value: '4' },
            { label: '⭐⭐⭐⭐⭐ Very Satisfied', value: '5' },
          ],
          defaultValue: '4',
        },
        f_improve: {
          id: 'f_improve',
          type: 'textarea',
          name: 'improvement_feedback',
          label: 'What could we improve?',
          placeholder: 'Please tell us what went wrong and how we can do better...',
          required: true,
          conditions: [
            {
              logic: 'OR',
              action: 'show',
              rules: [
                { fieldId: 'f_rating', operator: 'equals', value: '1' },
                { fieldId: 'f_rating', operator: 'equals', value: '2' },
              ],
            },
          ],
        },
        f_matrix: {
          id: 'f_matrix',
          type: 'table-matrix',
          name: 'feature_ratings',
          label: 'Rate Specific Features',
          matrixConfig: {
            cellType: 'radio',
            rows: [
              { id: 'r1', label: 'Speed & Performance', value: 'speed' },
              { id: 'r2', label: 'UI Simplicity', value: 'ui' },
              { id: 'r3', label: 'Customer Support', value: 'support' },
            ],
            columns: [
              { id: 'c1', label: 'Poor', value: '1' },
              { id: 'c2', label: 'Fair', value: '2' },
              { id: 'c3', label: 'Good', value: '3' },
              { id: 'c4', label: 'Excellent', value: '4' },
            ],
          },
        },
        f_comments: {
          id: 'f_comments',
          type: 'textarea',
          name: 'general_comments',
          label: 'Additional Remarks',
          placeholder: 'Any other thoughts or suggestions...',
        },
      },
    },
  },
  {
    id: 'job-application',
    title: 'Job Application (Multi-Step)',
    description: '3-Step application wizard with repeatable employment history',
    schema: {
      id: 'template_job_app',
      version: '1.0.0',
      title: 'Senior Software Engineer Application',
      description: 'Complete the steps below to submit your job application.',
      settings: {
        submitButtonText: 'Submit Application',
        showResetButton: false,
        layout: 'standard',
        labelPosition: 'top',
        theme: 'system',
        showProgressBar: true,
        allowPageNavigation: true,
      },
      pageOrder: ['p_personal', 'p_experience', 'p_preferences'],
      pages: {
        p_personal: {
          id: 'p_personal',
          title: 'Personal Info',
          description: 'Step 1: Your contact & profile information',
          rowIds: ['r_p1', 'r_p2'],
        },
        p_experience: {
          id: 'p_experience',
          title: 'Experience',
          description: 'Step 2: Employment history',
          rowIds: ['r_exp'],
        },
        p_preferences: {
          id: 'p_preferences',
          title: 'Preferences',
          description: 'Step 3: Availability & work setup',
          rowIds: ['r_pref1', 'r_pref2'],
        },
      },
      rows: {
        r_p1: { id: 'r_p1', columnIds: ['c_name', 'c_email'] },
        r_p2: { id: 'r_p2', columnIds: ['c_phone', 'c_linkedin'] },
        r_exp: { id: 'r_exp', columnIds: ['c_repeat'] },
        r_pref1: { id: 'r_pref1', columnIds: ['c_notice', 'c_remote'] },
        r_pref2: { id: 'r_pref2', columnIds: ['c_notes'] },
      },
      columns: {
        c_name: { id: 'c_name', width: 6, fieldIds: ['f_app_name'] },
        c_email: { id: 'c_email', width: 6, fieldIds: ['f_app_email'] },
        c_phone: { id: 'c_phone', width: 6, fieldIds: ['f_app_phone'] },
        c_linkedin: { id: 'c_linkedin', width: 6, fieldIds: ['f_app_linkedin'] },
        c_repeat: { id: 'c_repeat', width: 12, fieldIds: ['f_jobs_array'] },
        c_notice: { id: 'c_notice', width: 6, fieldIds: ['f_notice'] },
        c_remote: { id: 'c_remote', width: 6, fieldIds: ['f_remote'] },
        c_notes: { id: 'c_notes', width: 12, fieldIds: ['f_why_us'] },
      },
      fields: {
        f_app_name: {
          id: 'f_app_name',
          type: 'text',
          name: 'full_name',
          label: 'Legal Full Name',
          placeholder: 'Alex Morgan',
          required: true,
        },
        f_app_email: {
          id: 'f_app_email',
          type: 'email',
          name: 'email',
          label: 'Email',
          placeholder: 'alex@domain.com',
          required: true,
        },
        f_app_phone: {
          id: 'f_app_phone',
          type: 'phone',
          name: 'phone',
          label: 'Phone Number',
          placeholder: '+1 (555) 000-0000',
          required: true,
        },
        f_app_linkedin: {
          id: 'f_app_linkedin',
          type: 'url',
          name: 'linkedin_url',
          label: 'LinkedIn Profile URL',
          placeholder: 'https://linkedin.com/in/...',
        },
        f_jobs_array: {
          id: 'f_jobs_array',
          type: 'repeat-row',
          name: 'past_jobs',
          label: 'Previous Roles & Experience',
          repeatRowConfig: {
            minRows: 1,
            maxRows: 4,
            addButtonText: 'Add Another Role',
            removeButtonText: 'Remove',
            fieldTemplate: [
              {
                id: 'tmpl_title',
                type: 'text',
                name: 'job_title',
                label: 'Job Title',
                placeholder: 'e.g. Senior Frontend Engineer',
                required: true,
              },
              {
                id: 'tmpl_company',
                type: 'text',
                name: 'company_name',
                label: 'Company Name',
                placeholder: 'e.g. Acme Corp',
                required: true,
              },
            ],
          },
        },
        f_notice: {
          id: 'f_notice',
          type: 'select',
          name: 'notice_period',
          label: 'Notice Period',
          options: [
            { label: 'Immediate', value: 'immediate' },
            { label: '2 Weeks', value: '2_weeks' },
            { label: '1 Month', value: '1_month' },
            { label: '2+ Months', value: '2_months' },
          ],
          defaultValue: '2_weeks',
        },
        f_remote: {
          id: 'f_remote',
          type: 'switch',
          name: 'remote_only',
          label: 'Open to Remote Only?',
          defaultValue: true,
        },
        f_why_us: {
          id: 'f_why_us',
          type: 'textarea',
          name: 'cover_note',
          label: 'Why are you interested in this role?',
          placeholder: 'Tell us a bit about yourself and your career goals...',
        },
      },
    },
  },
]
