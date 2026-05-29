
export type Language = 'en' | 'bn';

export enum DonationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Donation {
  id: string;
  donorName: string;
  isAnonymous: boolean;
  amount: number;
  phone: string;
  email?: string; // Optional email field
  transactionId: string;
  purpose: string;
  status: DonationStatus;
  date: string;
  paymentMethod: string;
}

export interface Leadership {
  id: string;
  nameEn: string;
  nameBn: string;
  designationEn: string;
  designationBn: string;
  subDesignationEn?: string;
  subDesignationBn?: string;
  messageEn: string;
  messageBn: string;
  phone: string;
  image: string; // URL or Base64
  order: number;
  category?: 'leader' | 'executive' | 'advisor' | 'volunteer' | 'member';
  status?: 'active' | 'inactive';
  createdAt?: string;
}

export interface Event {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  locationEn: string;
  locationBn: string;
  date: string;
  image: string; // Base64 encoded
  meetUrl?: string; // Optional Google Meet URL
}

export interface Notice {
  id: string;
  titleEn: string;
  titleBn: string;
  contentEn: string;
  contentBn: string;
  date: string;
  isUrgent: boolean;
}

export interface News {
  id: string;
  titleEn: string;
  titleBn: string;
  contentEn: string;
  contentBn: string;
  date: string;
  image: string;
}

export interface OrganizationSettings {
  nameBn: string;
  nameEn: string;
  sloganBn: string;
  sloganEn: string;
  addressBn: string;
  addressEn: string;
  phone: string;
  email: string;
  establishedBn: string;
  establishedEn: string;
  logo: string;
  flag: string;
  adminWhatsApp: string;
  bkash: string;
  nagad: string;
  roket: string;
  facebook: string;
  youtube: string;
  whatsappChannel: string;
}

export interface LetterheadConfig {
  leaderName: string;
  designation: string;
  signature: string;
  stampText: string;
  bodyText: string; // Document content
}

export interface Testimonial {
  id: string;
  nameEn: string;
  nameBn: string;
  roleEn: string;
  roleBn: string;
  locationEn: string;
  locationBn: string;
  quoteEn: string;
  quoteBn: string;
  image: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED';
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  descriptionEn: string;
  descriptionBn: string;
  date: string;
}

