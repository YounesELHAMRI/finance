import { z } from 'zod'

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Le nom est trop long'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide').optional(),
  icon: z.string().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

// Beneficiary validation
export const beneficiarySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  type: z.enum(['organization', 'individual', 'charity'], {
    required_error: 'Le type est requis',
  }),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
})

export type BeneficiaryFormData = z.infer<typeof beneficiarySchema>

// Donation validation
export const donationSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  date: z.date({
    required_error: 'La date est requise',
  }),
  description: z.string().optional(),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'check']).optional(),
  isRecurring: z.boolean().default(false),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  beneficiaryId: z.string().min(1, 'Le bénéficiaire est requis'),
})

export type DonationFormData = z.infer<typeof donationSchema>

// Made with Bob
