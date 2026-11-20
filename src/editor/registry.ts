import { FieldType } from '../core/types'
import {
  Type,
  Mail,
  Lock,
  Hash,
  Phone,
  Link,
  AlignLeft,
  ListFilter,
  CheckSquare,
  Radio,
  ToggleLeft,
  Sliders,
  Calendar,
  Clock,
  Grid3X3,
  Rows3,
  Heading,
  FileText,
  Minus,
  PlaySquare,
  Image as ImageIcon,
  Hexagon,
  UserCircle2,
  Columns3,
} from 'lucide-react'

export interface FieldDefinition {
  type: FieldType
  label: string
  description: string
  category: 'input' | 'choice' | 'advanced' | 'layout'
  icon: any
}

export const FIELD_REGISTRY: FieldDefinition[] = [
  // Standard Inputs
  {
    type: 'text',
    label: 'Text Input',
    description: 'Single-line plain text',
    category: 'input',
    icon: Type,
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Email address with validation',
    category: 'input',
    icon: Mail,
  },
  {
    type: 'password',
    label: 'Password',
    description: 'Masked password entry',
    category: 'input',
    icon: Lock,
  },
  {
    type: 'number',
    label: 'Number',
    description: 'Numeric values only',
    category: 'input',
    icon: Hash,
  },
  {
    type: 'phone',
    label: 'Phone',
    description: 'Telephone number',
    category: 'input',
    icon: Phone,
  },
  {
    type: 'url',
    label: 'Website URL',
    description: 'URL link address',
    category: 'input',
    icon: Link,
  },
  {
    type: 'textarea',
    label: 'Textarea',
    description: 'Multi-line expanded text',
    category: 'input',
    icon: AlignLeft,
  },

  // Choices & Selection
  {
    type: 'select',
    label: 'Select Dropdown',
    description: 'Single option picker',
    category: 'choice',
    icon: ListFilter,
  },
  {
    type: 'radio-group',
    label: 'Radio Group',
    description: 'Single choice list',
    category: 'choice',
    icon: Radio,
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    description: 'Single toggle checkbox',
    category: 'choice',
    icon: CheckSquare,
  },
  {
    type: 'switch',
    label: 'Switch',
    description: 'Toggle switch slider',
    category: 'choice',
    icon: ToggleLeft,
  },
  {
    type: 'slider',
    label: 'Range Slider',
    description: 'Numeric slider range',
    category: 'choice',
    icon: Sliders,
  },

  // Advanced & Complex Controls
  {
    type: 'date',
    label: 'Date Picker',
    description: 'Date selection input',
    category: 'advanced',
    icon: Calendar,
  },
  {
    type: 'time',
    label: 'Time Picker',
    description: 'Time selection input',
    category: 'advanced',
    icon: Clock,
  },
  {
    type: 'table-matrix',
    label: 'Table Matrix',
    description: 'Multi-criteria evaluation grid',
    category: 'advanced',
    icon: Grid3X3,
  },
  {
    type: 'repeat-row',
    label: 'Repeatable Row',
    description: 'Dynamic item repeater array',
    category: 'advanced',
    icon: Rows3,
  },

  // Layout & Content
  {
    type: 'heading',
    label: 'Heading',
    description: 'Section title text',
    category: 'layout',
    icon: Heading,
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    description: 'Help text or instructions',
    category: 'layout',
    icon: FileText,
  },
  {
    type: 'separator',
    label: 'Divider',
    description: 'Horizontal divider line',
    category: 'layout',
    icon: Minus,
  },
  {
    type: 'button',
    label: 'Action Button',
    description: 'Custom clickable button',
    category: 'layout',
    icon: PlaySquare,
  },
  {
    type: 'logo',
    label: 'Brand Logo',
    description: 'Header logo image or icon',
    category: 'layout',
    icon: Hexagon,
  },
  {
    type: 'image',
    label: 'Image Banner',
    description: 'Visual banner illustration',
    category: 'layout',
    icon: ImageIcon,
  },
  {
    type: 'avatar',
    label: 'Circular Avatar',
    description: 'Agent or user profile avatar',
    category: 'layout',
    icon: UserCircle2,
  },
  {
    type: 'row-layout',
    label: 'Row & Columns',
    description: 'Draggable nested multi-column grid',
    category: 'layout',
    icon: Columns3,
  },
]
